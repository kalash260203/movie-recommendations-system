import axios from 'axios';
import { searchMovieTrailer } from './youtubeApi';

// Base URLs for video APIs
const MOVIE_CLIPS_API = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

// Fallback video URLs for testing/development
const FALLBACK_VIDEOS = {
  action: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  drama: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  comedy: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  scifi: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  default: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
};

// Get video sources from TMDB
export const getMovieVideos = async (movieId) => {
  try {
    const response = await axios.get(
      `${MOVIE_CLIPS_API}/movie/${movieId}/videos`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US'
        }
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      // Filter for trailers
      const trailers = response.data.results.filter(
        video => video.type.toLowerCase() === 'trailer' && video.site.toLowerCase() === 'youtube'
      );
      
      // If we have trailers, return the most recent one
      if (trailers.length > 0) {
        // Sort by date (newest first)
        trailers.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        
        return {
          id: trailers[0].key,
          site: trailers[0].site,
          type: trailers[0].type,
          name: trailers[0].name,
          official: trailers[0].official
        };
      }
      
      // If no trailers, return any video
      return {
        id: response.data.results[0].key,
        site: response.data.results[0].site,
        type: response.data.results[0].type,
        name: response.data.results[0].name,
        official: response.data.results[0].official
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    return null;
  }
};

// Get direct video URL from YouTube video ID
export const getDirectVideoUrl = async (youtubeId) => {
  // In a real production app, you would use a server-side proxy to get direct video URLs
  // For this demo, we'll use fallback videos since direct YouTube links require server-side processing
  
  console.log('YouTube ID for direct URL:', youtubeId);
  
  // Return a fallback video URL for demo purposes
  return FALLBACK_VIDEOS.default;
};

// Get trailer for a movie using both TMDB and YouTube
export const getMovieTrailer = async (movie) => {
  try {
    // First try to get videos from TMDB
    const tmdbVideo = await getMovieVideos(movie.id);
    
    if (tmdbVideo) {
      console.log('Found TMDB video:', tmdbVideo);
      
      // For YouTube videos, we need to get a direct URL
      if (tmdbVideo.site.toLowerCase() === 'youtube') {
        const directUrl = await getDirectVideoUrl(tmdbVideo.id);
        
        return {
          videoUrl: directUrl,
          youtubeId: tmdbVideo.id,
          title: tmdbVideo.name,
          posterUrl: `https://img.youtube.com/vi/${tmdbVideo.id}/maxresdefault.jpg`
        };
      }
    }
    
    // If TMDB doesn't have videos, try YouTube search
    const youtubeTrailer = await searchMovieTrailer(
      movie.title || movie.name || movie.original_title,
      movie.release_date ? new Date(movie.release_date).getFullYear() : null
    );
    
    if (youtubeTrailer) {
      console.log('Found YouTube trailer:', youtubeTrailer);
      const directUrl = await getDirectVideoUrl(youtubeTrailer.id);
      
      return {
        videoUrl: directUrl,
        youtubeId: youtubeTrailer.id,
        title: youtubeTrailer.title,
        posterUrl: youtubeTrailer.thumbnail || `https://img.youtube.com/vi/${youtubeTrailer.id}/maxresdefault.jpg`
      };
    }
    
    // If all else fails, return a genre-based fallback
    const genre = movie.genres && movie.genres.length > 0 
      ? movie.genres[0].name.toLowerCase() 
      : 'default';
      
    const fallbackGenre = Object.keys(FALLBACK_VIDEOS).includes(genre) 
      ? genre 
      : 'default';
      
    return {
      videoUrl: FALLBACK_VIDEOS[fallbackGenre],
      title: `${movie.title || movie.name || 'Movie'} Trailer`,
      posterUrl: movie.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null
    };
    
  } catch (error) {
    console.error('Error getting movie trailer:', error);
    
    // Return default fallback
    return {
      videoUrl: FALLBACK_VIDEOS.default,
      title: 'Sample Video (Fallback)',
      posterUrl: null
    };
  }
};
