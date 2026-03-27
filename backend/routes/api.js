const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StreakData = require('../models/StreakData');
const LanguageCache = require('../models/LanguageCache');
const router = express.Router();

// check if jwt token is valid
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/user', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.githubId,
        username: req.user.username,
        displayName: req.user.displayName,
        avatarUrl: req.user.avatarUrl,
        profileUrl: req.user.profileUrl,
        hasToken: !!req.user.accessToken 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// proxy for github api calls
router.get('/github/*', verifyToken, async (req, res) => {
  try {
    if (!req.user.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Missing GitHub token'
      });
    }

    // get the github api path from url
    const githubPath = req.params[0];
    const queryString = req.url.split('?')[1] || '';
    const githubUrl = `https://api.github.com/${githubPath}${queryString ? '?' + queryString : ''}`;

    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `token ${req.user.accessToken}`,
        'User-Agent': 'CommitTracker-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'GitHub API error',
        error: data
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error proxying GitHub API request',
      error: error.message
    });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

const fetchGitHubData = async (path, accessToken) => {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'User-Agent': 'CommitTracker-App',
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  return response.json();
};

const calculateStreakFromGitHub = async (username, accessToken) => {
  // /user/repos includes private repos; /users/:username/repos only returns public ones
  const repos = await fetchGitHubData(`user/repos?sort=updated&per_page=100&affiliation=owner`, accessToken);

  if (!Array.isArray(repos) || repos.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCommitDate: null,
      streakDates: []
    };
  }

  const commitDatesSet = new Set();
  // Check up to 30 most-recently-updated repos (was 10, missing commits in older repos)
  const reposToCheck = repos.slice(0, 30);

  // Look back 18 months so streaks near the old 6-month boundary are not cut off
  const lookbackDate = new Date();
  lookbackDate.setMonth(lookbackDate.getMonth() - 18);
  const since = lookbackDate.toISOString();

  for (const repo of reposToCheck) {
    try {
      const commits = await fetchGitHubData(
        `repos/${repo.full_name}/commits?author=${username}&since=${since}&per_page=100`,
        accessToken
      );

      commits.forEach(commit => {
        const commitDate = new Date(commit.commit.author.date);
        const localDateString = commitDate.getFullYear() + '-' +
          String(commitDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(commitDate.getDate()).padStart(2, '0');

        commitDatesSet.add(localDateString);
      });
    } catch (repoError) {
      continue;
    }
  }

  if (commitDatesSet.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCommitDate: null,
      streakDates: []
    };
  }

  const sortedDates = Array.from(commitDatesSet).sort().reverse();
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');

  let currentStreak = 0;
  let currentStreakDates = [];
  let currentDate = new Date(today);
  
  while (true) {
    const dateString = currentDate.getFullYear() + '-' + 
      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentDate.getDate()).padStart(2, '0');
    
    if (commitDatesSet.has(dateString)) {
      currentStreak++;
      currentStreakDates.unshift(dateString);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
    
    if (currentStreak >= 365) {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  let previousDate = null;
  const chronologicalDates = Array.from(commitDatesSet).sort();
  
  for (const dateString of chronologicalDates) {
    // Parse as noon local time to avoid DST hour-shift causing diff to be 0 or 2
    const currentDate = new Date(dateString + 'T12:00:00');

    if (previousDate) {
      const daysDiff = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    previousDate = currentDate;
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);

  const lastCommitDate = commitDatesSet.size > 0 ? 
    new Date(Math.max(...Array.from(commitDatesSet.keys()).map(d => new Date(d).getTime()))) : 
    null;

  return {
    currentStreak,
    longestStreak,
    lastCommitDate,
    streakDates: currentStreakDates
  };
};

router.get('/streak/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    const cached = await StreakData.findOne({ githubUsername: username });
    
    if (cached && cached.isValid && (Date.now() - cached.lastCalculated.getTime()) < CACHE_DURATION) {
      return res.json({
        success: true,
        data: {
          currentStreak: cached.currentStreak,
          longestStreak: cached.longestStreak,
          lastCommitDate: cached.lastCommitDate,
          streakDates: cached.streakDates,
          cached: true
        }
      });
    }
    
    if (!req.user.accessToken) {
      return res.json({
        success: false,
        message: 'GitHub token required for streak calculation',
        requiresAuth: true
      });
    }

    const streakData = await calculateStreakFromGitHub(username, req.user.accessToken);
    
    await StreakData.findOneAndUpdate(
      { githubUsername: username },
      {
        githubUsername: username,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastCommitDate: streakData.lastCommitDate,
        streakDates: streakData.streakDates,
        lastCalculated: new Date(),
        isValid: true
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastCommitDate: streakData.lastCommitDate,
        streakDates: streakData.streakDates,
        cached: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating streak',
      error: error.message
    });
  }
});

router.post('/streak/:username/refresh', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!req.user.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'GitHub token required for streak refresh'
      });
    }

    const streakData = await calculateStreakFromGitHub(username, req.user.accessToken);
    
    await StreakData.findOneAndUpdate(
      { githubUsername: username },
      {
        githubUsername: username,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastCommitDate: streakData.lastCommitDate,
        streakDates: streakData.streakDates,
        lastCalculated: new Date(),
        isValid: true
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastCommitDate: streakData.lastCommitDate,
        streakDates: streakData.streakDates,
        cached: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing streak',
      error: error.message
    });
  }
});

router.get('/languages/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const CACHE_DURATION = 24 * 60 * 60 * 1000;

    const cached = await LanguageCache.findOne({ githubUsername: username });
    if (cached && (Date.now() - cached.lastCalculated.getTime()) < CACHE_DURATION) {
      return res.json({
        success: true,
        data: {
          languages: cached.languages,
          totalBytes: cached.totalBytes,
          reposChecked: cached.reposChecked,
          cached: true
        }
      });
    }

    if (!req.user.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub token required' });
    }

    const repos = await fetchGitHubData(
      `users/${username}/repos?per_page=100&sort=updated`,
      req.user.accessToken
    );

    if (!Array.isArray(repos) || repos.length === 0) {
      return res.json({ success: true, data: { languages: [], totalBytes: 0, reposChecked: 0 } });
    }

    const languageTotals = {};
    let totalBytes = 0;

    const results = await Promise.allSettled(
      repos.map(repo =>
        fetchGitHubData(`repos/${repo.full_name}/languages`, req.user.accessToken)
      )
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        Object.entries(result.value).forEach(([lang, bytes]) => {
          languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
          totalBytes += bytes;
        });
      }
    });

    const languages = Object.entries(languageTotals)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(1)
      }))
      .sort((a, b) => b.bytes - a.bytes);

    await LanguageCache.findOneAndUpdate(
      { githubUsername: username },
      { githubUsername: username, languages, totalBytes, reposChecked: repos.length, lastCalculated: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: { languages, totalBytes, reposChecked: repos.length, cached: false }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching language stats', error: error.message });
  }
});

module.exports = router;
