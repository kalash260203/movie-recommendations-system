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

// Helper function to score a YouTube video based on its title and metadata
const scoreTrailer = (video, movieTitle, releaseYear) => {
  let score = 0;
  const title = video.snippet.title.toLowerCase();
  const description = video.snippet.description.toLowerCase();
  const channelTitle = video.snippet.channelTitle.toLowerCase();
  movieTitle = movieTitle.toLowerCase();

  // Check for key phrases
  if (title.includes('official')) score += 10;
  if (title.includes('trailer')) score += 5;
  if (title.includes(movieTitle)) score += 15;
  if (releaseYear && (title.includes(releaseYear) || description.includes(releaseYear))) score += 5;
  if (title.includes('teaser')) score -= 2; // Prefer full trailers over teasers
  if (channelTitle.includes('movies') || channelTitle.includes('official')) score += 5;
  if (title.includes('hd') || title.includes('1080p')) score += 3;
  if (title.includes('fan') || title.includes('reaction')) score -= 10; // Penalize fan-made content
  if (channelTitle.includes('react') || channelTitle.includes('gaming')) score -= 5;
  
  // Additional checks for authenticity
  const verifiedChannels = ['universal pictures', 'warner bros', 'sony pictures', 'lionsgate', 'a24', 'paramount'];
  if (verifiedChannels.some(channel => channelTitle.includes(channel))) score += 15;
  
  return score;
};

// Search for movie trailers on YouTube
export const searchMovieTrailer = async (movieTitle, releaseYear) => {
  try {
    // Build a list of search queries from most specific to least specific
    const queries = [
      `${movieTitle} ${releaseYear || ''} Official Trailer HD`,
      `${movieTitle} ${releaseYear || ''} Movie Trailer`,
      `${movieTitle} Official Trailer ${releaseYear || ''}`,
      `${movieTitle} Trailer ${releaseYear || ''} Movie`,
      `${movieTitle} Movie Trailer ${releaseYear || ''}`,
      `${movieTitle} Trailer`
    ];

    let bestMatch = null;
    let highestScore = -1;

    // Try each query until we find a good result
    for (const query of queries) {
      console.log('Searching YouTube with query:', query);

      const response = await youtubeAxios.get('/search', {
        params: {
          q: query,
          maxResults: 10,
          type: 'video',
          videoDefinition: 'high',
          videoEmbeddable: 'true',
          relevanceLanguage: 'en',
          videoDuration: 'short',
          videoCaption: 'any',
          order: 'relevance',
          part: 'snippet,id',
          regionCode: 'US',
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        // Score each result and keep the best one
        for (const video of response.data.items) {
          const score = scoreTrailer(video, movieTitle, releaseYear);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = video;
          }
        }

        // If we found a good match (score > 20), use it
        if (highestScore > 20) {
          break;
        }
      }
    }

    // If we found a good match, return it
    if (bestMatch && highestScore > 0) {
      console.log('Found trailer with score:', highestScore, bestMatch.snippet.title);
      return {
        id: bestMatch.id.videoId,
        title: bestMatch.snippet.title,
        thumbnail: bestMatch.snippet.thumbnails.high.url,
        score: highestScore
      };
    }

    console.log('No suitable trailer found for:', movieTitle);
    return null;
  } catch (error) {
    console.error('Error searching for movie trailer:', error);
    return null;
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
