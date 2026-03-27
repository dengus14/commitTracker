import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import PublicProfile from './components/PublicProfile';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import reportWebVitals from './reportWebVitals';

// Detect /u/:username route before any React renders
const publicUsernameMatch = window.location.pathname.match(/^\/u\/([^/?#]+)/);
const publicUsername = publicUsernameMatch ? publicUsernameMatch[1] : null;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      {publicUsername ? (
        <PublicProfile username={publicUsername} />
      ) : (
        <AuthProvider>
          <App />
        </AuthProvider>
      )}
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
