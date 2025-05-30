import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { searchMovieTrailer, getVideoDetails } from '../services/youtubeApi';
import { YOUTUBE_EMBED_URL } from '../config/youtube';
import './TrailerModal.css';

// For debugging
console.log('TrailerModal imported, useAppContext:', useAppContext);

const TrailerModal = () => {
  // Get context with fallback values in case context is not available
  const context = useAppContext() || {};
  const {
    trailerModalOpen = false,
    currentTrailer = null,
    closeTrailerModal = () => console.log('closeTrailerModal not available'),
    currentMovie = null
  } = context;

  const [youtubeTrailer, setYoutubeTrailer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch YouTube trailer when modal opens
  useEffect(() => {
    const fetchYoutubeTrailer = async () => {
      if (!currentMovie) return;

      try {
        setLoading(true);
        setError(null);

        // Try to use TMDB trailer if available
        if (currentTrailer && currentTrailer.site === 'YouTube' && currentTrailer.key) {
          // Get additional details about the video to check quality
          try {
            const videoDetails = await getVideoDetails(currentTrailer.key);
            if (videoDetails) {
              setYoutubeTrailer({
                id: currentTrailer.key,
                title: currentTrailer.name || `${currentMovie.title} Trailer`,
                hasHD: videoDetails.hasHD,
                definition: videoDetails.contentDetails?.definition || 'sd'
              });
              setLoading(false);
              return;
            }
          } catch (detailsError) {
            console.warn('Could not get video details, using basic info:', detailsError);
          }

          // Fallback if details fetch fails
          setYoutubeTrailer({
            id: currentTrailer.key,
            title: currentTrailer.name || `${currentMovie.title} Trailer`,
          });
          setLoading(false);
          return;
        }

        // Otherwise search YouTube
        const releaseYear = currentMovie.release_date
          ? new Date(currentMovie.release_date).getFullYear()
          : '';

        const trailer = await searchMovieTrailer(currentMovie.title, releaseYear);

        if (trailer) {
          // Get additional details about the video
          try {
            const videoDetails = await getVideoDetails(trailer.id);
            if (videoDetails) {
              setYoutubeTrailer({
                ...trailer,
                hasHD: videoDetails.hasHD,
                definition: videoDetails.contentDetails?.definition || 'sd'
              });
              setLoading(false);
              return;
            }
          } catch (detailsError) {
            console.warn('Could not get video details, using basic info:', detailsError);
          }

          // Fallback if details fetch fails
          setYoutubeTrailer(trailer);
        } else {
          setError('No trailer found for this movie.');
        }
      } catch (err) {
        console.error('Error fetching YouTube trailer:', err);
        setError('Failed to load trailer. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (trailerModalOpen && currentMovie) {
      fetchYoutubeTrailer();
    } else {
      // Reset state when modal closes
      setYoutubeTrailer(null);
      setError(null);
    }
  }, [trailerModalOpen, currentTrailer, currentMovie]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closeTrailerModal();
      }
    };

    if (trailerModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [trailerModalOpen, closeTrailerModal]);

  console.log('TrailerModal state:', { trailerModalOpen, currentTrailer, youtubeTrailer, context });

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (trailerModalOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [trailerModalOpen]);

  // If context is not available or modal is not open, don't render anything
  if (!context || !trailerModalOpen) {
    console.log('TrailerModal not rendering: context available:', !!context, 'modal open:', trailerModalOpen);
    return null;
  }

  return (
    <div className="trailer-modal-overlay" onClick={closeTrailerModal}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="trailer-loading">
            <div className="loading-spinner"></div>
            <p>Loading trailer...</p>
          </div>
        ) : error ? (
          <div className="trailer-error">
            <p>{error}</p>
            <button
              className="google-search-button"
              onClick={() => {
                if (currentMovie) {
                  const query = encodeURIComponent(`${currentMovie.title} trailer`);
                  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
                }
                closeTrailerModal();
              }}
            >
              Search on YouTube
            </button>
          </div>
        ) : youtubeTrailer ? (
          <>
            <div className="trailer-container">
              <iframe
                title={youtubeTrailer.title}
                src={`${YOUTUBE_EMBED_URL}${youtubeTrailer.id}?autoplay=1&mute=0&controls=1&showinfo=1&rel=0&modestbranding=1&origin=${window.location.origin}&vq=hd1080&hd=1&iv_load_policy=3&fs=1&hl=en&cc_load_policy=0&cc_lang_pref=en&enablejsapi=1&widgetid=1&playsinline=0&disablekb=0&autohide=0&color=red&theme=dark&quality=hd1080`}
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                width="100%"
                height="100%"
              ></iframe>
            </div>
            {currentMovie && (
              <div className="modal-movie-details">
                <div className="modal-movie-info">
                  <h3>{currentMovie.title}</h3>
                  {currentMovie.release_date && (
                    <p className="release-year">
                      {new Date(currentMovie.release_date).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="trailer-error">
            <p>No trailer available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;