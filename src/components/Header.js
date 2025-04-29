import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleGithubClick = () => {
    window.open('https://github.com/kalash260203/movie-recommendations-system', '_blank');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>Find My Film</h1>
        </Link>
        <div className="nav-buttons">
          <button className="nav-button" onClick={handleHomeClick}>
            Home
          </button>
          <button className="nav-button" onClick={handleGithubClick}>
            Github
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

