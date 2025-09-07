const mongoose = require('mongoose');

const streakDataSchema = new mongoose.Schema({
  githubUsername: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCommitDate: {
    type: Date,
    default: null
  },
  streakDates: [{
    type: String
  }],
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StreakData', streakDataSchema);
