import React, { useState, useEffect } from 'react';
import MovieGame from './components/MovieGame';
import { Movie, MoviesData } from './types/Movie';
import './App.css';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadMovies = async () => {
    try {
      const response = await fetch(process.env.PUBLIC_URL + '/filmes.json');
      if (!response.ok) {
        throw new Error('Erro ao carregar filmes');
      }
      const data: MoviesData = await response.json();
      setMovies(data.filmes);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  loadMovies();
}, []);


  const handleNext = () => {
    if (currentMovieIndex < movies.length - 1) {
      setCurrentMovieIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentMovieIndex > 0) {
      setCurrentMovieIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Carregando filmes...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Erro: {error}</h2>
          <p>Verifique se o arquivo filmes.json está na pasta public.</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="app">
        <div className="no-movies">
          <h2>Nenhum filme encontrado</h2>
          <p>Adicione filmes ao arquivo filmes.json</p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentMovieIndex];

  return (
    <div className="app">
      <header className="app-header">
        <h1>FrameDBR</h1>
      </header>

      <main className="app-main">
        <MovieGame
          movie={currentMovie}
          movies={movies}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentMovieIndex === 0}
          isLast={currentMovieIndex === movies.length - 1}
        />
      </main>

    </div>
  );
}

export default App;
