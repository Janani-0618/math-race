// End-to-end multiplayer test. Starts the real game server in-process (random port) and plays real games
// through Socket.IO. Run with:  npm run test:sim     (no need to start the server first)
process.env.RESULT_PAUSE_MS = process.env.RESULT_PAUSE_MS || '120';
const http = require('http');
const { Server } = require('socket.io');
const { io: connectClient } = require('socket.io-client');
const { register, rooms } = require('./gameManager');
const { validateBank } = require('./questions');

const fail = (m) => { console.error('❌ FAIL:', m); process.exit(1); };
const ok = (m) => console.log('✓', m);
const assert = (c, m) => { if (!c) fail(m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const httpServer = http.createServer();
const io = new Server(httpServer);
register(io);

(async () => {
  assert(validateBank().length === 0, 'question bank invalid');
  ok('question bank valid');
  await new Promise((r) => httpServer.listen(0, r));
  const URL = `http://localhost:${httpServer.address().port}`;
  const connect = () => new Promise((r) => { const s = connectClient(URL, { transports: ['websocket'] }); s.on('connect', () => r(s)); });
  const emit = (s, ev, d) => new Promise((r) => s.emit(ev, d, r));

  // A bot records everything it receives and answers according to a strategy using the server's answer key (test only).
  function bot(socket, code, strategy) {
    const b = { socket, ids: [], payloads: [], results: [], lastRoom: null, errors: [], over: false, countdown: [] };
    socket.on('room_state', (s) => (b.lastRoom = s));
    socket.on('countdown', (d) => b.countdown.push(d.n));
    socket.on('game_over', () => (b.over = true));
    socket.on('error_msg', (m) => b.errors.push(m));
    socket.on('answer_result', (r) => b.results.push(r));
    socket.on('question', (q) => {
      b.ids.push(q.id);
      b.payloads.push(q);
      if (q.answer !== undefined || q.correctIndex !== undefined || q.explanation !== undefined) fail('server leaked the answer/explanation in the question payload!');
      const key = rooms.get(code).questions[q.index].answer;
      const pick = strategy(q.index, key);
      if (pick !== null) socket.emit('submit_answer', { index: pick });
    });
    return b;
  }

  async function makeRoom(names) {
    const sockets = await Promise.all(names.map(connect));
    let r = await emit(sockets[0], 'create_room', { name: names[0], playerId: names[0] });
    assert(r.ok, 'create room');
    const code = r.code;
    for (let i = 1; i < names.length; i++) {
      r = await emit(sockets[i], 'join_room', { name: names[i], code, playerId: names[i] });
      assert(r.ok, 'join ' + names[i]);
    }
    return { code, sockets };
  }

  // ---------- GAME 1: scoring, sync, 10 questions, race end ----------
  const A = await makeRoom(['Host', 'Ace', 'Zed']);
  const bots = [
    bot(A.sockets[0], A.code, (i, key) => key),                       // always correct, instantly
    bot(A.sockets[1], A.code, (i, key) => (i % 2 === 0 ? key : (key + 1) % 4)), // correct on even questions
    bot(A.sockets[2], A.code, (i, key) => (key + 1) % 4),            // always wrong
  ];
  const dupBot = bots[0];
  A.sockets[0].on('question', () => A.sockets[0].emit('submit_answer', { index: 0 })); // double submit attempt
  const start1 = Date.now();
  A.sockets[0].emit('start_game');
  await new Promise((r) => A.sockets[0].on('game_over', r));
  await sleep(100);

  const room1 = rooms.get(A.code);
  const ids1 = room1.questions.map((q) => q.id);
  assert(room1.questions.length === 10 && new Set(ids1).size === 10, 'room must hold exactly 10 unique questions');
  const dcount = (d) => room1.questions.filter((q) => q.difficulty === d).length;
  assert(dcount('Warm-up') >= 2 && dcount('Warm-up') <= 4 && dcount('Challenge') >= 2 && dcount('Challenge') <= 3, 'race difficulty mix');
  ok(`difficulty mix of this race: ${dcount('Warm-up')} warm-up / ${dcount('Normal')} normal / ${dcount('Challenge')} challenge`);
  ok('room stores exactly 10 unique questions (server-side): ' + ids1.slice(0, 5).join(',') + '…');
  bots.forEach((b, i) => {
    assert(b.ids.length === 10, `bot ${i} received ${b.ids.length} questions`);
    assert(b.ids.join() === ids1.join(), `bot ${i} got a different order/set`);
    assert(JSON.stringify(b.payloads.map((p) => p.options)) === JSON.stringify(bots[0].payloads.map((p) => p.options)), 'options differ between players');
    b.payloads.forEach((p) => assert(p.options.length === 4 && p.category && p.icon && p.difficulty, 'payload shape'));
  });
  ok('all 3 players received identical questions, options and order (10/10), no answers leaked');
  assert(bots[0].payloads.map((p) => p.index).join() === [...Array(10).keys()].join(), 'question numbering');
  ok('question numbers 1..10 in sequence; countdown ' + bots[0].countdown.join(','));
  assert(bots[0].errors.filter((e) => /already answered/.test(e)).length === 10, 'duplicate answers must be rejected');
  ok('duplicate submissions rejected (10/10)');

  const fin = Object.fromEntries(bots[0].lastRoom.players.map((p) => [p.name, p]));
  assert(bots[0].lastRoom.state === 'FINISHED', 'state FINISHED');
  assert(fin.Host.score === 1500 && fin.Host.correct === 10, 'Host score ' + fin.Host.score);          // 10 x (100 + 50)
  assert(fin.Ace.score === 750 && fin.Ace.correct === 5, 'Ace score ' + fin.Ace.score);
  assert(fin.Zed.score === 0 && fin.Zed.correct === 0, 'Zed score ' + fin.Zed.score);
  ok(`scoring correct: Host ${fin.Host.score} (10/10), Ace ${fin.Ace.score} (5/10), Zed ${fin.Zed.score} (wrong = 0, no negatives)`);
  assert(fin.Host.progress === 100 && Math.abs(fin.Ace.progress - 50) < 0.01 && fin.Zed.progress === 0, 'race progress');
  ok(`race movement: Host ${fin.Host.progress}%, Ace ${fin.Ace.progress}%, Zed ${fin.Zed.progress}%`);
  assert(Object.values(fin).every((p) => p.attempts === 10), 'attempts');
  assert(bots[0].results.length === 10 && bots[0].results.every((r) => r.correct && r.points === 150 && typeof r.explanation === 'string' && r.explanation.length > 5), 'instant correct answer = 150 with an explanation');
  ok('instant correct answer = 100 base + 50 speed bonus = 150 points; every result carries an explanation');
  assert(bots[0].over && !bots[0].ids[10], 'no 11th question; game_over fired');
  ok(`Question 10 ended the race (${((Date.now() - start1) / 1000).toFixed(1)}s total)`);

  // ---------- GAME 2 (same room, Play Again): fresh set, no repeats from game 1 ----------
  A.sockets[0].emit('play_again');
  await sleep(200);
  assert(bots[0].lastRoom.state === 'WAITING' && bots[0].lastRoom.players.every((p) => p.score === 0), 'play again resets');
  const startedGame2 = new Promise((r) => A.sockets[0].once('countdown', r));
  A.sockets[0].emit('start_game');
  await startedGame2;
  const ids2 = rooms.get(A.code).questions.map((q) => q.id);
  assert(ids2.length === 10 && new Set(ids2).size === 10, 'game 2 has 10 unique');
  assert(ids2.join() !== ids1.join(), 'game 2 must differ from game 1');
  assert(ids2.every((id) => !ids1.includes(id)), 'game 2 must not repeat any question from game 1');
  ok('Play Again gives a new set of 10 with 0 repeats from the previous race');

  // ---------- DIFFERENT ROOMS = DIFFERENT SETS ----------
  const rooms3 = [];
  for (let i = 0; i < 4; i++) {
    const r = await makeRoom(['P' + i]);
    r.sockets[0].emit('start_game');
    await new Promise((res) => r.sockets[0].once('countdown', res));
    rooms3.push(rooms.get(r.code).questions.map((q) => q.id));
  }
  assert(new Set(rooms3.map((x) => x.join())).size === 4, 'rooms got identical sets');
  ok('4 different rooms received 4 different random sets');

  // ---------- 30 PLAYERS: everyone gets the same question, the 31st is rejected ----------
  const names30 = Array.from({ length: 30 }, (_, i) => 'U' + i);
  const R = await makeRoom(names30);
  const extra = await connect();
  const rj = await emit(extra, 'join_room', { name: 'Extra', code: R.code, playerId: 'extra' });
  assert(!rj.ok && /full/i.test(rj.error), '31st player must be rejected, got: ' + JSON.stringify(rj));
  const seen = new Set();
  let got = 0;
  R.sockets.forEach((s) => s.on('question', (q) => { if (q.index === 0) { seen.add([q.id, q.text, q.options.join(), q.total, q.durationMs].join('|')); got++; } }));
  R.sockets[0].emit('start_game');
  await new Promise((r) => { const t = setInterval(() => { if (got === 30) { clearInterval(t); r(); } }, 50); });
  assert(seen.size === 1, '30 players saw ' + seen.size + ' different versions of Q1');
  ok('30 players joined, 31st rejected ("room is full"), all 30 received the identical Q1 and timer');

  // ---------- TIMER (15 s): timeout = wrong, speed bonus, late answers rejected ----------
  const T = await makeRoom(['Fast', 'Mid', 'Late', 'Sleepy']);
  const fast = bot(T.sockets[0], T.code, (i, key) => key);
  const mid = bot(T.sockets[1], T.code, () => null);      // answers correctly after ~5 s (below)
  const late = bot(T.sockets[2], T.code, () => null);     // answers correctly with ~1.5 s left
  const sleepy = bot(T.sockets[3], T.code, () => null);   // never answers
  T.sockets[1].on('question', (q) => {
    if (q.index === 0) setTimeout(() => T.sockets[1].emit('submit_answer', { index: rooms.get(T.code).questions[0].answer }), 5200);
  });
  T.sockets[2].on('question', (q) => {
    if (q.index === 0) setTimeout(() => T.sockets[2].emit('submit_answer', { index: rooms.get(T.code).questions[0].answer }), 13500);
  });
  T.sockets[3].once('question_end', () => T.sockets[3].emit('submit_answer', { index: 0 })); // late attempt the instant Q1 closes
  const ends = [];
  let qStart = 0;
  T.sockets[0].on('question', (q) => { if (q.index === 0) qStart = Date.now(); });
  T.sockets[0].on('question_end', (e) => { ends.push(Date.now()); if (typeof e.explanation !== 'string' || e.correctIndex === undefined) fail('question_end must carry correctIndex + explanation'); });
  T.sockets[0].emit('start_game');
  await new Promise((r) => T.sockets[0].on('question', (q) => q.index === 1 && r()));
  await sleep(250);

  assert(fast.payloads[0].durationMs === 15000 && fast.payloads[0].remainingMs === 15000, 'server timer must be 15 s');
  const dur = ends[0] - qStart;
  assert(dur >= 14900 && dur <= 16000, 'question should last ~15s (+0.3s grace), got ' + dur);
  const players = Object.fromEntries(fast.lastRoom.players.map((p) => [p.name, p]));
  assert(players.Sleepy.score === 0 && players.Sleepy.correct === 0 && players.Sleepy.attempts === 1, 'timed-out player must be wrong with 0 points');
  assert(sleepy.ids.length === 2 && mid.ids.length === 2 && fast.ids.length === 2, 'all players moved on to question 2');
  ok(`timer ran ${(dur / 1000).toFixed(1)}s → unanswered player marked wrong (0 pts) → everyone moved to Q2`);

  assert(fast.results[0].points === 150, 'instant answer should give 100 + 50 = 150, got ' + fast.results[0].points);
  const m = mid.results[0];
  const expectedMid = 100 + Math.round((Math.ceil((15000 - m.responseMs) / 1000) / 15) * 50);
  assert(m.correct && m.points === expectedMid && m.points >= 125 && m.points <= 140, `answer at ~5s should score ~133, got ${m.points} (expected ${expectedMid})`);
  const sum = (b) => b.results.reduce((t, r) => t + r.points, 0);
  const l = late.results[0];
  const expectedLate = 100 + Math.round((Math.ceil((15000 - l.responseMs) / 1000) / 15) * 50);
  assert(l.correct && l.points === expectedLate && l.points > 100 && l.points <= 115, `answer at ~13.5s should score ~107, got ${l.points} (expected ${expectedLate})`);
  assert(players.Mid.score === sum(mid) && players.Fast.score === sum(fast), 'server scores must equal the sum of the points each player was awarded');
  ok(`speed bonus scales over 15 s: instant = ${fast.results[0].points}, at ${(m.responseMs / 1000).toFixed(1)}s = ${m.points}, at ${(l.responseMs / 1000).toFixed(1)}s = ${l.points}`);

  assert(sleepy.errors.some((e) => /closed|late/i.test(e)), 'late answer must be rejected; errors: ' + sleepy.errors.join('|'));
  assert(players.Sleepy.score === 0, 'late answer must not score');
  ok('answer sent after the timer expired was rejected (no points)');

  console.log('\n✅ ALL CHECKS PASSED');
  process.exit(0);
})().catch((e) => fail(e.stack || e));
