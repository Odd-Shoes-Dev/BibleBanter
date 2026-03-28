import { useState, useEffect } from 'react';
import { socket } from './socket';
import LandingPage from './pages/LandingPage';
import HostSetup from './pages/HostSetup';
import HostLobby from './pages/HostLobby';
import JoinPage from './pages/JoinPage';
import PlayerLobby from './pages/PlayerLobby';
import GameScreen from './pages/GameScreen';
import ResultsScreen from './pages/ResultsScreen';
import GameOver from './pages/GameOver';
import Confetti from './components/Confetti';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [gamePin, setGamePin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [questionResults, setQuestionResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answerProgress, setAnswerProgress] = useState({ answered: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    socket.connect();

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
    });

    socket.on('question-results', (results) => {
      setQuestionResults(results);
      setLeaderboard(results.leaderboard);
      setScreen('results');
    });

    socket.on('game-over', ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setScreen('gameover');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    });

    socket.on('host-disconnected', () => {
      setErrorMsg('The host has disconnected. Game ended.');
      setScreen('landing');
    });

    socket.on('error-msg', (msg) => {
      setErrorMsg(msg);
    });

    return () => {
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

  const handleCreateGame = (testament) => {
    socket.emit('create-game', { testament }, ({ success, pin, error }) => {
      if (success) {
        setGamePin(pin);
        setRole('host');
        setPlayers([]);
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

  const handlePlayAgain = () => {
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
        <LandingPage onHost={() => setScreen('host-setup')} onJoin={() => setScreen('join')} />
      )}
      {screen === 'host-setup' && (
        <HostSetup onSelect={handleCreateGame} onBack={() => setScreen('landing')} />
      )}
      {screen === 'join' && (
        <JoinPage onJoin={handleJoinGame} onBack={() => setScreen('landing')} />
      )}
      {screen === 'host-lobby' && (
        <HostLobby pin={gamePin} players={players} onStart={handleStartGame} onError={errorMsg} />
      )}
      {screen === 'player-lobby' && (
        <PlayerLobby pin={gamePin} playerName={playerName} players={players} />
      )}
      {screen === 'game' && (
        <GameScreen
          question={currentQuestion}
          role={role}
          onSubmitAnswer={handleSubmitAnswer}
          answerResult={answerResult}
          answerProgress={answerProgress}
          players={players}
          onNextQuestion={handleNextQuestion}
          playerName={playerName}
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
        <GameOver leaderboard={leaderboard} playerName={playerName} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}
