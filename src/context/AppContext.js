import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
export const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Watchlist state
  const [watchlist, setWatchlist] = useState([]);

  // Modal state for trailers
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(null);

  // Load user and watchlist from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedWatchlist = localStorage.getItem('watchlist');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  // Login function
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Register function
  const register = (userData) => {
    // In a real app, you would send this to a backend
    // For now, we'll just store it in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Add movie to watchlist
  const addToWatchlist = (movie) => {
    // Check if movie is already in watchlist
    if (!watchlist.some(item => item.id === movie.id)) {
      const newWatchlist = [...watchlist, movie];
      setWatchlist(newWatchlist);
      return true;
    }
    return false;
  };

  // Remove movie from watchlist
  const removeFromWatchlist = (movieId) => {
    const newWatchlist = watchlist.filter(movie => movie.id !== movieId);
    setWatchlist(newWatchlist);
    if (newWatchlist.length === 0) {
      localStorage.removeItem('watchlist');
    }
  };

  // Check if a movie is in the watchlist
  const isInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  // Open trailer modal
  const openTrailerModal = (trailer, movie) => {
    setCurrentTrailer(trailer);
    setCurrentMovie(movie);
    setTrailerModalOpen(true);
  };

  // Close trailer modal
  const closeTrailerModal = () => {
    setTrailerModalOpen(false);
    setCurrentTrailer(null);
    setCurrentMovie(null);
  };

  // Search on Google
  const searchOnGoogle = (query, isActor = false) => {
    const searchQuery = encodeURIComponent(isActor ? query : `${query} movie`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  // Context value
  const contextValue = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    trailerModalOpen,
    currentTrailer,
    currentMovie,
    openTrailerModal,
    closeTrailerModal,
    searchOnGoogle
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
