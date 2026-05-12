import React from 'react';
import './WeatherComponents.css';

const SunriseSunset = ({ sunrise, sunset, timezone }) => {
  if (!sunrise || !sunset) {
    return null;
  }

  const formatTime = (timestamp, timezoneOffset) => {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDayLength = () => {
    const diff = sunset - sunrise;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getSunPosition = () => {
    const now = Math.floor(Date.now() / 1000) + timezone;
    const dayStart = sunrise;
    const dayEnd = sunset;
    const dayLength = dayEnd - dayStart;

    if (now < dayStart) {
      return { position: 0, isDay: false };
    }
    if (now > dayEnd) {
      return { position: 100, isDay: false };
    }

    const progress = ((now - dayStart) / dayLength) * 100;
    return { position: progress, isDay: true };
  };

  const sunPosition = getSunPosition();

  return (
    <div className="weather-component-card sunrise-sunset-card">
      <div className="component-header">
        <h3>Sunrise & Sunset</h3>
        <span className="day-length">Day: {getDayLength()}</span>
      </div>
      <div className="component-content">
        <div className="sun-timeline">
          <div className="sun-path">
            <div className="sun-path-line"></div>
            <div
              className="sun-icon"
              style={{
                left: `${sunPosition.position}%`,
                transform: `translateX(-50%) translateY(${sunPosition.isDay ? '-50%' : '0%'})`,
              }}
            >
              {sunPosition.isDay ? '☀️' : '🌙'}
            </div>
            <div className="sun-path-gradient"></div>
          </div>
          <div className="sun-times">
            <div className="sun-time-item sunrise">
              <div className="sun-time-icon">🌅</div>
              <div className="sun-time-details">
                <p className="sun-time-label">Sunrise</p>
                <p className="sun-time-value">{formatTime(sunrise, timezone)}</p>
              </div>
            </div>
            <div className="sun-time-item sunset">
              <div className="sun-time-icon">🌇</div>
              <div className="sun-time-details">
                <p className="sun-time-label">Sunset</p>
                <p className="sun-time-value">{formatTime(sunset, timezone)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="sun-info">
          <div className="info-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <span>{sunPosition.isDay ? 'Daytime' : 'Nighttime'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunriseSunset;

