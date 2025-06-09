import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getTrendingMovies, getUpcomingMovies } from '../services/tmdbApi';
import './Home.css';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [trendingResponse, upcomingResponse] = await Promise.all([
          getTrendingMovies(),
          getUpcomingMovies()
        ]);

        // Only take the first 6 movies to improve performance
        setTrendingMovies((trendingResponse.results || []).slice(0, 6));
        setUpcomingMovies((upcomingResponse.results || []).slice(0, 6));
        setError(null);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Memoize the movie cards to prevent unnecessary re-renders
  const trendingMovieCards = useMemo(() => {
    return trendingMovies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} />
    ));
  }, [trendingMovies]);

  const upcomingMovieCards = useMemo(() => {
    return upcomingMovies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} />
    ));
  }, [upcomingMovies]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="home-container" data-barba-namespace="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Next Favorite Movie</h1>
          <p>Discover movies you'll love with our personalized recommendations</p>
          <form onSubmit={handleSearch} className="hero-search-form">
            <input
              type="text"
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-button">
              Search
            </button>
          </form>
        </div>
      </section>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <section className="trending-section">
            <h2>Trending This Week</h2>
            <div className="movie-grid">
              {trendingMovieCards}
            </div>
          </section>

          <section className="upcoming-section">
            <h2>Upcoming Movies</h2>
            <div className="movie-grid">
              {upcomingMovieCards}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
