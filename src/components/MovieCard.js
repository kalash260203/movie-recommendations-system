import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const posterPath = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Poster+Available';
    
  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="movie-poster">
          <img src={posterPath} alt={movie.title} />
          {isHovered && (
            <div className="movie-rating">
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
          )}
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
