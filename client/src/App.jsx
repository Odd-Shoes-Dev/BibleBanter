import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
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

// ── Route wrapper components ─────────────────────────────────────────────────

function EditSetRoute({ token }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  return <EditSet setId={setId} token={token} onBack={() => navigate('/host')} />;
}

function SessionReportRoute({ token }) {
  const { gameId } = useParams();
  const navigate = useNavigate();
  return <SessionReport gameId={gameId} token={token} onBack={() => navigate(-1)} />;
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();



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
  const [reportGameId, setReportGameId] = useState(null);
  const [gamePhase, setGamePhase] = useState(null); // 'question' | 'results' | 'over'

  const roleRef = useRef(null);
  useEffect(() => { roleRef.current = role; }, [role]);

  // Stable navigate ref for socket handlers
  const navRef = useRef(navigate);
  useEffect(() => { navRef.current = navigate; }, [navigate]);

  // Auth state
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('bb_token') || null);
  const [hostUser, setHostUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bb_host') || 'null'); } catch { return null; }
  });

  const handleLogin = (host, token) => {
    setHostUser(host);
    setAuthToken(token);
    navigate('/host');
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_host');
    setAuthToken(null);
    setHostUser(null);
    navigate('/');
  };

  // Redirect /?pin=XXXXXX to /join?pin=XXXXXX
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pin = params.get('pin');
    if (pin && location.pathname === '/') {
      navigate(`/join?pin=${pin}`, { replace: true });
    }
  }, []);

  // ── Socket event handlers ───────────────────────────────────────────────
  useEffect(() => {
    socket.connect();

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
            if (res.status === 'lobby') navRef.current('/lobby');
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
            if (res.status === 'lobby') navRef.current('/lobby');
          } else {
            sessionStorage.removeItem('bb_pin');
            sessionStorage.removeItem('bb_role');
            sessionStorage.removeItem('bb_name');
          }
        });
      }
    });

    socket.on('disconnect', () => setReconnecting(true));

    socket.on('player-joined', ({ players: pl }) => setPlayers(pl));
    socket.on('player-left', ({ players: pl }) => setPlayers(pl));

    socket.on('game-started', () => {
      setGamePhase('question');
      setAnswerResult(null);
      setQuestionResults(null);
      navRef.current('/play');
    });

    socket.on('new-question', (q) => {
      setCurrentQuestion(q);
      setAnswerResult(null);
      setQuestionResults(null);
      setAnswerProgress({ answered: 0, total: 0 });
      setLiveLeaderboard([]);
      setGamePhase('question');
      navRef.current('/play');
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
      setGamePhase('results');
    });

    socket.on('game-over', ({ leaderboard: lb, dbGameId, hasMore, nextOffset, setId, totalQuestions }) => {
      setLeaderboard(lb);
      if (dbGameId) setReportGameId(dbGameId);
      setContinueData(hasMore ? { nextOffset, setId, totalQuestions } : null);
      setGamePhase('over');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    });

    socket.on('round-starting', ({ players: pl }) => {
      setPlayers(pl || []);
      setCurrentQuestion(null);
      setAnswerResult(null);
      setQuestionResults(null);
      setAnswerProgress({ answered: 0, total: 0 });
      setLiveLeaderboard([]);
      setContinueData(null);
      setGamePhase(null);
      navRef.current('/lobby');
    });

    socket.on('host-disconnected', () => {
      sessionStorage.removeItem('bb_pin');
      sessionStorage.removeItem('bb_role');
      sessionStorage.removeItem('bb_name');
      setErrorMsg('The host has disconnected. Game ended.');
      navRef.current('/');
    });

    socket.on('error-msg', (msg) => setErrorMsg(msg));

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

  // ── Game action handlers ────────────────────────────────────────────────

  const resetGame = () => {
    sessionStorage.removeItem('bb_pin');
    sessionStorage.removeItem('bb_role');
    sessionStorage.removeItem('bb_name');
    setGamePin('');
    setPlayerName('');
    setRole(null);
    setPlayers([]);
    setCurrentQuestion(null);
    setAnswerResult(null);
    setQuestionResults(null);
    setLeaderboard([]);
    setGamePhase(null);
    setContinueData(null);
    socket.disconnect();
    socket.connect();
  };

  const handleCreateGame = ({ testament, setId, questionTime = 20, rounds = 10 }) => {
    socket.emit('create-game', { testament, setId, hostToken: authToken, questionTime, rounds }, ({ success, pin, error }) => {
      if (success) {
        setGamePin(pin);
        setRole('host');
        setPlayers([]);
        sessionStorage.setItem('bb_pin', pin);
        sessionStorage.setItem('bb_role', 'host');
        navigate('/lobby');
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
        navigate('/lobby');
      } else {
        setErrorMsg(error || 'Failed to join game.');
      }
    });
  };

  const handleStartGame = () => socket.emit('start-game');
  const handleSubmitAnswer = (answerIndex) => socket.emit('submit-answer', { answerIndex });

  const handleNextQuestion = () => {
    socket.emit('next-question');
    setGamePhase('question');
    setQuestionResults(null);
    setAnswerResult(null);
  };

  const handleContinueGame = () => {
    socket.emit('continue-game', {}, ({ success, error }) => {
      if (!success) setErrorMsg(error || 'Failed to continue game.');
    });
  };

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  const clearError = () => setErrorMsg('');

  // ── Render ──────────────────────────────────────────────────────────────

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

      <Routes>
        {/* ── Public pages ──────────────────────────────────────────── */}
        <Route path="/" element={
          <LandingPage
            onHost={() => navigate(hostUser ? '/host' : '/login')}
            onJoin={() => navigate('/join')}
            onSolo={() => navigate('/solo')}
            hostUser={hostUser}
            onLogin={() => navigate('/login')}
            onLogout={handleLogout}
            onHistory={() => navigate('/history')}
            onReports={() => navigate('/reports')}

            onGoogleLogin={handleLogin}
          />
        } />

        <Route path="/login" element={
          <LoginPage onLogin={handleLogin} onRegister={() => navigate('/register')} onBack={() => navigate('/')} />
        } />

        <Route path="/register" element={
          <RegisterPage onLogin={handleLogin} onBack={() => navigate('/login')} />
        } />

        <Route path="/join" element={
          <JoinPage onJoin={handleJoinGame} onBack={() => navigate('/')} />
        } />

        <Route path="/solo" element={
          <SoloPractice authToken={authToken} onBack={() => navigate('/')} />
        } />

        {/* ── Host pages ────────────────────────────────────────────── */}
        <Route path="/host" element={
          hostUser ? (
            <HostSetup
              onSelect={handleCreateGame}
              onBack={() => navigate('/')}
              onEditSet={(id) => navigate(`/host/edit/${id}`)}
              onAiGenerator={() => navigate('/host/ai')}
              hostToken={hostUser} 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/host/edit/:setId" element={<EditSetRoute token={authToken} />} />

        <Route path="/host/ai" element={
          <AiQuizGenerator token={authToken} onBack={() => navigate('/host')} onSaved={() => navigate('/host')} />
        } />

        {/* ── Lobby (host or player, guarded) ───────────────────────── */}
        <Route path="/lobby" element={
          !gamePin ? <Navigate to="/" replace /> :
          role === 'host' ? (
            <HostLobby
              pin={gamePin} players={players} onStart={handleStartGame} token={authToken}
              onCancel={() => { resetGame(); navigate('/host'); }}
            />
          ) : (
            <PlayerLobby
              pin={gamePin} playerName={playerName} players={players}
              onLeave={() => { resetGame(); navigate('/'); }}
            />
          )
        } />

        {/* ── Active game (phase-driven rendering) ─────────────────── */}
        <Route path="/play" element={
          !gamePin ? <Navigate to="/" replace /> :
          gamePhase === 'over' ? (
            <GameOver
              leaderboard={leaderboard}
              playerName={playerName}
              onPlayAgain={handlePlayAgain}
              role={role}
              onViewReport={reportGameId ? () => navigate(`/reports/${reportGameId}`) : null}
              onContinue={continueData ? handleContinueGame : null}
              continueInfo={continueData}
              onJoinAnother={role !== 'host' ? () => { resetGame(); navigate('/join'); } : undefined}
            />
          ) : gamePhase === 'results' ? (
            <ResultsScreen
              results={questionResults}
              role={role}
              answerResult={answerResult}
              onNext={handleNextQuestion}
              playerName={playerName}
            />
          ) : (
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
              onLeave={role !== 'host' ? () => { resetGame(); navigate('/'); } : undefined}
            />
          )
        } />

        {/* ── History & reports ─────────────────────────────────────── */}
        <Route path="/history" element={
          <GameHistory token={authToken} onBack={() => navigate('/')} onViewReport={(id) => navigate(`/reports/${id}`)} />
        } />

        <Route path="/reports" element={
          <ReportsPage token={authToken} onBack={() => navigate('/')} onViewReport={(id) => navigate(`/reports/${id}`)} />
        } />

        <Route path="/reports/:gameId" element={<SessionReportRoute token={authToken} />} />

        {/* ── Fallback ─────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>


    </div>
  );
}
