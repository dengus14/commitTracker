const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login?error=auth_failed' }),
  (req, res) => {
    // make jwt token
    const token = jwt.sign(
      { 
        userId: req.user._id,
        githubId: req.user.githubId,
        username: req.user.username 
      }, 
      process.env.SESSION_SECRET, 
      { expiresIn: '24h' }
    );
    
    // send user back to frontend with the token
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}`;
    res.redirect(redirectUrl);
  }
);

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

router.get('/user', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      githubId: req.user.githubId,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      lastLogin: req.user.lastLogin
    }
  });
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user.username : null
  });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
