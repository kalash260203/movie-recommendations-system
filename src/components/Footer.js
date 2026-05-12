import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Find My Film. All rights reserved.</p>
        <p>
          Powered by{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
            The Movie Database
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
