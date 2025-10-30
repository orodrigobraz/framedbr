export interface Movie {
  filme_id: number;
  titulo_ptbr: string;
  titulo_original: string;
  diretor: string;
  genero: string;
  duracao_minutos: number;
  ano_lancamento: number;
  imagens: {
    imagem_frame1: string;
    imagem_frame2: string;
    imagem_frame3: string;
    imagem_frame4: string;
    imagem_frame5: string;
    imagem_frame6: string;
  };
}

export interface MoviesData {
  filmes: Movie[];
}

export interface GameState {
  currentFrame: number;
  guess: string;
  isCorrect: boolean;
  showAllFrames: boolean;
  attempts: number;
  guesses: {index: number, text: string, type: string}[];
}


export interface MovieGameProps {
  movie: Movie;
  movies: Movie[];
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export interface castMember{
  id: number;
  name: string;
  character: string;
  job: string;
}

export interface crewMember{
  id: number;
  name: string;
  job: string;
}

export interface MovieCredits {
  cast: castMember[];
  crew: crewMember[];
}