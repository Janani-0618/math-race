const { selectRandomQuestions } = require('./questions');

const MAX_PLAYERS = 30;
const TOTAL_QUESTIONS = 10; // questions per round (single source of truth)
const QUESTION_SECONDS = 15; // time per question (the ONLY place the duration is defined; clients receive it as durationMs)
const QUESTION_MS = QUESTION_SECONDS * 1000;
const GRACE_MS = 300; // network latency allowance
const RESULT_PAUSE_MS = Number(process.env.RESULT_PAUSE_MS) || 2500; // time to read the feedback + explanation before the next question
const BASE_POINTS = 100;
const MAX_BONUS = 50; // speed bonus for answering with the full timer left (scales down to 0 at the buzzer) – accuracy matters more than speed
const MAX_SCORE = TOTAL_QUESTIONS * (BASE_POINTS + MAX_BONUS);
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const rooms = new Map();

const blankStats = () => ({
  score: 0,
  correct: 0,
  answered: 0,
  attempts: 0,
  totalResponseTime: 0,
  answers: {},
});

const cleanName = (n) => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 16);

function randomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function publicPlayer(p) {
  return {
    id: p.id,
    name: p.name,
    score: p.score,
    correct: p.correct,
    answered: p.answered,
    attempts: p.attempts,
    avgTime: p.answered ? p.totalResponseTime / p.answered / 1000 : 0,
    connected: p.connected,
    progress: Math.min(100, (p.score / MAX_SCORE) * 100),
  };
}

function snapshot(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    total: TOTAL_QUESTIONS,
    maxPlayers: MAX_PLAYERS,
    maxScore: MAX_SCORE,
    questionSeconds: QUESTION_SECONDS,
    players: [...room.players.values()].map(publicPlayer),
  };
}

