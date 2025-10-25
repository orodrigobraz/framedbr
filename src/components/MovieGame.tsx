import React, { useState, useEffect } from 'react';
import { Movie, GameState } from '../types/Movie';
import './MovieGame.css';

interface MovieGameProps {
  movie: Movie;
  movies: Movie[];
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const MovieGame: React.FC<MovieGameProps> = ({ 
  movie, 
  movies,
  onNext, 
  onPrevious, 
  isFirst, 
  isLast 
}) => {
  const [gameState, setGameState] = useState<GameState>({
    currentFrame: 1,
    guess: '',
    isCorrect: false,
    showAllFrames: false,
    attempts: 0
  });

  const [feedback, setFeedback] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [displayFrame, setDisplayFrame] = useState<number>(1);

  const generateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
  
    const inputLower = input.toLowerCase();
  
    // ✅ Garante o tipo correto
    const suggestionsList: string[] = movies
      .map((m: Movie) => m.titulo_ptbr)
      .filter((titulo: string) => titulo.toLowerCase().includes(inputLower))
      .slice(0, 5);
  
    setSuggestions(suggestionsList);
  };  
  

  const frames = [
    movie.imagens.imagem_frame1,
    movie.imagens.imagem_frame2,
    movie.imagens.imagem_frame3,
    movie.imagens.imagem_frame4,
    movie.imagens.imagem_frame5,
    movie.imagens.imagem_frame6
  ];

  const handleGuess = () => {
    const normalizedGuess = gameState.guess.toLowerCase().trim();
    const normalizedTitle = movie.titulo_ptbr.toLowerCase();
    const normalizedOriginal = movie.titulo_original.toLowerCase();

    const isCorrectGuess = normalizedGuess === normalizedTitle || normalizedGuess === normalizedOriginal
    
    if (isCorrectGuess) {
      setGameState(prev => ({
        ...prev,
        isCorrect: true,
        showAllFrames: true,
        attempts: prev.attempts + 1
      }));
      setFeedback('🎉 Parabéns! Você acertou!');
    } else {
      setGameState(prev => {
        const nextFrame = Math.min(prev.currentFrame + 1, 6);
        setDisplayFrame(nextFrame);
        return {
          ...prev,
          currentFrame: nextFrame,
          attempts: prev.attempts + 1
        };
      });      
      
      if (gameState.currentFrame >= 6) {
        setFeedback(`❌ Que pena! O filme era: ${movie.titulo_ptbr}`);
        setGameState(prev => ({ ...prev, showAllFrames: true }));
      } else {
        setFeedback('❌ Tente novamente!');
      }
    }
  };

  const resetGame = () => {
    setGameState({
      currentFrame: 1,
      guess: '',
      isCorrect: false,
      showAllFrames: false,
      attempts: 0
    });
    setFeedback('');
    setSuggestions([]);
    setDisplayFrame(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  useEffect(() => {
    resetGame();
  }, [movie.filme_id]);

  return (
    <div className="movie-game">
      <div className="movie-header">
        <h2>Filme #{movie.filme_id}</h2>
        <div className="movie-info">
          <span className="total-movies">Total: {movies.length} filmes</span>
        </div>
      </div>

      <div className="frames-container">
        {gameState.showAllFrames ? (
          <div className="all-frames">
            {frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index + 1}`}
                className="frame-image"
              />
            ))}
          </div>
        ) : (
          <div className="current-frame">
            <img
              src={frames[displayFrame - 1]}
              alt={`Frame ${displayFrame}`}
              className="frame-image main-frame"
            />
            <div className="frame-counter">
              Chute {gameState.attempts} de 6
            </div>
            <div className="frame-navigation">
              {frames.map((_, index) => (
                index + 1 <= gameState.currentFrame && (
                  <div
                    key={index + 1}
                    className={`frame-nav-item ${displayFrame === index + 1 ? 'active' : ''}`}
                    onClick={() => setDisplayFrame(index + 1)}
                  >
                    {index + 1}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {!gameState.showAllFrames && (
        <div className="guess-section">
          <div className="input-container">
            <input
              type="text"
              value={gameState.guess}
              onChange={(e) => {
                const value = e.target.value;
                setGameState(prev => ({ ...prev, guess: value }));
                generateSuggestions(value);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Digite o nome do filme..."
              className="guess-input"
            />
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      setGameState(prev => ({ ...prev, guess: suggestion }));
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleGuess} className="guess-button">
            Chutar
          </button>
        </div>
      )}

      {feedback && (
        <div className={`feedback ${gameState.isCorrect ? 'correct' : 'incorrect'}`}>
          {feedback}
        </div>
      )}

      {gameState.showAllFrames && (
        <div className="movie-details">
          <h3>{movie.titulo_ptbr}</h3>
          <p><strong>Título Original:</strong> {movie.titulo_original}</p>
          <p><strong>Diretor:</strong> {movie.diretor}</p>
          <p><strong>Gênero:</strong> {movie.genero}</p>
          <p><strong>Ano:</strong> {movie.ano_lancamento}</p>
          <p><strong>Duração:</strong> {movie.duracao_minutos} minutos</p>
          <p><strong>Tentativas:</strong> {gameState.attempts}</p>
        </div>
      )}

      <div className="navigation">
        <button 
          onClick={onPrevious} 
          disabled={isFirst}
          className="nav-button prev"
        >
          ← Anterior
        </button>
        <button 
          onClick={onNext} 
          disabled={isLast}
          className="nav-button next"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
};

export default MovieGame;
