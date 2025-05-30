import React from 'react';
import { useAppContext } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';
import './Watchlist.css';

const Watchlist = () => {
  const { watchlist, isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return (
      <div className="watchlist-container">
        <div className="watchlist-auth-message">
          <h2>Please login to view your watchlist</h2>
          <div className="watchlist-auth-buttons">
            <Link to="/login" className="watchlist-auth-button">Login</Link>
            <Link to="/signup" className="watchlist-auth-button">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <h1>My Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <p>Your watchlist is empty.</p>
          <Link to="/" className="watchlist-browse-button">Browse Movies</Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} showRemoveButton={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
