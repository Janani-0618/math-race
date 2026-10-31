import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const KEY = 'mathrace.session';
const makeId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// sessionStorage is per-tab, so several tabs on one laptop act as separate players,
// while a refresh in the same tab reconnects to the same player.
function loadSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY));
    if (s && s.playerId) return s;
  } catch {
    /* ignore */
  }
  return { playerId: makeId() };
}

export function useGame() {
  const sessionRef = useRef(loadSession());
  const socketRef = useRef(null);
  const errTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const [restoring, setRestoring] = useState(!!sessionRef.current.code);
  const [room, setRoom] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [questionEnd, setQuestionEnd] = useState(null);
  const [error, setError] = useState('');

  const updateSession = useCallback((patch) => {
    sessionRef.current = { ...sessionRef.current, ...patch };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(sessionRef.current));
    } catch {
      /* ignore */
    }
  }, []);

  const flashError = useCallback((msg) => {
    setError(msg);
    clearTimeout(errTimer.current);
    errTimer.current = setTimeout(() => setError(''), 3500);
  }, []);

  useEffect(() => {
    updateSession({});
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      const { code, playerId } = sessionRef.current;
      if (code) {
        socket.emit('rejoin', { code, playerId }, (res) => {
          if (!res?.ok) {
            updateSession({ code: null });
            setRoom(null);
          }
          setRestoring(false);
        });
      } else {
        setRestoring(false);
      }
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('room_state', (s) => {
      setRoom(s);
      if (s.state === 'WAITING') {
        setQuestion(null);
        setAnswerResult(null);
        setQuestionEnd(null);
        setCountdown(null);
      }
    });
    socket.on('countdown', ({ n }) => setCountdown(n));
    socket.on('question', (q) => {
      setCountdown(null);
      setAnswerResult(null);
      setQuestionEnd(null);
      setQuestion({ ...q, receivedAt: Date.now() });
    });
    socket.on('answer_result', setAnswerResult);
    socket.on('question_end', setQuestionEnd);
    socket.on('error_msg', flashError);

    return () => socket.disconnect();
  }, [flashError, updateSession]);

  const enterRoom = useCallback(
    (event, payload, name) =>
      new Promise((resolve) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected) {
          return resolve({ ok: false, error: 'Cannot reach the game server. Make sure it is running.' });
        }
        socket.emit(event, { ...payload, name, playerId: sessionRef.current.playerId }, (res) => {
          if (res?.ok) updateSession({ code: res.code, name });
          resolve(res || { ok: false, error: 'No response from server.' });
        });
      }),
    [updateSession]
  );

  const createRoom = useCallback((name) => enterRoom('create_room', {}, name), [enterRoom]);
  const joinRoom = useCallback((name, code) => enterRoom('join_room', { code }, name), [enterRoom]);
  const startGame = useCallback(() => socketRef.current?.emit('start_game'), []);
  const answer = useCallback((index) => socketRef.current?.emit('submit_answer', { index }), []);
  const playAgain = useCallback(() => socketRef.current?.emit('play_again'), []);
  const leave = useCallback(() => {
    socketRef.current?.emit('leave_room');
    updateSession({ code: null });
    setRoom(null);
    setQuestion(null);
    setAnswerResult(null);
    setQuestionEnd(null);
    setCountdown(null);
  }, [updateSession]);

  return {
    playerId: sessionRef.current.playerId,
    connected, restoring, room, countdown, question, answerResult, questionEnd, error,
    createRoom, joinRoom, startGame, answer, playAgain, leave,
  };
}