function register(io) {
  const emitRoom = (room) => io.to(room.code).emit('room_state', snapshot(room));

  const later = (room, fn, ms) => {
    const t = setTimeout(() => {
      room.timers.delete(t);
      fn();
    }, ms);
    room.timers.add(t);
    return t;
  };

  const destroyRoom = (room) => {
    room.timers.forEach(clearTimeout);
    room.timers.clear();
    clearTimeout(room.deleteTimer);
    room.players.forEach((p) => clearTimeout(p.removeTimer));
    rooms.delete(room.code);
  };

  const transferHost = (room) => {
    const host = room.players.get(room.hostId);
    if (host && host.connected) return;
    const next = [...room.players.values()].find((p) => p.connected);
    if (next) room.hostId = next.id;
  };

  const scheduleCleanup = (room) => {
    const anyone = [...room.players.values()].some((p) => p.connected);
    if (!anyone && rooms.has(room.code)) {
      clearTimeout(room.deleteTimer);
      room.deleteTimer = setTimeout(() => destroyRoom(room), 120000);
    }
  };

  const removePlayer = (room, p) => {
    clearTimeout(p.removeTimer);
    room.players.delete(p.id);
    if (room.players.size === 0) return destroyRoom(room);
    transferHost(room);
    emitRoom(room);
  };

  // ---------- game flow ----------
  const questionPayload = (room, remainingMs) => {
    const q = room.questions[room.qIndex];
    return {
      index: room.qIndex,
      total: TOTAL_QUESTIONS,
      id: q.id,
      category: q.category,
      icon: q.icon,
      difficulty: q.difficulty,
      text: q.question,
      options: q.options,
      durationMs: QUESTION_MS,
      remainingMs,
    };
  };

  const checkAllAnswered = (room) => {
    if (room.state !== 'PLAYING' || room.qClosed) return;
    const active = [...room.players.values()].filter((p) => p.connected);
    if (active.length > 0 && active.every((p) => p.answers[room.qIndex])) endQuestion(room);
  };

  function endQuestion(room) {
    if (room.state !== 'PLAYING' || room.qClosed) return;
    room.qClosed = true;
    clearTimeout(room.qTimer);
    room.timers.delete(room.qTimer);
    room.players.forEach((p) => {
      p.attempts = room.qIndex + 1;
      // Timer expired: anyone who has not answered is marked incorrect, 0 points, no penalty.
      if (!p.answers[room.qIndex]) p.answers[room.qIndex] = { chosen: null, correct: false, points: 0, timedOut: true };
    });
    emitRoom(room);
    io.to(room.code).emit('question_end', {
      index: room.qIndex,
      correctIndex: room.questions[room.qIndex].answer,
      explanation: room.questions[room.qIndex].explanation,
    });
    later(room, () => askQuestion(room), RESULT_PAUSE_MS);
  }

  function askQuestion(room) {
    room.qIndex += 1;
    if (room.qIndex >= TOTAL_QUESTIONS) return finishGame(room);
    room.state = 'PLAYING';
    room.qClosed = false;
    room.qStart = Date.now();
    emitRoom(room);
    io.to(room.code).emit('question', questionPayload(room, QUESTION_MS));
    room.qTimer = later(room, () => endQuestion(room), QUESTION_MS + GRACE_MS);
  }

  function finishGame(room) {
    room.state = 'FINISHED';
    emitRoom(room);
    io.to(room.code).emit('game_over');
  }

  function startGame(room) {
    room.players.forEach((p) => {
      if (!p.connected) {
        clearTimeout(p.removeTimer);
        room.players.delete(p.id);
      }
    });
    room.state = 'COUNTDOWN';
    // SERVER-SIDE random selection: TOTAL_QUESTIONS (10) unique questions, stored on the room, identical for every player.
    // The previous race's question ids are excluded so "Play Again" gives a fresh set.
    room.questions = selectRandomQuestions(TOTAL_QUESTIONS, room.lastQuestionIds);
    room.lastQuestionIds = new Set(room.questions.map((q) => q.id));
    room.qIndex = -1;
    room.qClosed = true;
    room.players.forEach((p) => Object.assign(p, blankStats()));
    room.countdownN = 3;
    emitRoom(room);
    [3, 2, 1, 0].forEach((n, i) =>
      later(room, () => {
        room.countdownN = n;
        io.to(room.code).emit('countdown', { n });
      }, i * 1000)
    );
    later(room, () => askQuestion(room), 3900);
  }

  // ---------- socket plumbing ----------
  const attach = (socket, room, p) => {
    p.socketId = socket.id;
    p.connected = true;
    clearTimeout(p.removeTimer);
    clearTimeout(room.deleteTimer);
    socket.data = { code: room.code, playerId: p.id };
    socket.join(room.code);
  };

  const sendCatchUp = (socket, room, p) => {
    if (room.state === 'COUNTDOWN') socket.emit('countdown', { n: room.countdownN });
    if (room.state === 'PLAYING') {
      const remaining = Math.max(0, QUESTION_MS - (Date.now() - room.qStart));
      socket.emit('question', questionPayload(room, remaining));
      const ans = p.answers[room.qIndex];
      if (ans && !ans.timedOut) {
        socket.emit('answer_result', {
          index: room.qIndex,
          correct: ans.correct,
          points: ans.points,
          chosen: ans.chosen,
          correctIndex: room.questions[room.qIndex].answer,
          explanation: room.questions[room.qIndex].explanation,
          score: p.score,
        });
      }
      if (room.qClosed) {
        socket.emit('question_end', { index: room.qIndex, correctIndex: room.questions[room.qIndex].answer, explanation: room.questions[room.qIndex].explanation });
      }
    }
  };

  const leave = (socket, permanent) => {
    const { code, playerId } = socket.data || {};
    const room = rooms.get(code);
    const p = room && room.players.get(playerId);
    if (room) socket.leave(code);
    socket.data = {};
    if (!room || !p || p.socketId !== socket.id) return; // stale socket after refresh
    p.connected = false;
    p.socketId = null;
    if (room.state === 'WAITING') {
      if (permanent) return removePlayer(room, p);
      p.removeTimer = setTimeout(() => removePlayer(room, p), 8000);
    }
    transferHost(room);
    emitRoom(room);
    checkAllAnswered(room);
    scheduleCleanup(room);
  };

  io.on('connection', (socket) => {
    socket.data = {};
    const noop = () => {};

    socket.on('create_room', (data = {}, ack = noop) => {
      const name = cleanName(data.name);
      if (!name) return ack({ ok: false, error: 'Enter a nickname.' });
      if (socket.data.code) leave(socket, true);
      const playerId = String(data.playerId || '').slice(0, 40) || Math.random().toString(36).slice(2);
      const room = {
        code: randomCode(),
        hostId: playerId,
        state: 'WAITING',
        players: new Map(),
        questions: [],
        qIndex: -1,
        qClosed: true,
        qStart: 0,
        qTimer: null,
        timers: new Set(),
        deleteTimer: null,
        countdownN: 3,
        lastQuestionIds: new Set(),
      };
      rooms.set(room.code, room);
      const p = { id: playerId, name, socketId: socket.id, connected: true, removeTimer: null, ...blankStats() };
      room.players.set(playerId, p);
      attach(socket, room, p);
      ack({ ok: true, code: room.code });
      emitRoom(room);
    });

    socket.on('join_room', (data = {}, ack = noop) => {
      const name = cleanName(data.name);
      const code = String(data.code || '').trim().toUpperCase();
      const playerId = String(data.playerId || '').slice(0, 40) || Math.random().toString(36).slice(2);
      if (!name) return ack({ ok: false, error: 'Enter a nickname.' });
      if (code.length !== 6) return ack({ ok: false, error: 'Enter the 6-character room code.' });
      const room = rooms.get(code);
      if (!room) return ack({ ok: false, error: 'Room not found. Check the code and try again.' });

      const existing = room.players.get(playerId);
      if (!existing) {
        if (room.state === 'FINISHED') return ack({ ok: false, error: 'This race has already finished.' });
        if (room.state !== 'WAITING') return ack({ ok: false, error: 'This race has already started.' });
        if (room.players.size >= MAX_PLAYERS) return ack({ ok: false, error: `This room is full (${MAX_PLAYERS}/${MAX_PLAYERS}).` });
        const taken = [...room.players.values()].some((q) => q.name.toLowerCase() === name.toLowerCase());
        if (taken) return ack({ ok: false, error: 'That nickname is already taken in this room.' });
      }
      if (socket.data.code && socket.data.code !== code) leave(socket, true);
      let p = existing;
      if (!p) {
        p = { id: playerId, name, socketId: socket.id, connected: true, removeTimer: null, ...blankStats() };
        room.players.set(playerId, p);
      }
      attach(socket, room, p);
      ack({ ok: true, code });
      emitRoom(room);
      sendCatchUp(socket, room, p);
    });

    socket.on('rejoin', (data = {}, ack = noop) => {
      const room = rooms.get(String(data.code || '').toUpperCase());
      const p = room && room.players.get(String(data.playerId || ''));
      if (!room || !p) return ack({ ok: false });
      attach(socket, room, p);
      transferHost(room);
      ack({ ok: true, code: room.code });
      emitRoom(room);
      sendCatchUp(socket, room, p);
    });

    socket.on('start_game', () => {
      const room = rooms.get(socket.data.code);
      if (!room) return;
      if (room.hostId !== socket.data.playerId) return socket.emit('error_msg', 'Only the host can start the race.');
      if (room.state !== 'WAITING') return socket.emit('error_msg', 'The race has already started.');
      startGame(room);
    });

    socket.on('submit_answer', (data = {}) => {
      const room = rooms.get(socket.data.code);
      const p = room && room.players.get(socket.data.playerId);
      if (!room || !p) return;
      if (room.state !== 'PLAYING' || room.qClosed) return socket.emit('error_msg', 'Answers are closed for this question.');
      const qi = room.qIndex;
      if (p.answers[qi]) return socket.emit('error_msg', 'You already answered this question.');
      const index = data.index;
      if (!Number.isInteger(index) || index < 0 || index > 3) return;

      const elapsed = Date.now() - room.qStart;
      if (elapsed > QUESTION_MS + GRACE_MS) return socket.emit('error_msg', 'Too late – the timer has expired.');
      const q = room.questions[qi];
      const correct = index === q.answer;
      // bonus = (whole seconds left / 15) x 100, rounded: 15 s left -> +100 ... 8 s -> +53 ... 1 s -> +7. Wrong / timeout = 0.
      const remaining = Math.max(0, Math.min(QUESTION_SECONDS, Math.ceil((QUESTION_MS - elapsed) / 1000)));
      const points = correct ? BASE_POINTS + Math.round((remaining / QUESTION_SECONDS) * MAX_BONUS) : 0;
      const rt = Math.min(elapsed, QUESTION_MS);

      p.answers[qi] = { chosen: index, correct, points };
      p.answered += 1;
      p.attempts = qi + 1;
      p.totalResponseTime += rt;
      if (correct) {
        p.correct += 1;
        p.score += points;
      }
      socket.emit('answer_result', {
        index: qi,
        correct,
        points,
        chosen: index,
        correctIndex: q.answer,
        explanation: q.explanation,
        score: p.score,
        responseMs: rt,
      });
      emitRoom(room);
      checkAllAnswered(room);
    });

    socket.on('play_again', () => {
      const room = rooms.get(socket.data.code);
      if (!room || room.hostId !== socket.data.playerId || room.state !== 'FINISHED') return;
      room.timers.forEach(clearTimeout);
      room.timers.clear();
      room.players.forEach((p) => {
        if (!p.connected) room.players.delete(p.id);
        else Object.assign(p, blankStats());
      });
      room.state = 'WAITING';
      room.qIndex = -1;
      room.qClosed = true;
      emitRoom(room);
    });

    socket.on('leave_room', () => leave(socket, true));
    socket.on('disconnect', () => leave(socket, false));
  });
}

module.exports = { register, rooms };
