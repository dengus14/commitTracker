const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL || "/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      
      if (user) {
        user.accessToken = accessToken;
        await user.updateLastLogin();
        await user.save();
        return done(null, user);
      }
      
      // create new user
      user = new User({
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        profileUrl: profile.profileUrl,
        accessToken: accessToken
      });
      
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.log('github oauth not configured');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
