import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './MovieCard.css';

const MovieCard = ({ movie, showRemoveButton }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, isAuthenticated } = useAppContext();

  // Use smaller image size for better performance
  const posterPath = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Poster+Available';

  // Use useCallback to prevent recreation of these functions on each render
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Handle watchlist actions
  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (showRemoveButton || isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <div
      className="movie-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/movie/${movie.id}`} className="barba-link">
        <div className="movie-poster">
          <img
            src={posterPath}
            alt={movie.title}
            loading="lazy"
            decoding="async"
          />
          {isHovered && (
            <div className="movie-rating">
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
          )}

          {isAuthenticated && isHovered && (
            <button
              className={`watchlist-button ${isInWatchlist(movie.id) ? 'in-watchlist' : ''}`}
              onClick={handleWatchlistClick}
            >
              {showRemoveButton || isInWatchlist(movie.id) ? '✓' : '+'}
            </button>
          )}

          <div className="view-details">View Details</div>
        </div>
        <div className="movie-info">
          <h3>{movie.title}</h3>
          {movie.release_date && (
            <p className="release-date">
              {new Date(movie.release_date).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
