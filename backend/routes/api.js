const express = require('express');
const User = require('../models/User');
const StreakData = require('../models/StreakData');
const router = express.Router();

router.get('/user', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

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

// Authenticated GitHub API proxy endpoint
router.get('/github/*', async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated or missing GitHub token'
      });
    }

    // Extract the GitHub API path from the request
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
  const repos = await fetchGitHubData(`users/${username}/repos?sort=updated&per_page=20`, accessToken);
  
  if (!Array.isArray(repos) || repos.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCommitDate: null,
      streakDates: []
    };
  }

  const commitDatesSet = new Set();
  const reposToCheck = repos.slice(0, 10);
  
  for (const repo of reposToCheck) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const since = sixMonthsAgo.toISOString();
      
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
    const currentDate = new Date(dateString + 'T00:00:00');
    
    if (previousDate) {
      const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
      
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

router.get('/streak/:username', async (req, res) => {
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
    
    if (!req.user || !req.user.accessToken) {
      const publicData = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
      if (!publicData.ok) {
        return res.status(404).json({
          success: false,
          message: 'User not found or repositories not accessible'
        });
      }
      
      return res.json({
        success: false,
        message: 'Authentication required for streak calculation',
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

router.post('/streak/:username/refresh', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for streak refresh'
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

module.exports = router;
