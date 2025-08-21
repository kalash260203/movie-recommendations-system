import axios from 'axios';
import Movie from '../models/Movie';
import mongoose from 'mongoose';

// TMDB API configuration
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance for TMDB API
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 10000, // 10 second timeout
});

// Initialize MongoDB connection with retry mechanism
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_RETRIES = 3;

const initMongoDB = async () => {
  if (!isConnected && connectionAttempts < MAX_CONNECTION_RETRIES) {
    try {
      await mongoose.connect(process.env.REACT_APP_MONGODB_URI || 'mongodb://localhost:27017/moviedb', {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        retryWrites: true
      });
      isConnected = true;
      connectionAttempts = 0;
      console.log('MongoDB connected successfully');
    } catch (error) {
      connectionAttempts++;
      console.error(`MongoDB connection attempt ${connectionAttempts} failed:`, error);
      if (connectionAttempts >= MAX_CONNECTION_RETRIES) {
        console.error('Max connection retries reached, falling back to API only');
      }
    }
  }
};

// Helper function to check cache
const getFromCache = async (movieId) => {
  await initMongoDB();
  try {
    const cachedMovie = await Movie.findOne({ tmdbId: movieId });
    if (cachedMovie && isMovieCacheValid(cachedMovie)) {
      console.log('Cache hit for movie:', movieId);
      return cachedMovie;
    }
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
};

// Helper function to save to cache
const saveToCache = async (movieData, batch = false) => {
  await initMongoDB();
  try {
    if (batch && Array.isArray(movieData)) {
      await Movie.bulkUpsertMovies(movieData);
      console.log('Batch saved to cache:', movieData.length, 'movies');
    } else {
      const movie = {
        tmdbId: movieData.id,
        ...movieData,
        lastUpdated: new Date()
      };
      await Movie.findOneAndUpdate(
        { tmdbId: movieData.id },
        movie,
        { upsert: true, new: true }
      );
      console.log('Saved to cache:', movieData.id);
    }
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

// Cleanup old cache entries periodically
const cleanupCache = async () => {
  try {
    const result = await Movie.cleanupOldCache();
    console.log('Cleaned up cache:', result.deletedCount, 'entries removed');
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

// Run cleanup every 24 hours
setInterval(cleanupCache, 24 * 60 * 60 * 1000);

// Helper function to check if cache is still valid (24 hours)
const isMovieCacheValid = (movie) => {
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return (Date.now() - new Date(movie.lastUpdated).getTime()) < CACHE_DURATION;
};

// API service functions
export const getTrendingMovies = async () => {
  try {
    const response = await tmdbAxios.get('/trending/movie/week');
    const movies = response.data.results;

    // Batch fetch and cache movie details
    const detailPromises = movies.map(movie =>
      tmdbAxios.get(`/movie/${movie.id}`, {
        params: {
          append_to_response: 'credits,similar,keywords,videos',
        },
      }).catch(err => {
        console.error(`Error fetching details for movie ${movie.id}:`, err);
        return null;
      })
    );

    // Wait for all details to be fetched
    const detailsResponses = await Promise.all(detailPromises);
    const movieDetails = detailsResponses
      .filter(response => response && response.data)
      .map(response => response.data);

    // Batch save to cache
    if (movieDetails.length > 0) {
      await saveToCache(movieDetails, true);
    }

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
    
    // Check if it's a network/ISP blocking issue
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.response?.status === 0) {
      const networkError = new Error('Unable to connect to movie database. This might be due to network restrictions. Please try using a VPN or different network connection.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    
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

// Helper function to retry failed requests
const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
      }
    }
  }
  throw lastError;
};

export const getMovieDetails = async (movieId) => {
  let attempts = 0;
  const fetchDetails = async () => {
    try {
      // Check cache first if MongoDB is connected
      if (isConnected) {
        const cachedMovie = await getFromCache(movieId);
        if (cachedMovie) {
          // Pre-fetch similar movies in the background
          if (cachedMovie.similar && cachedMovie.similar.results) {
            Promise.all(
              cachedMovie.similar.results
                .slice(0, 5)
                .map(async (movie) => {
                  if (!(await getFromCache(movie.id))) {
                    return getMovieDetails(movie.id).catch(() => null);
                  }
                })
            ).catch(err => console.error('Error pre-fetching similar movies:', err));
          }
          return cachedMovie;
        }
      }

      // If not in cache or MongoDB not available, fetch from TMDB
      const response = await retryRequest(() => 
        tmdbAxios.get(`/movie/${movieId}`, {
          params: {
            append_to_response: 'credits,similar,keywords,videos',
          },
        })
      );

      // Try to save to cache if MongoDB is connected
      if (isConnected) {
        await saveToCache(response.data).catch(err => 
          console.error('Failed to save to cache:', err)
        );
      }

      return response.data;
    } catch (error) {
      attempts++;
      if (attempts >= MAX_RETRIES) {
        throw new Error(`Failed to fetch movie details after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      throw error;
    }
  };

  try {
    return await fetchDetails();
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw new Error('Failed to load movie details. Please try again later.');
  }
};

export const getMovieRecommendations = async (movieId) => {
  try {
    // Check cache first
    const cachedMovie = await getFromCache(movieId);
    if (cachedMovie?.recommendations) {
      return { results: cachedMovie.recommendations.results };
    }

    const response = await tmdbAxios.get(`/movie/${movieId}/recommendations`);
    
    // Cache the recommendations with the movie
    const movie = await Movie.findOne({ tmdbId: movieId });
    if (movie) {
      movie.recommendations = response.data;
      await movie.save();
    }

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
    
    // Cache each search result's details in the background
    response.data.results.forEach(async (movie) => {
      await getMovieDetails(movie.id);
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    
    // Check if it's a network/ISP blocking issue
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.response?.status === 0) {
      const networkError = new Error('Unable to connect to movie database. This might be due to network restrictions. Please try using a VPN or different network connection.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    
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

export const getUpcomingMovies = async (page = 1) => {
  try {
    const response = await tmdbAxios.get('/movie/upcoming', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const getMovieVideos = async (movieId) => {
  try {
    // Check cache first
    const cachedMovie = await getFromCache(movieId);
    if (cachedMovie?.videos) {
      return cachedMovie.videos;
    }

    const response = await tmdbAxios.get(`/movie/${movieId}/videos`);
    
    // Cache the videos with the movie
    const movie = await Movie.findOne({ tmdbId: movieId });
    if (movie) {
      movie.videos = response.data;
      await movie.save();
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching videos for movie ID ${movieId}:`, error);
    throw error;
  }
};
