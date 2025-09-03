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
import { useCommitData } from "./hooks/useCommitData";

function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { loading, status, commitStats, checkCommits } = useCommitData();

  // Show loading screen while checking authentication
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
      <div className="main-card">
        <h1 className="title">Commit Tracker</h1>
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
      <Footer />
    </div>
  );
}

export default App;
