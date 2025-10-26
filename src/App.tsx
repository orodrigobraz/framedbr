import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import MovieGame from './components/MovieGame';
import { Movie, MoviesData } from './types/Movie';
import './App.css';

const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
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
    if (id) {
      const currentId = parseInt(id);
      const currentIndex = movies.findIndex(m => m.filme_id === currentId);
      if (currentIndex < movies.length - 1) {
        const nextMovie = movies[currentIndex + 1];
        navigate(`/${nextMovie.filme_id}`);
      }
    }
  };

  const handlePrevious = () => {
    if (id) {
      const currentId = parseInt(id);
      const currentIndex = movies.findIndex(m => m.filme_id === currentId);
      if (currentIndex > 0) {
        const prevMovie = movies[currentIndex - 1];
        navigate(`/${prevMovie.filme_id}`);
      }
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

  if (!id) {
    // Redirecionar para o último filme se não houver ID na URL
    const lastMovie = movies[movies.length - 1];
    navigate(`/${lastMovie.filme_id}`, { replace: true });
    return null;
  }

  const currentMovie = movies.find(m => m.filme_id === parseInt(id));
  
  if (!currentMovie) {
    return (
      <div className="app">
        <div className="error">
          <h2>Filme não encontrado</h2>
          <p>O filme com ID {id} não existe.</p>
        </div>
      </div>
    );
  }

  const currentIndex = movies.findIndex(m => m.filme_id === parseInt(id));

  return (
    <div className="app">
      <header className="app-header">
        <h1>Framedbr</h1>
      </header>

      <main className="app-main">
        <MovieGame
          movie={currentMovie}
          movies={movies}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === movies.length - 1}
        />
      </main>
    </div>
  );
};

function App() {
  // Detectar se está em produção (GitHub Pages) ou desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production';
  const basename = isProduction ? '/framedbr' : '/';

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<MoviePage />} />
        <Route path="/:id" element={<MoviePage />} />
      </Routes>
    </Router>
  );
}

export default App;
