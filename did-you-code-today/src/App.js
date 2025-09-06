import React from "react";
import "./index.css";
import { useAuth } from "./context/AuthContext";
import GitHubAuth from "./components/GitHubAuth";
import CommitChecker from "./components/CommitChecker";
import StatusMessage from "./components/StatusMessage";
import CommitStats from "./components/CommitStats";
import Divider from "./components/Divider";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import ThemeToggle from "./components/ThemeToggle";
import MiniCalendar from "./components/MiniCalendar";
import LanguageStats from "./components/LanguageStats";
import StreakDisplay from "./components/StreakDisplay";
import { useCommitData } from "./hooks/useCommitData";

function App() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { loading, status, commitStats, checkCommits } = useCommitData();

  if (authLoading) {
    return (
      <div className="app-container">
        <div className="main-card">
          <div className="auth-loading">
            <h2>🔍 Checking authentication...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="title">Commit Tracker</h1>
        <div className="header-actions">
          <ThemeToggle />
          {isAuthenticated && user && (
            <button 
              onClick={logout}
              className="header-logout-button"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      
      <div className="content-with-sidebar">
        <div className="main-content">
          <div className="main-card">
            <p className="subtitle">
              Track your daily coding activity on GitHub
            </p>
            
            {isAuthenticated && user ? (
              // Authenticated user dashboard with side drawer
              <Dashboard />
            ) : (
              // Non-authenticated user flow
              <>
                <GitHubAuth />
                
                <Divider text="or check manually" />
                
                <CommitChecker onCheck={checkCommits} loading={loading} />
                
                <StatusMessage status={status} loading={loading} />
                
                <CommitStats commitStats={commitStats} loading={loading} />
              </>
            )}
          </div>
        </div>
        
        <div className="sidebar">
          <MiniCalendar />
          <LanguageStats />
          <StreakDisplay />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
