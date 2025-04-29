import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getMovieDetails, getMovieRecommendations } from '../services/tmdbApi';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [contentRecommendations, setContentRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const [movieResponse, recommendationsResponse] = await Promise.all([
          getMovieDetails(id),
          getMovieRecommendations(id)
        ]);

        setMovie(movieResponse);
        setRecommendations(recommendationsResponse.results || []);
        // Use similar movies as content recommendations
        setContentRecommendations(movieResponse.similar?.results || []);
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
  }, [id]);

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
    <div className="movie-details-container">
      {backdropUrl && (
        <div
          className="backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      <div className="movie-details-content">
        <div className="movie-details-header">
          <div className="movie-poster-container">
            <img src={posterUrl} alt={movie.title} className="movie-poster-large" />
          </div>

          <div className="movie-info-container">
            <h1>{movie.title} {movie.release_date && <span>({new Date(movie.release_date).getFullYear()})</span>}</h1>

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

            {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
              <div className="cast">
                <h3>Cast</h3>
                <div className="cast-list">
                  {movie.credits.cast.slice(0, 6).map(person => (
                    <div key={person.id} className="cast-member">
                      {person.name} <span className="character">as {person.character}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>Recommendations</h2>
            <div className="movie-grid">
              {recommendations.slice(0, 6).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {contentRecommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>Content-Based Recommendations</h2>
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
