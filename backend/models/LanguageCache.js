const mongoose = require('mongoose');

const languageCacheSchema = new mongoose.Schema({
  githubUsername: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  languages: [{
    name: String,
    bytes: Number,
    percentage: String
  }],
  totalBytes: Number,
  reposChecked: Number,
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('LanguageCache', languageCacheSchema);
