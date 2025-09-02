import React, { useState } from "react";
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [commitStats, setCommitStats] = useState(null);

  const getStatusClass = () => {
    if (loading) return "loading";
    if (status.includes("✅")) return "status-success";
    if (status.includes("❌")) return "status-error";
    if (status.includes("⚠️")) return "status-warning";
    return "";
  };

  const checkCommits = async () => {
    if (!username) {
      setStatus("⚠️ Please enter a GitHub username.");
      return;
    }

    setLoading(true);
    setStatus("");
    setCommitStats(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/events/public`
      );
      const events = await response.json();

      if (!Array.isArray(events)) {
        setStatus("❌ Could not fetch events. Try again later.");
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const pushEvents = events.filter(event => event.type === "PushEvent");
      
      // Get today's commits
      const todayCommits = pushEvents.filter(event => 
        event.created_at.startsWith(today)
      );
      
      // Get total commits count for today
      const todayCommitCount = todayCommits.reduce((total, event) => 
        total + (event.payload.commits ? event.payload.commits.length : 0), 0
      );
      
      // Get most recent commit
      const mostRecentPush = pushEvents[0];
      let lastCommitInfo = null;
      
      if (mostRecentPush) {
        const lastCommitTime = new Date(mostRecentPush.created_at);
        const repoName = mostRecentPush.repo.name.split('/')[1];
        lastCommitInfo = {
          time: lastCommitTime.toLocaleDateString() + ' at ' + lastCommitTime.toLocaleTimeString(),
          repo: repoName,
          commitCount: mostRecentPush.payload.commits ? mostRecentPush.payload.commits.length : 1
        };
      }

      // Set commit statistics
      setCommitStats({
        todayCount: todayCommitCount,
        totalRecentEvents: pushEvents.length,
        lastCommit: lastCommitInfo
      });

      if (todayCommitCount > 0) {
        setStatus(`✅ You coded today! ${todayCommitCount} commit${todayCommitCount > 1 ? 's' : ''} made 🚀`);
      } else {
        setStatus("❌ No commits yet today. Time to code! 💻");
      }
    } catch (error) {
      setStatus("❌ Error fetching data.");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkCommits();
    }
  };

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="title">Did You Code Today?</h1>
        <p className="subtitle">
          Track your daily coding activity on GitHub
        </p>
        
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="username-input"
            disabled={loading}
          />
        </div>
        
        <button 
          onClick={checkCommits} 
          className="check-button"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check My Activity"}
        </button>
        
        {(status || loading) && (
          <div className={`status-container ${getStatusClass()}`}>
            {loading ? "🔍 Checking your GitHub activity..." : status}
          </div>
        )}
        
        {commitStats && !loading && (
          <div className="stats-container">
            <h3 className="stats-title">📊 Activity Summary</h3>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{commitStats.todayCount}</div>
                <div className="stat-label">Commits Today</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">{commitStats.totalRecentEvents}</div>
                <div className="stat-label">Recent Push Events</div>
              </div>
            </div>
            
            {commitStats.lastCommit && (
              <div className="last-commit-info">
                <h4 className="last-commit-title">🕒 Last Activity</h4>
                <p className="last-commit-details">
                  <strong>{commitStats.lastCommit.repo}</strong><br/>
                  {commitStats.lastCommit.commitCount} commit{commitStats.lastCommit.commitCount > 1 ? 's' : ''}<br/>
                  <span className="commit-time">{commitStats.lastCommit.time}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
