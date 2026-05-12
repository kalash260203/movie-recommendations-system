import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  overview: String,
  poster_path: String,
  backdrop_path: String,
  release_date: Date,
  vote_average: Number,
  vote_count: Number,
  runtime: Number,
  genres: [{
    id: Number,
    name: String
  }],
  credits: {
    cast: [{
      id: Number,
      name: String,
      character: String,
      profile_path: String
    }],
    crew: [{
      id: Number,
      name: String,
      job: String,
      department: String
    }]
  },
  videos: {
    results: [{
      id: String,
      key: String,
      name: String,
      site: String,
      type: String
    }]
  },
  similar: {
    results: [{
      id: Number,
      title: String,
      poster_path: String,
      vote_average: Number
    }]
  },
  recommendations: {
    results: [{
      id: Number,
      title: String,
      poster_path: String,
      vote_average: Number
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Set cache time to 24 hours for movies
movieSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });

// Add static methods for batch operations
movieSchema.statics.bulkUpsertMovies = async function(movies) {
  const operations = movies.map(movie => ({
    updateOne: {
      filter: { tmdbId: movie.id },
      update: { ...movie, lastUpdated: new Date() },
      upsert: true
    }
  }));
  return this.bulkWrite(operations);
};

// Add static method for cleanup
movieSchema.statics.cleanupOldCache = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.deleteMany({
    lastUpdated: { $lt: thirtyDaysAgo },
    'vote_count': { $lt: 100 } // Only remove less popular movies
  });
};

export default mongoose.model('Movie', movieSchema);
