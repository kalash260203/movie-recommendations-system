import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/tmdbApi';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const response = await searchMovies(query);
        setResults(response.results || []);
        setError(null);
      } catch (err) {
        console.error('Error searching movies:', err);
        setError('Failed to search movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="search-results-container">
      <h1>Search Results for "{query}"</h1>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : results.length === 0 ? (
        <div className="no-results">
          <p>No movies found matching "{query}".</p>
          <p>Try a different search term or browse our trending movies.</p>
        </div>
      ) : (
        <div className="results-grid">
          {results.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
