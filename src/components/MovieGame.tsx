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
    attempts: 0,
    guesses: []
  });

  const [feedback, setFeedback] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [displayFrame, setDisplayFrame] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const generateSuggestions = (input: string) => {
    if (input.length < 1) {
      setSuggestions([]);
      return;
    }

    const inputLower = input.toLowerCase();

    // Criar lista de sugestões com informações completas
    const suggestionsWithInfo = movies
      .map((m: Movie) => ({
        titulo: m.titulo_ptbr,
        ano: m.ano_lancamento,
        original: m.titulo_original
      }))
      .filter((movie) => 
        movie.titulo.toLowerCase().includes(inputLower) ||
        movie.original.toLowerCase().includes(inputLower)
      );

    // Agrupar por título para identificar duplicatas
    const groupedByTitle = suggestionsWithInfo.reduce((acc, movie) => {
      if (!acc[movie.titulo]) {
        acc[movie.titulo] = [];
      }
      acc[movie.titulo].push(movie);
      return acc;
    }, {} as Record<string, typeof suggestionsWithInfo>);

    // Criar lista final com anos para duplicatas
    const finalSuggestions: string[] = [];
    
    Object.keys(groupedByTitle).forEach(titulo => {
      const moviesWithSameTitle = groupedByTitle[titulo];
      
      if (moviesWithSameTitle.length === 1) {
        // Título único, adicionar sem ano
        finalSuggestions.push(titulo);
      } else {
        // Títulos duplicados, adicionar com ano
        moviesWithSameTitle.forEach(movie => {
          finalSuggestions.push(`${titulo} (${movie.ano})`);
        });
      }
    });

    // Ordenar alfabeticamente e limitar a 10
    const sortedSuggestions = finalSuggestions
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .slice(0, 10);

    setSuggestions(sortedSuggestions);
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
    if (isProcessing) return; // Evitar duplo clique
    
    setIsProcessing(true);

    const rawGuess = gameState.guess.trim();
    const displayGuess = rawGuess.length === 0 ? 'Passou' : gameState.guess;
    const normalizedGuess = rawGuess.toLowerCase();
    const normalizedTitle = movie.titulo_ptbr.toLowerCase();
    const normalizedOriginal = movie.titulo_original.toLowerCase();

    // Verificar se o palpite corresponde ao título com ou sem ano
    const guessWithoutYear = normalizedGuess.replace(/\s*\(\d{4}\)\s*$/, '');
    const titleWithYear = `${normalizedTitle} (${movie.ano_lancamento})`;
    const originalWithYear = `${normalizedOriginal} (${movie.ano_lancamento})`;

    const isCorrectGuess = 
      normalizedGuess === normalizedTitle || 
      normalizedGuess === normalizedOriginal ||
      normalizedGuess === titleWithYear ||
      normalizedGuess === originalWithYear ||
      guessWithoutYear === normalizedTitle ||
      guessWithoutYear === normalizedOriginal;
    
    // Limpar o input após qualquer chute
    setGameState(prev => ({ ...prev, guess: '' }));
    setSuggestions([]);
    
    if (isCorrectGuess) {
      setGameState(prev => ({
        ...prev,
        isCorrect: true,
        showAllFrames: true,
        attempts: prev.attempts + 1,
        guesses: [...prev.guesses, '✅ ' + displayGuess]
      }));
      setFeedback('🎉 Parabéns! Você acertou!');
    } else {
      setGameState(prev => {
        const nextFrame = Math.min(prev.currentFrame + 1, 6);
        setDisplayFrame(nextFrame);
        return {
          ...prev,
          currentFrame: nextFrame,
          attempts: prev.attempts + 1,
          guesses: [...prev.guesses, '❌ ' + displayGuess]
        };
      });      
      
      if (gameState.currentFrame >= 6) {
        setFeedback(`❌ Que pena! O filme era: ${movie.titulo_ptbr}`);
        setGameState(prev => ({ ...prev, 
                                showAllFrames: true
                              }));
      } else {
        setFeedback('❌ Tente novamente!');
      }
    }
    
    // Liberar o processamento após um pequeno delay
    setTimeout(() => setIsProcessing(false), 300);
  };

  useEffect(() => {console.log(gameState)}, [gameState])

  const resetGame = () => {
    setGameState({
      currentFrame: 1,
      guess: '',
      isCorrect: false,
      showAllFrames: false,
      attempts: 0,
      guesses: []
    });
    setFeedback('');
    setSuggestions([]);
    setDisplayFrame(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Se há sugestões disponíveis, inserir a primeira
      if (suggestions.length > 0) {
        setGameState(prev => ({ ...prev, guess: suggestions[0] }));
        setSuggestions([]);
      } else {
        // Se não há sugestões, fazer o chute
        handleGuess();
      }
    }
  };

  const openModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % frames.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + frames.length) % frames.length);
  };

  useEffect(() => {
    resetGame();
  }, [movie.filme_id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isModalOpen]);

  return (
    <div className="movie-game">
      {/* LADO ESQUERDO — IMAGEM */}
      <div className="main-frame">
        {gameState.showAllFrames ? (
          <div className="all-frames">
            {frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index + 1}`}
                className="frame-image clickable-frame"
                onClick={() => openModal(index)}
              />
            ))}
          </div>
        ) : (
          <div className="current-frame">
            <img
              src={frames[displayFrame - 1]}
              alt={`Frame ${displayFrame}`}
              className="frame-image"
            />
            <div className="frame-navigation thumbs">
              {frames.map((frameSrc, index) =>
                index + 1 <= gameState.currentFrame ? (
                  <div
                    key={index}
                    className={`frame-thumb ${displayFrame === index + 1 ? 'active' : ''}`}
                    onClick={() => setDisplayFrame(index + 1)}
                    title={`Frame ${index + 1}`}
                  >
                    <img src={frameSrc} alt={`Miniatura do frame ${index + 1}`} />
                    <span className="thumb-number">{index + 1}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* LADO DIREITO — INFO E CONTROLES */}
      <div className="side-panel">
        {/* CABEÇALHO DO FILME - NO TOPO */}
        <div className="movie-header">
          <h2>Filme #{movie.filme_id}</h2>
          {/* <span className="total-movies">Total: {movies.length} filmes</span> */}
        </div>

        {/* SEÇÃO CENTRAL - INPUT E BOTÃO CHUTAR */}
        <div className="center-section">
          {!gameState.showAllFrames && (
            <div className="guess-section">
              <div className="input-container">
                <input
                  type="text"
                  value={gameState.guess}
                  onChange={(e) => {
                    const value = e.target.value;
                    setGameState((prev) => ({ ...prev, guess: value }));
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
                          setGameState((prev) => ({
                            ...prev,
                            guess: suggestion,
                          }));
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

          <div className="feedback-container">
            {feedback && (
              <div
                className={`feedback ${gameState.isCorrect ? "correct" : "incorrect"}`}
              >
                {feedback}
              </div>
            )}
          </div>

          {gameState.showAllFrames && (
            <div className="movie-details">
              <h3>{movie.titulo_ptbr}</h3>
              <p>
                <strong>Título Original:</strong> {movie.titulo_original}
              </p>
              <p>
                <strong>Diretor:</strong> {movie.diretor}
              </p>
              <p>
                <strong>Gênero:</strong> {movie.genero}
              </p>
              <p>
                <strong>Ano:</strong> {movie.ano_lancamento}
              </p>
              <p>
                <strong>Duração:</strong>{" "}
                {(() => {
                  const horas = Math.floor(movie.duracao_minutos / 60);
                  const minutos = movie.duracao_minutos % 60;
                  if (horas === 0) {
                    return `${minutos} minuto${minutos !== 1 ? "s" : ""}`;
                  } else if (minutos === 0) {
                    return `${horas} hora${horas !== 1 ? "s" : ""}`;
                  } else {
                    return `${horas} hora${horas !== 1 ? "s" : ""} e ${minutos} minuto${minutos !== 1 ? "s" : ""}`;
                  }
                })()}
              </p>
              <p>
                <strong>Tentativas:</strong> {gameState.attempts}
              </p>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO - NO FINAL */}
        <div className="navigation">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="nav-button prev"
          >
            ←
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="nav-button next"
          >
            →
          </button>
        </div>
        {
            gameState.guesses.length === 0 ? '' :
            <div className="guessesContainer">
              <h3>Tentativas Anteriores:</h3>
              {gameState.guesses.map((x) => 
              <div key={x} className="previousGuesses">
                <p>
                  {x.slice(0, 1)}
                </p>
                <p>
                  {x.slice(2, x.length)}
                </p>
                <p></p>
              </div>
                )}
            </div>
        }
      </div>

      {/* MODAL DO CARROSSEL   */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="carousel-container">
              <button className="carousel-btn prev-btn" onClick={prevImage}>
                ‹
              </button>
              <img
                src={frames[currentImageIndex]}
                alt={`Frame ${currentImageIndex + 1}`}
                className="carousel-image"
              />
              <button className="carousel-btn next-btn" onClick={nextImage}>
                ›
              </button>
            </div>
            <div className="carousel-indicators">
              {frames.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
            <div className="carousel-info">
              <p>Frame {currentImageIndex + 1} de {frames.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default MovieGame;
