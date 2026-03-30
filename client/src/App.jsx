import { useState, useEffect, useRef } from 'react';
import { socket } from './socket';
import LandingPage from './pages/LandingPage';
import HostSetup from './pages/HostSetup';
import HostLobby from './pages/HostLobby';
import JoinPage from './pages/JoinPage';
import PlayerLobby from './pages/PlayerLobby';
import GameScreen from './pages/GameScreen';
import ResultsScreen from './pages/ResultsScreen';
import GameOver from './pages/GameOver';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameHistory from './pages/GameHistory';
import EditSet from './pages/EditSet';
import AiQuizGenerator from './pages/AiQuizGenerator';
import SessionReport from './pages/SessionReport';
import ReportsPage from './pages/ReportsPage';
import SoloPractice from './pages/SoloPractice';
import Confetti from './components/Confetti';

export default function App() {
  const [editSetId, setEditSetId] = useState(null);
  const [reportGameId, setReportGameId] = useState(null);

  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pin') ? 'join' : 'landing';
  });
  const [gamePin, setGamePin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [questionResults, setQuestionResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answerProgress, setAnswerProgress] = useState({ answered: 0, total: 0 });
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [continueData, setContinueData] = useState(null);
  const roleRef = useRef(null);
  useEffect(() => { roleRef.current = role; }, [role]);

  // Auth state
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('bb_token') || null);
  const [hostUser, setHostUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bb_host') || 'null'); } catch { return null; }
  });

  const handleLogin = (host, token) => {
    setHostUser(host);
    setAuthToken(token);
    setScreen('host-setup');
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_host');
    setAuthToken(null);
    setHostUser(null);
    setScreen('landing');
  };

  useEffect(() => {
    socket.connect();

    // Auto-rejoin after socket reconnects (new socket.id but same session)
    socket.on('connect', () => {
      setReconnecting(false);
      const savedPin = sessionStorage.getItem('bb_pin');
      const savedRole = sessionStorage.getItem('bb_role');
      const savedName = sessionStorage.getItem('bb_name');
      if (!savedPin || !savedRole) return;

      if (savedRole === 'player' && savedName) {
        socket.emit('rejoin-game', { pin: savedPin, name: savedName }, (res) => {
          if (res?.success) {
            setGamePin(savedPin);
            setPlayerName(savedName);
            setRole('player');
            if (res.status === 'lobby') setScreen('player-lobby');
          } else {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            sessionStorage.removeItem('bb_name');
          }
        });
      } else if (savedRole === 'host') {
        socket.emit('rejoin-host', { pin: savedPin }, (res) => {
          if (res?.success) {
            setGamePin(res.pin);
            setRole('host');
            setPlayers(res.players || []);
            if (res.status === 'lobby') setScreen('host-lobby');
          } else {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            sessionStorage.removeItem('bb_name');
          }
        });
      }
    });

    socket.on('disconnect', () => setReconnecting(true));

    socket.on('player-joined', ({ players: pl, name }) => {
      setPlayers(pl);
    });

    socket.on('player-left', ({ players: pl }) => {
      setPlayers(pl);
    });

    socket.on('game-started', () => {
      setScreen('game');
      setAnswerResult(null);
      setQuestionResults(null);
    });

    socket.on('new-question', (q) => {
      setCurrentQuestion(q);
      setAnswerResult(null);
      setQuestionResults(null);
      setAnswerProgress({ answered: 0, total: 0 });
      setLiveLeaderboard([]);
      setScreen('game');
    });

    socket.on('answer-result', (result) => {
      setAnswerResult(result);
      if (result.isCorrect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    });

    socket.on('answer-progress', (progress) => {
      setAnswerProgress(progress);
      if (progress.leaderboard) setLiveLeaderboard(progress.leaderboard);
    });

    socket.on('question-results', (results) => {
      setQuestionResults(results);
      setLeaderboard(results.leaderboard);
      setScreen('results');
    });

    socket.on('game-over', ({ leaderboard: lb, dbGameId, hasMore, nextOffset, setId, totalQuestions }) => {
      setLeaderboard(lb);
      if (dbGameId) setReportGameId(dbGameId);
      setContinueData(hasMore ? { nextOffset, setId, totalQuestions } : null);
      setScreen('gameover');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    });

    socket.on('round-starting', ({ round, batchStart, batchEnd, totalQuestions, players: pl }) => {
      setPlayers(pl || []);
      setCurrentQuestion(null);
      setAnswerResult(null);
      setQuestionResults(null);
      setAnswerProgress({ answered: 0, total: 0 });
      setLiveLeaderboard([]);
      setContinueData(null);
      if (roleRef.current === 'host') setScreen('host-lobby');
      else setScreen('player-lobby');
    });

    socket.on('host-disconnected', () => {
      sessionStorage.removeItem('bb_pin');
      sessionStorage.removeItem('bb_role');
      sessionStorage.removeItem('bb_name');
      setErrorMsg('The host has disconnected. Game ended.');
      setScreen('landing');
    });

    socket.on('error-msg', (msg) => {
      setErrorMsg(msg);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('round-starting');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('new-question');
      socket.off('answer-result');
      socket.off('answer-progress');
      socket.off('question-results');
      socket.off('game-over');
      socket.off('host-disconnected');
      socket.off('error-msg');
    };
  }, []);

  const handleCreateGame = ({ testament, setId, questionTime = 20, rounds = 10 }) => {
    socket.emit('create-game', { testament, setId, hostToken: authToken, questionTime, rounds }, ({ success, pin, error }) => {
      if (success) {
        setGamePin(pin);
        setRole('host');
        setPlayers([]);
        sessionStorage.setItem('bb_pin', pin);
        sessionStorage.setItem('bb_role', 'host');
        setScreen('host-lobby');
      } else {
        setErrorMsg(error || 'Failed to create game.');
      }
    });
  };

  const handleJoinGame = (pin, name) => {
    socket.emit('join-game', { pin, name }, ({ success, error }) => {
      if (success) {
        setGamePin(pin);
        setPlayerName(name);
        setRole('player');
        sessionStorage.setItem('bb_pin', pin);
        sessionStorage.setItem('bb_role', 'player');
        sessionStorage.setItem('bb_name', name);
        setScreen('player-lobby');
      } else {
        setErrorMsg(error || 'Failed to join game.');
      }
    });
  };

  const handleStartGame = () => {
    socket.emit('start-game');
  };

  const handleSubmitAnswer = (answerIndex) => {
    socket.emit('submit-answer', { answerIndex });
  };

  const handleNextQuestion = () => {
    socket.emit('next-question');
    setScreen('game');
    setQuestionResults(null);
    setAnswerResult(null);
  };

  const handleContinueGame = () => {
    socket.emit('continue-game', {}, ({ success, error }) => {
      if (!success) setErrorMsg(error || 'Failed to continue game.');
    });
  };

  const handlePlayAgain = () => {
    sessionStorage.removeItem('bb_pin');
    sessionStorage.removeItem('bb_role');
    sessionStorage.removeItem('bb_name');
    setScreen('landing');
    setGamePin('');
    setPlayerName('');
    setRole(null);
    setPlayers([]);
    setCurrentQuestion(null);
    setAnswerResult(null);
    setQuestionResults(null);
    setLeaderboard([]);
    socket.disconnect();
    socket.connect();
  };

  const clearError = () => setErrorMsg('');

  return (
    <div className="min-h-screen stars-bg">
      {showConfetti && <Confetti />}

      {reconnecting && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="backdrop-blur text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-semibold"
            style={{ background: 'rgba(124,58,237,0.85)', border: '1px solid rgba(167,139,250,0.4)' }}>
            <span className="animate-spin inline-block">↻</span>
            Reconnecting…
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-red-600/90 backdrop-blur text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{errorMsg}</span>
            <button onClick={clearError} className="ml-2 text-white/70 hover:text-white text-xl">×</button>
          </div>
        </div>
      )}

      {screen === 'landing' && (
        <LandingPage
          onHost={() => setScreen(hostUser ? 'host-setup' : 'login')}
          onJoin={() => setScreen('join')}
          onSolo={() => setScreen('solo')}
          hostUser={hostUser}
          onLogin={() => setScreen('login')}
          onLogout={handleLogout}
          onHistory={() => setScreen('history')}
          onReports={() => setScreen('reports')}
        />
      )}
      {screen === 'login' && (
        <LoginPage onLogin={handleLogin} onRegister={() => setScreen('register')} onBack={() => setScreen('landing')} />
      )}
      {screen === 'register' && (
        <RegisterPage onLogin={handleLogin} onBack={() => setScreen('login')} />
      )}
      {screen === 'history' && (
        <GameHistory token={authToken} onBack={() => setScreen('landing')} onViewReport={(id) => { setReportGameId(id); setScreen('session-report'); }} />
      )}
      {screen === 'reports' && (
        <ReportsPage token={authToken} onBack={() => setScreen('landing')} onViewReport={(id) => { setReportGameId(id); setScreen('session-report'); }} />
      )}
      {screen === 'session-report' && (
        <SessionReport gameId={reportGameId} token={authToken} onBack={() => setScreen(role === 'host' ? 'gameover' : 'history')} />
      )}
      {screen === 'solo' && (
        <SoloPractice authToken={authToken} onBack={() => setScreen('landing')} />
      )}
      {screen === 'ai-generator' && (
        <AiQuizGenerator token={authToken} onBack={() => setScreen('host-setup')} onSaved={() => setScreen('host-setup')} />
      )}
      {screen === 'host-setup' && (
        <HostSetup
          onSelect={handleCreateGame}
          onBack={() => setScreen('landing')}
          onEditSet={(id) => { setEditSetId(id); setScreen('edit-set'); }}
          onAiGenerator={() => setScreen('ai-generator')}
          token={authToken}
        />
      )}
      {screen === 'edit-set' && (
        <EditSet setId={editSetId} token={authToken} onBack={() => setScreen('host-setup')} />
      )}
      {screen === 'join' && (
        <JoinPage onJoin={handleJoinGame} onBack={() => setScreen('landing')} />
      )}
      {screen === 'host-lobby' && (
        <HostLobby pin={gamePin} players={players} onStart={handleStartGame} token={authToken}
          onCancel={() => {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            socket.disconnect();
            socket.connect();
            setGamePin('');
            setRole(null);
            setPlayers([]);
            setScreen('host-setup');
          }}
        />
      )}
      {screen === 'player-lobby' && (
        <PlayerLobby pin={gamePin} playerName={playerName} players={players}
          onLeave={() => {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            sessionStorage.removeItem('bb_name');
            socket.disconnect();
            socket.connect();
            setGamePin('');
            setPlayerName('');
            setRole(null);
            setPlayers([]);
            setScreen('landing');
          }}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          question={currentQuestion}
          role={role}
          onSubmitAnswer={handleSubmitAnswer}
          answerResult={answerResult}
          answerProgress={answerProgress}
          liveLeaderboard={liveLeaderboard}
          players={players}
          onNextQuestion={handleNextQuestion}
          playerName={playerName}
          onLeave={role !== 'host' ? () => {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            sessionStorage.removeItem('bb_name');
            socket.disconnect();
            socket.connect();
            setGamePin(''); setPlayerName(''); setRole(null); setPlayers([]);
            setCurrentQuestion(null); setAnswerResult(null);
            setScreen('landing');
          } : undefined}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          results={questionResults}
          role={role}
          answerResult={answerResult}
          onNext={handleNextQuestion}
          playerName={playerName}
        />
      )}
      {screen === 'gameover' && (
        <GameOver
          leaderboard={leaderboard}
          playerName={playerName}
          onPlayAgain={handlePlayAgain}
          role={role}
          onViewReport={reportGameId ? () => setScreen('session-report') : null}
          onContinue={continueData ? handleContinueGame : null}
          continueInfo={continueData}
          onJoinAnother={role !== 'host' ? () => {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            sessionStorage.removeItem('bb_name');
            socket.disconnect();
            socket.connect();
            setGamePin(''); setPlayerName(''); setRole(null); setPlayers([]);
            setCurrentQuestion(null); setLeaderboard([]);
            setScreen('join');
          } : undefined}
        />
      )}
    </div>
  );
}
