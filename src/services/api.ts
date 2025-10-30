const API_URL = "/api";
const API_AUTHORIZATION = process.env.REACT_APP_API_TMDB_AUTORIZATION; // chave no .env
const API_KEY = process.env.REACT_APP_API_TMDB_KEY; // chave no .env


export async function fetchDataMovieSearch(query: string): Promise<any> {
  try {
    const response = await 
    fetch(API_URL + '/3/search/movie?query=' + query + '&language=pt-BR', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_AUTHORIZATION}`, // adicionando a autorização da API
        "x-api-key": `${API_KEY}` // adicionando a chave
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
}

export async function fetchDataPeopleSearch(query: string): Promise<any> {
  try {
    const response = await 
    fetch(API_URL + '/3/search/person?query=' + query + '&language=pt-BR', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_AUTHORIZATION}`, // adicionando a autorização da API
        "x-api-key": `${API_KEY}` // adicionando a chave
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
}



export async function fetchDataMovieCredits(movieID: number): Promise<any> {
  try {
    const response = await 
    fetch(API_URL + '/3/movie/'+ movieID +'/credits?language=pt-BR', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_AUTHORIZATION}`, // adicionando a autorização da API
        "x-api-key": `${API_KEY}` // adicionando a chave
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
}

export async function fetchDataPersonCredits(personID: number): Promise<any> {
  try {
    const response = await 
    fetch(API_URL + '/3/person/'+ personID +'/movie_credits?language=pt-BR', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_AUTHORIZATION}`, // adicionando a autorização da API
        "x-api-key": `${API_KEY}` // adicionando a chave
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
}