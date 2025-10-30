import React, { useState, useEffect, useRef } from 'react';
import { Movie, GameState, MovieGameProps, MovieCredits, castMember, crewMember } from '../types/Movie';
import { fetchDataMovieCredits, fetchDataMovieSearch, fetchDataPeopleSearch, fetchDataPersonCredits } from "../services/api";
import './MovieGame.css';

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
  const [suggestions, setSuggestions] = useState<{title: string, original_title: string, type: string, disabled: boolean}[]>([]);
  const [displayFrame, setDisplayFrame] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [movieCredits, setMovieCredits] = useState<MovieCredits>({cast: [], crew: []});
  const [castGuesses, setCastGuesses] = useState<{id: number, name: string, job: string, personCredits: {id: number, original_title: string, title: string}[]}[]>([]);

  const inputPesquisaRef = useRef(null);

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
    
    const atualGuess = gameState.guess;
    const normalizedGuess = gameState.guess.includes(' | ') ? 
                              gameState.guess.toLowerCase().trim().split(' | ')[1] : 
                              gameState.guess.toLowerCase().trim();
    // const normalizedGuessType = gameState.guess.includes(' | ') ? 
    //                             gameState.guess.toLowerCase().trim().split(' | ')[0] : 
    //                             '';
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

    const isPartialGuess = 
      movieCredits.cast.some((x) => x.name.toLowerCase() === normalizedGuess) ||// && x.job.toLowerCase() === normalizedGuessType) ||
      movieCredits.crew.some((x) => x.name.toLowerCase() === normalizedGuess)// && x.job.toLowerCase() === normalizedGuessType);

    // Limpar o input após qualquer chute
    setGameState(prev => ({ ...prev, guess: '' }));
    setSuggestions([]);
    let nextFrame = gameState.currentFrame + 1;

    if (isCorrectGuess) {
      setGameState(prev => ({
        ...prev,
        isCorrect: true,
        showAllFrames: true,
        attempts: prev.attempts + 1,
        guesses: [...prev.guesses, {index: prev.attempts + 1, text: atualGuess, type: 'correct'}]
      }));
      setFeedback('🎉 Parabéns! Você acertou!');
    } 
    else if (isPartialGuess){
      
        
        setDisplayFrame(nextFrame);

        movieCredits.cast
          .filter((x) => x.name.toLowerCase() == normalizedGuess) // && x.job.toLowerCase() === normalizedGuessType)
          .map((x:any) => {
            
            fetchDataPersonCredits(x.id)
            .then((res) => {
              const personCredits: any[] = []
              res.cast
              .filter((x:any) => x.popularity >= 1)
              .map((x:any) => {
                personCredits.push({id: x.id, original_title: x.original_title, title: x.title})
              })
              setCastGuesses([...castGuesses, {id: x.id, name: x.name, job: x.job === '' ? 'Actor' : x.job, personCredits: personCredits}])
            })
            .catch((err) => console.error(err));
            
          });

        movieCredits.crew
          .filter((x) => x.name.toLowerCase() == normalizedGuess)// && x.job.toLowerCase() === normalizedGuessType)
          .map((x:any) => {
            fetchDataPersonCredits(x.id)
            .then((res) => {
              const personCredits: any[] = []
              res.crew
              .filter((x:any) => x.popularity >= 1)
              .map((x:any) => {
                personCredits.push({id: x.id, original_title: x.original_title, title: x.title})
              })
              setCastGuesses([...castGuesses, {id: x.id, name: x.name, job: x.job === '' ? 'Actor' : x.job, personCredits: personCredits}])
            })
            .catch((err) => console.error(err));

          });

        
        const feedbackOptions = [
            "🎯 Você está quase acertando!",
            "🤏 Por pouco, continue tentando!",
            "😅 Quase lá, falta pouco!",
            "🫣 Está chegando perto!",
            "🏹 Mira boa, só ajustar um pouco!"
          ];

        setFeedback(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);

        setGameState(prev =>  ({
          ...prev,
          currentFrame: nextFrame,
          attempts: prev.attempts + 1,
          guesses: [...prev.guesses, {index: prev.attempts + 1, text: atualGuess, type: 'partial'}]
        }));
    }
    else if (nextFrame <= 6) {
      setFeedback('❌ Tente novamente!');
  
      // nextFrame = Math.min(gameState.currentFrame + 1, 6);
      setDisplayFrame(nextFrame);
      setGameState(prev => ({
          ...prev,
          currentFrame: nextFrame,
          attempts: prev.attempts + 1,
          guesses: [...prev.guesses, {index: prev.attempts + 1, text: atualGuess == '' ? 'Pulou' : atualGuess, type: 'incorrect'}]
      }));
    }
    else {
      setFeedback(`❌ Que pena! O filme era: ${movie.titulo_ptbr}`);
      setGameState(prev => ({ ...prev, 
                              showAllFrames: true, 
                              guesses: [...prev.guesses, {index: prev.attempts + 1, text: atualGuess == '' ? 'Pulou' : atualGuess, type: 'incorrect'}] 
                            }));
    }

    // Liberar o processamento após um pequeno delay
    setTimeout(() => setIsProcessing(false), 300);
  };

  const commonMoviesBetweenCastGuesses = () => {
    if(castGuesses.length > 0){
      return castGuesses.reduce((creditosAcumulados, pessoaAtual) => {
        // 1. Obtemos os créditos da pessoa atual.
        const creditosAtuais = pessoaAtual.personCredits;
        
        // 2. Filtramos os créditos ACUMULADOS, mantendo apenas aqueles que
        //    também existem nos créditos da pessoa ATUAL.
        return creditosAcumulados.filter(creditoAcumulado => {
          // Usamos 'some' para verificar a existência do crédito.
          return creditosAtuais.some(creditoAtual => 
            creditoAtual.id === creditoAcumulado.id
          );
        });

        // O valor inicial (o 'initialValue' do reduce) são os créditos da primeira pessoa.
      }, castGuesses[0].personCredits || []);

    }
  }

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
    setCastGuesses([]);
    setMovieCredits({cast: [], crew: []})
  };

    useEffect(() => {
      // Define o timer de 1000ms (1 segundos)
      const timer = setTimeout(() => {
      // Chama a função de busca após 1 segundos
        if(gameState.guess.length > 0){
          fetchMoviesSuggestions(gameState.guess);
        }
      }, 500);

      // Função de limpeza (Cleanup Function)
      // Esta função é executada ANTES que o próximo useEffect seja executado 
      // ou quando o componente é desmontado.
      return () => {
        console.log('Limpando timer anterior...');
        clearTimeout(timer);
      };
    }, [gameState.guess])

    // Função que será chamada após o debounce
  const fetchMoviesSuggestions = async (query: string) => {
    // Evita a chamada se a query estiver vazia ou for muito curta
    // if (!query.trim() || query.length < 2) {
    //   setSuggestions([]);
    //   setIsProcessing(false);
    //   return;
    // }

    setIsProcessing(true);
    setSuggestions([]); // Limpa resultados anteriores
    
    try {
      let localSuggestions: {title: string, original_title: string, type: string, disabled: boolean}[] = []

      // Usando o novo endpoint de proxy '/api' que configuramos anteriormente
      await fetchDataPeopleSearch(query.toLowerCase().trim())
        .then((res) => {
          const results = res.results;
          results
              .filter((x: any) => x.popularity > 1)
              .map((x: any) => {localSuggestions.push({title: x.name, original_title: x.original_name, type: x.known_for_department == 'Acting' ? 'Ator/Atriz' : x.known_for_department == 'Directing' ? 'Diretor(a)' : x.known_for_department, disabled: false})})
        })
        .catch((err) => console.error(err));
    
    const commonMovies = await commonMoviesBetweenCastGuesses();

    if(commonMovies && commonMovies.length > 0){
      commonMovies
        .filter(x => x.title.toLowerCase().trim().includes(query.toLowerCase().trim()) || x.original_title.toLowerCase().trim().includes(query.toLowerCase().trim()))
        .map((x: any) => {localSuggestions.push({title: x.title, original_title: x.original_title, type: 'Filme', disabled: false})})
    }
    else{ 
      await fetchDataMovieSearch(query.toLowerCase().trim())
        .then((res) => {
          const results = res.results;
          results
            .filter((x: any) => x.popularity > 1)
            .map((x: any) => {localSuggestions.push({title: x.title, original_title: x.original_title, type: 'Filme', disabled: false})})
        })
        .catch((err) => console.error(err));
    }

    if(localSuggestions.length == 0){
      localSuggestions.push({title: 'Nenhuma sugestão encontrada', original_title: '', type: '', disabled: true})
    }

    setSuggestions( localSuggestions)

    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
      // Aqui você pode adicionar lógica para mostrar uma mensagem de erro ao usuário
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Se há sugestões disponíveis, inserir a primeira
      if (suggestions.length > 0) {
        setGameState(prev => ({ ...prev, guess: suggestions[0].title }));
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

  useEffect(() => {
    let currentMovieID = 0

    const carregaInfoFilme = async () => {

      currentMovieID = await fetchDataMovieSearch(movie.titulo_original)
        .then((res) => {return res.results.filter((x:any) => x.release_date.includes(movie.ano_lancamento))[0].id})
        .catch((err) => console.error(err));
        
        if (currentMovieID > 0) {
          await fetchDataMovieCredits(currentMovieID)
          .then((res) => {
            console.log(res)
            let creditsCast: castMember[] = []
            let creditsCrew: crewMember[] = []
            res.cast.map((x: any) => creditsCast.push({ id: x.id, name: x.name, character: x.character, job: x.known_for_department }))
            res.crew.map((x: any) => creditsCrew.push({ id: x.id, name: x.name, job: x.known_for_department }))
            setMovieCredits({cast: creditsCast, crew: creditsCrew})
          })
          .catch((err) => console.error(err));
      }
    }
    carregaInfoFilme()
  }, [movie])

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
            <div className="frame-navigation">
              {frames.map((_, index) =>
                index + 1 <= gameState.currentFrame ? (
                  <div
                    key={index + 1}
                    className={`frame-nav-item ${
                      displayFrame === index + 1 ? "active" : ""
                    }`}
                    onClick={() => setDisplayFrame(index + 1)}
                  >
                    {index + 1}
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
                    // generateSuggestions(value);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite o nome do filme, diretor(a), ator, ..."
                  className="guess-input"
                  ref={inputPesquisaRef}
                />
                {suggestions.length > 0 && document.activeElement === inputPesquisaRef.current && (
                  <div className="suggestions">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`${suggestion.disabled ? 'suggestion-item-disabled' : 'suggestion-item'}`}
                        onClick={() => {
                          if(!suggestion.disabled){
                            setGameState((prev) => ({
                              ...prev,
                              guess: suggestion.title,
                            }));

                            setSuggestions([]);
                          }
                        }}
                      >
                        {suggestion.type} | {suggestion.title}
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
                className={`feedback feedback-${gameState.guesses[gameState.guesses.length - 1].type}`}
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
        
        {/* TENTATIVAS ANTERIORES */
            gameState.guesses.length === 0 ? '' :
            <div className="guessesContainer">
              <h3>Tentativas Anteriores:</h3>
              {gameState.guesses.map((x) => 
              <div key={x.index} className={`previousGuesses feedback-${x.type}`}>
                <p>{x.type == 'correct' ? '✅ ' : x.type == 'partial' ? '🔄 ' : '❌ '}</p>
                <p>{x.text}</p>
                <p></p>
              </div>
                )}
            </div>
        }

        {/* NAVEGAÇÃO - NO FINAL */}
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

          {/* <button onClick={() => console.log(movieID)}>Teste</button> */}
        </div>

      </div>

      {/* MODAL DO CARROSSEL */}
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
