import React, { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, width = '100%', height = '100%' }) => {
  const playerRef = useRef(null);
  const containerId = `yt-player-${videoId}`;

  useEffect(() => {
    // Load the YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    // This function will be called by the YouTube API when it's ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        width,
        height,
        events: {
          onReady: (event) => {
            // Set playback quality to HD (if available)
            event.target.setPlaybackQuality('hd1080');
          }
        },
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        }
      });
    };

    // If the API is already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    // Clean up
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
    // eslint-disable-next-line
  }, [videoId]);

  return (
    <div id={containerId} style={{ width, height }}></div>
  );
};

export default YouTubePlayer; 