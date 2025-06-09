import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import './styles/transitions.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Watchlist from './pages/Watchlist';
import TrailerModal from './components/TrailerModal';
import { AppProvider } from './context/AppContext';
import AppContextTest from './context/AppContextTest';
import { initBarba, updateBarbaNamespace } from './utils/barba-transitions';
import { initFallbackTransitions } from './utils/fallback-transitions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// For debugging
console.log('App.js loaded, AppProvider:', AppProvider);

// Create a wrapper component to use hooks with Router
function AppContent() {
  const location = useLocation();
  const [transitionFailed, setTransitionFailed] = useState(false);

  useEffect(() => {
    // Initialize Barba.js only once after the first render
    const timer = setTimeout(() => {
      try {
        initBarba();
      } catch (error) {
        console.error('Failed to initialize Barba.js:', error);
        setTransitionFailed(true);
      }
    }, 500); // Delay to ensure DOM is fully loaded

    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // Update the namespace when the location changes
    try {
      updateBarbaNamespace(location.pathname);
    } catch (error) {
      console.error('Error updating namespace:', error);
    }
  }, [location.pathname]);

  // Initialize fallback transitions if Barba.js fails
  useEffect(() => {
    if (transitionFailed) {
      console.log('Using fallback transitions');
      const cleanup = initFallbackTransitions();
      return cleanup;
    }
  }, [transitionFailed]);

  // Log the current path for debugging
  console.log('Current path:', location.pathname);

  return (
    <div className="App">
      <Header />
      <main className="main-content" data-barba="container" data-barba-namespace={location.pathname === '/' ? 'home' : location.pathname.includes('/movie/') ? 'movie-details' : 'search-results'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </main>
      <Footer />
      {/* Global modal for trailers */}
      <TrailerModal />
      {/* Context test component - remove in production */}
      <div style={{ display: 'none' }}>
        <AppContextTest />
      </div>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {/* Transition elements - initially hidden by CSS */}
      <div className="transition-overlay"></div>
      <div className="transition-loader"></div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
