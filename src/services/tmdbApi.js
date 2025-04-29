import axios from 'axios';

// TMDB API configuration
const TMDB_API_KEY = '5cca7546432bdc71cb0a6af5beab0e16'; // Using the key from your .env file
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance for TMDB API
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// API service functions
export const getTrendingMovies = async () => {
  try {
    const response = await tmdbAxios.get('/trending/movie/week');
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbAxios.get('/movie/popular', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbAxios.get('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbAxios.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,similar,keywords',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
};

export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await tmdbAxios.get(`/movie/${movieId}/recommendations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommendations for movie ID ${movieId}:`, error);
    throw error;
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await tmdbAxios.get('/search/movie', {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    const response = await tmdbAxios.get('/genre/movie/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};
