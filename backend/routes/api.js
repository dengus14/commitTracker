const express = require('express');
const User = require('../models/User');
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

module.exports = router;
