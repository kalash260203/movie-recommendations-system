import React, { useRef, useEffect, useState } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, posterUrl, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };
    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      console.error('Video error:', e);
      setError('Failed to load video. Please try again later.');
      setIsLoading(false);
    };
    
    // Add event listeners
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    
    // Auto-play when component mounts
    videoElement.play().catch(err => {
      console.warn('Auto-play failed:', err);
      // Most browsers require user interaction before auto-play
    });
    
    // Clean up event listeners
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
    };
  }, []);

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play failed:', err);
        });
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Set volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        videoRef.current.muted = true;
      } else if (isMuted) {
        videoRef.current.muted = false;
      }
    }
  };

  // Seek in video
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-player-container');
    
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="video-player-container">
      {title && <h3 className="video-title">{title}</h3>}
      
      <div className="video-wrapper">
        {isLoading && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
            <p>Loading video...</p>
          </div>
        )}
        
        {error && (
          <div className="video-error">
            <p>{error}</p>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="video-element"
          poster={posterUrl}
          onClick={togglePlay}
          controls={false}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="video-controls">
          <button className="control-button play-pause" onClick={togglePlay}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
          
          <div className="progress-container">
            <input
              type="range"
              className="progress-slider"
              value={progress}
              onChange={handleSeek}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          
          <div className="volume-container">
            <button className="control-button volume" onClick={toggleMute}>
              {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
            </button>
            <input
              type="range"
              className="volume-slider"
              value={volume}
              onChange={handleVolumeChange}
              min="0"
              max="1"
              step="0.1"
            />
          </div>
          
          <button className="control-button fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
