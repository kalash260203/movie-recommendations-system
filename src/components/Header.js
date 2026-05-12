import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleWatchlistClick = () => {
    navigate('/watchlist');
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>PopcornPicks</h1>
        </Link>

        <div className="nav-buttons">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search for a movie"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          <button className="nav-button" onClick={handleHomeClick}>
            Home
          </button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="nav-button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{ minWidth: 120 }}
              >
                {user?.name || user?.email || 'User'} ▼
              </button>
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    background: 'var(--card-background, #222a44)',
                    border: '1px solid var(--accent-color, #ff6b81)',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    minWidth: 160,
                    zIndex: 1000,
                    padding: '0.5rem 0',
                  }}
                >
                  <button
                    className="nav-button"
                    style={{ width: '100%', borderRadius: 0, background: 'none', color: 'var(--text-color)', boxShadow: 'none', textAlign: 'left', padding: '0.5rem 1.2rem' }}
                    onClick={handleWatchlistClick}
                  >
                    Watchlist
                  </button>
                  <button
                    className="nav-button logout-button"
                    style={{ width: '100%', borderRadius: 0, background: 'none', color: 'var(--accent-color)', boxShadow: 'none', textAlign: 'left', padding: '0.5rem 1.2rem' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-button">
                Login
              </Link>
              <Link to="/signup" className="nav-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

