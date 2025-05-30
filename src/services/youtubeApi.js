import axios from 'axios';
import { YOUTUBE_API_KEY, YOUTUBE_API_BASE_URL } from '../config/youtube';

// Create axios instance for YouTube API
const youtubeAxios = axios.create({
  baseURL: YOUTUBE_API_BASE_URL,
  params: {
    key: YOUTUBE_API_KEY,
    part: 'snippet',
  },
});

// Search for movie trailers on YouTube
export const searchMovieTrailer = async (movieTitle, releaseYear) => {
  try {
    // Try with a more specific query first
    const specificQuery = `${movieTitle} ${releaseYear || ''} official trailer HD`;
    console.log('Searching YouTube with query:', specificQuery);

    let response = await youtubeAxios.get('/search', {
      params: {
        q: specificQuery,
        maxResults: 5, // Get a few results to choose from
        type: 'video',
        videoDefinition: 'high', // Prefer high definition videos
        videoEmbeddable: 'true',
        relevanceLanguage: 'en',
        safeSearch: 'none',
        videoDuration: 'short', // Trailers are usually short
        videoCaption: 'closedCaption', // Prefer videos with captions for better quality content
        order: 'relevance', // Sort by relevance
        part: 'snippet,id', // Get more details
      },
    });

    // If no results, try a more general query
    if (!response.data.items || response.data.items.length === 0) {
      const generalQuery = `${movieTitle} trailer`;
      console.log('No results found, trying with:', generalQuery);

      response = await youtubeAxios.get('/search', {
        params: {
          q: generalQuery + " HD 1080p",
          maxResults: 5,
          type: 'video',
          videoDefinition: 'high',
          videoEmbeddable: 'true',
          order: 'relevance',
          part: 'snippet,id',
        },
      });
    }

    if (response.data.items && response.data.items.length > 0) {
      // Look for official trailers first
      const officialTrailer = response.data.items.find(item =>
        item.snippet.title.toLowerCase().includes('official') &&
        item.snippet.title.toLowerCase().includes('trailer')
      );

      // If found an official trailer, use it
      if (officialTrailer) {
        console.log('Found official trailer:', officialTrailer.snippet.title);
        return {
          id: officialTrailer.id.videoId,
          title: officialTrailer.snippet.title,
          thumbnail: officialTrailer.snippet.thumbnails.high.url,
        };
      }

      // Otherwise use the first result
      console.log('Using first result:', response.data.items[0].snippet.title);
      return {
        id: response.data.items[0].id.videoId,
        title: response.data.items[0].snippet.title,
        thumbnail: response.data.items[0].snippet.thumbnails.high.url,
      };
    }

    console.log('No trailer found for:', movieTitle);
    return null;
  } catch (error) {
    console.error('Error searching for movie trailer:', error);
    // Return a fallback for development/testing
    console.log('Using fallback trailer for development');
    return {
      id: 'dQw4w9WgXcQ', // A well-known video that's always available
      title: `${movieTitle} Trailer (Fallback)`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    };
  }
};

// Get video details by ID
export const getVideoDetails = async (videoId) => {
  try {
    const response = await youtubeAxios.get('/videos', {
      params: {
        id: videoId,
        part: 'snippet,contentDetails,statistics,status,player',
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      // Log available formats for debugging
      console.log('Video details:', response.data.items[0]);

      // Check if the video has HD available
      const hasHD = response.data.items[0].contentDetails?.definition === 'hd';
      console.log('Video has HD:', hasHD);

      return {
        ...response.data.items[0],
        hasHD
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
};
