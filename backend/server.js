const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const passport = require('./config/passport');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5003;

// Initialize server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(cors({
      origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'https://committracker.onrender.com'
      ],
      credentials: true
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(session({
      secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
      }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api', apiRoutes);
    app.use('/auth', authRoutes);

    app.get('/', (req, res) => {
      res.json({ 
        message: 'Commit Tracker API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    app.get('/api/health', (req, res) => {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      res.json({ 
        status: 'healthy',
        database: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
