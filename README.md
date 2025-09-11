# Commit Tracker Application

This is my commit tracker web application that I built as my personal project. The application connects to your GitHub account and tracks whether you've been coding consistently. It functions like a fitness tracker but for programming activities.

## What It Does

The main concept is straightforward - it checks if you made any commits today and displays your coding streak. However, it actually provides much more functionality than that:

- **Daily commit checking**: Tells you if you coded today or if you need to get back to work
- **Streak tracking**: Keeps track of your longest coding streak and current streak
- **GitHub integration**: Pulls data directly from your GitHub repositories using OAuth
- **Commit calendar**: Shows a visual calendar of all your commit activity
- **Language stats**: Breaks down what programming languages you've been using
- **Weekly summaries**: Provides statistics on your coding activity for the week
- **Achievement system**: Unlocks badges for hitting milestones (work in progress)

## Tech Stack

This was a great learning experience because I got to work with many different technologies:

### Frontend (React App)
- **React 18**: Main framework for the user interface
- **React Hooks**: useState, useEffect, useCallback, etc. for state management
- **Context API**: For managing authentication state and theme switching
- **CSS3**: Custom styling with Flexbox and Grid layouts
- **localStorage**: For persisting user data between sessions

### Backend (Node.js API)
- **Express.js**: Web server framework
- **Passport.js**: For GitHub OAuth authentication
- **JsonWebToken**: JWT tokens for secure cross-domain authentication
- **CORS**: Handling cross-origin requests between frontend and backend
- **dotenv**: Managing environment variables
- **node-fetch**: Making API calls to GitHub

### Database & Storage
- **MongoDB Atlas**: Cloud database for storing user data
- **Mongoose**: MongoDB object modeling
- **connect-mongo**: Session storage in MongoDB

### Authentication
- **GitHub OAuth**: Users log in with their GitHub account
- **JWT tokens**: Replaced session-based auth for better cross-domain support
- **passport-github2**: GitHub OAuth strategy

### Deployment
- **Render**: Hosting the React frontend
- **Vercel**: Hosting the Node.js backend API
- **MongoDB Atlas**: Cloud database hosting

## Architecture

The application follows a standard full-stack architecture:

```
Frontend (React) <-> Backend API (Express) <-> Database (MongoDB) <-> GitHub API
```

### Authentication Flow
1. User clicks "Login with GitHub"
2. Gets redirected to GitHub OAuth
3. GitHub sends them back with an authorization code
4. Backend exchanges code for access token
5. Creates JWT token and sends it back to frontend
6. Frontend stores JWT and uses it for all API calls

### Data Flow
1. Frontend makes authenticated requests to our backend API
2. Backend validates JWT token
3. Backend makes requests to GitHub API using stored access token
4. Processes the data and sends it back to frontend
5. Frontend updates the UI with the new data

## Key Features Breakdown

### Streak Calculation
The most challenging part was calculating coding streaks. I had to:
- Fetch commits from multiple repositories
- Convert all timestamps to local dates
- Sort them chronologically
- Find consecutive day sequences
- Handle edge cases like weekends and timezones

### GitHub API Integration
I learned a lot about working with external APIs:
- Rate limiting (GitHub limits you to 5000 requests per hour)
- Pagination for large datasets
- Error handling for network issues
- Caching to reduce API calls

### Responsive Design
I made sure the app works on desktop, tablet, and mobile using:
- CSS media queries
- Flexible layouts with Flexbox/Grid
- Responsive typography and spacing

## Challenges I Faced

### Cross-Domain Authentication
Initially I used Express sessions but they don't work well when frontend and backend are on different domains. I had to switch to JWT tokens which was actually better for security anyway.

### GitHub API Rate Limits
I had to implement smart fetching strategies:
- Only fetch recent commits (last 6 months)
- Limit to 10 repositories maximum
- Cache results in local storage
- Graceful degradation when rate limited

### Async Data Handling
Dealing with multiple async API calls was tricky. I used Promise.all() in some places and sequential fetching in others depending on the use case.

### Deployment Configuration
Getting CORS, environment variables, and OAuth callbacks configured correctly across different hosting platforms took some trial and error.

## File Structure

```
commitTracker/
├── backend/                 # Express.js API server
│   ├── server.js           # Main server file
│   ├── config/
│   │   ├── database.js     # MongoDB connection
│   │   └── passport.js     # GitHub OAuth setup
│   ├── models/
│   │   ├── User.js         # User data schema
│   │   └── StreakData.js   # Streak data schema
│   └── routes/
│       ├── auth.js         # Authentication endpoints
│       └── api.js          # Protected API endpoints
├── did-you-code-today/     # React frontend
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # React components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       └── data/           # Static data files
└── README.md              # This file!
```

## What I Learned

Building this project taught me a tremendous amount about:
- **Full-stack development**: Connecting frontend, backend, and database
- **OAuth authentication**: How third-party login systems work
- **API design**: Creating RESTful endpoints and handling errors
- **State management**: Using React Context and custom hooks
- **Deployment**: Getting applications live on real hosting platforms
- **Version control**: Using Git and GitHub for project management

## Future Improvements

Features I want to add later:
- [ ] Achievement system with more badges
- [ ] Social features (compare streaks with friends)
- [ ] Commit quality analysis (lines of code, file changes)
- [ ] Integration with other Git platforms (GitLab, Bitbucket)
- [ ] Mobile app version
- [ ] Email notifications for broken streaks
- [ ] More detailed analytics and charts

## Running Locally

If you want to run this yourself:

1. Clone the repository
2. Set up MongoDB Atlas database
3. Create GitHub OAuth app
4. Add environment variables
5. Run `npm install` in both backend and frontend folders
6. Run `npm start` for both servers

Environment variables needed:
- `MONGODB_CONNECTION_STRING`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET` 
- `JWT_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`

## Final Thoughts

This was a really enjoyable project to build! It combines many different technologies and gave me hands-on experience with full-stack development. The most difficult part was probably getting the authentication working across different domains, but I learned a lot about JWT tokens and modern web security in the process.

Plus now I actually use it daily to track my coding habits - it's quite motivating to see those green squares and try to keep the streak alive! 💪

---

*Built with ❤️ (and lots of coffee) by a Computer Science student*
