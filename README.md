# Find My Film - Movie Recommendations System

A modern, responsive web application built with React that helps users discover movies through personalized recommendations, trending lists, and search functionality. The application uses The Movie Database (TMDB) API to provide up-to-date movie information and recommendations.

## Features

- **Movie Search**: Search for any movie in TMDB's extensive database
- **Trending Movies**: Display currently trending movies
- **Popular Movies**: Show popular movies based on user ratings
- **Movie Details**: Comprehensive movie information including:
  - Release date
  - Runtime
  - Rating
  - Cast information
  - Overview
  - Similar movie recommendations
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Technologies Used

- React 19.1.0
- React Router DOM 6.30.0
- Axios for API calls
- CSS for styling
- TMDB API for movie data

## Getting Started

### Prerequisites

- Node.js (latest stable version)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kalash260203/movie-recommendations-system.git
```

2. Navigate to the project directory:
```bash
cd movie-recommendations-system
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the root directory and add your TMDB API key:
```
REACT_APP_TMDB_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Project Structure

```
src/
├── components/        # Reusable components
├── pages/            # Page components
├── services/         # API services
├── App.js            # Main application component
└── index.js         # Application entry point
```
![image](https://github.com/user-attachments/assets/07ad449b-f26f-471e-87e3-1e32bb88b493)
![image](https://github.com/user-attachments/assets/e6db30c8-3095-47ec-8f30-1bdcffbd0289)


## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie data API
- [Create React App](https://github.com/facebook/create-react-app) for the project bootstrap
