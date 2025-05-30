import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getMovieDetails, getMovieRecommendations, getMovieVideos } from '../services/tmdbApi';
import { useAppContext } from '../context/AppContext';
import YouTubePlayer from '../components/YouTubePlayer';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [contentRecommendations, setContentRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const {
    addToWatchlist,
    isInWatchlist,
    removeFromWatchlist,
    openTrailerModal,
    searchOnGoogle,
    isAuthenticated
  } = useAppContext();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const [movieResponse, recommendationsResponse, videosResponse] = await Promise.all([
          getMovieDetails(id),
          getMovieRecommendations(id),
          getMovieVideos(id)
        ]);

        setMovie(movieResponse);
        setRecommendations(recommendationsResponse.results || []);
        // Use similar movies as content recommendations
        setContentRecommendations(movieResponse.similar?.results || []);

        // Find trailer from the dedicated videos endpoint
        if (videosResponse && videosResponse.results) {
          const trailers = videosResponse.results.filter(
            video => video.type === 'Trailer' && video.site === 'YouTube'
          );
          if (trailers.length > 0) {
            setTrailer(trailers[0]);
          } else if (movieResponse.videos && movieResponse.videos.results) {
            // Also check videos from the movie details as a fallback
            const detailsTrailers = movieResponse.videos.results.filter(
              video => video.type === 'Trailer' && video.site === 'YouTube'
            );
            if (detailsTrailers.length > 0) {
              setTrailer(detailsTrailers[0]);
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]); // Remove trailer from dependency array to prevent re-renders

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!movie) {
    return <div className="error-message">Movie not found</div>;
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Poster+Available';

  // Format runtime to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="movie-details-container" data-barba-namespace="movie-details">
      {backdropUrl && (
        <div
          className="backdrop"
          style={{
            backgroundImage: `url(${backdropUrl})`,
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        />
      )}

      <div className="movie-details-content">
        <div className="movie-details-header">
          <div className="movie-poster-container">
            <img src={posterUrl} alt={movie.title} className="movie-poster-large" />
            <div className="movie-poster-overlay"></div>
            {isAuthenticated && (
              <div className="poster-actions">
                <button
                  className={`action-button ${isInWatchlist(movie.id) ? 'in-watchlist' : ''}`}
                  onClick={() => isInWatchlist(movie.id)
                    ? removeFromWatchlist(movie.id)
                    : addToWatchlist(movie)
                  }
                >
                  {isInWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            )}
          </div>

          <div className="movie-info-container">
            <h1>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(movie.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {movie.title}
              </a>
              {movie.release_date && <span> ({new Date(movie.release_date).getFullYear()})</span>}
            </h1>

            <div className="movie-meta">
              {movie.release_date && (
                <span className="release-date">
                  <strong>Release Date: </strong>{new Date(movie.release_date).toLocaleDateString()}
                </span>
              )}
              <br/>
              {movie.genres && movie.genres.length > 0 && (
                <span className="genres">
                  <strong>Genres: </strong> {movie.genres.map(g => g.name).join(', ')}
                </span>
              )}
              <br/>
              {movie.runtime && (
                <span className="runtime">
                  <strong>Runtime: </strong> {formatRuntime(movie.runtime)}
                </span>
              )}
            </div>

            <div className="rating-container">
              <div className="rating">
                <strong>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</strong>/10
              </div>
              <span className="vote-count">
                {movie.vote_count} votes
              </span>
            </div>

            {movie.tagline && (
              <div className="tagline">"{movie.tagline}"</div>
            )}

            <div className="overview">
              <h3>Overview</h3>
              <p>{movie.overview || 'No overview available.'}</p>
            </div>
          </div>
        </div>

        {/* New section for cast and trailer below the header */}
        {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
          <div className="cast-and-trailer-section">
            <div className="cast">
              <h3>Cast</h3>
              <div className="cast-list">
                {movie.credits.cast.slice(0, 6).map(person => (
                  <div
                    key={person.id}
                    className="cast-member"
                  >
                    <div className="cast-info">
                      <div
                        className="cast-name-container"
                        onClick={() => searchOnGoogle(person.name)}
                      >
                        <div className="cast-name">{person.name}</div>
                        {person.profile_path && (
                          <div className="cast-image-hover">
                            <img
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name}
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                      <span className="character">as {person.character}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <h1 className="trailer-title">Official Trailer</h1>
            <div className="trailer-inline-box">
              {trailer ? (
                <YouTubePlayer videoId={trailer.key} width="100%" height="100%" />
              ) : (
                <div className="trailer-placeholder">No trailer available.</div>
              )}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>You Might Also Like</h2>
            <div className="movie-grid">
              {recommendations.slice(0, 6).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {contentRecommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>More Recommendations</h2>
            <div className="movie-grid">
              {contentRecommendations.slice(0, 6).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
