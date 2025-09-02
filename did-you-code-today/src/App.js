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
      const today = new Date().toISOString().split("T")[0];
      
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
      );
      
      if (!reposResponse.ok) {
        throw new Error(`User repos API error: ${reposResponse.status}`);
      }
      
      const repos = await reposResponse.json();
      
      if (!Array.isArray(repos) || repos.length === 0) {
        setStatus("❌ No repositories found for this user.");
        setLoading(false);
        return;
      }

      let totalTodayCommits = 0;
      let reposWithCommitsToday = 0;
      let allCommitsToday = [];
      let mostRecentCommit = null;

      for (const repo of repos.slice(0, 5)) {
        try {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${today}T00:00:00Z&until=${today}T23:59:59Z`
          );
          
          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            
            if (commits.length > 0) {
              totalTodayCommits += commits.length;
              reposWithCommitsToday++;
              
              commits.forEach(commit => {
                allCommitsToday.push({
                  ...commit,
                  repoName: repo.name,
                  repoFullName: repo.full_name
                });
              });
            }
          }
        } catch (repoError) {
          console.warn(`Could not fetch commits for ${repo.full_name}:`, repoError);
        }
      }

      try {
        const recentCommitsResponse = await fetch(
          `https://api.github.com/repos/${repos[0].full_name}/commits?author=${username}&per_page=1`
        );
        
        if (recentCommitsResponse.ok) {
          const recentCommits = await recentCommitsResponse.json();
          if (recentCommits.length > 0) {
            const commit = recentCommits[0];
            mostRecentCommit = {
              time: new Date(commit.commit.author.date).toLocaleDateString() + ' at ' + 
                    new Date(commit.commit.author.date).toLocaleTimeString(),
              repo: repos[0].name,
              message: commit.commit.message.split('\n')[0],
              sha: commit.sha.substring(0, 7),
              isToday: commit.commit.author.date.startsWith(today)
            };
          }
        }
      } catch (recentError) {
        console.warn('Could not fetch recent commits:', recentError);
      }

      let eventsData = { totalEvents: 0, pushEvents: 0 };
      try {
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events/public`
        );
        
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          if (Array.isArray(events)) {
            eventsData.totalEvents = events.length;
            eventsData.pushEvents = events.filter(e => e.type === 'PushEvent').length;
          }
        }
      } catch (eventsError) {
        console.warn('Events API error:', eventsError);
      }

      setCommitStats({
        todayCount: totalTodayCommits,
        todayRepos: reposWithCommitsToday,
        totalRecentEvents: eventsData.pushEvents,
        totalRepos: Math.min(repos.length, 5),
        lastCommit: mostRecentCommit,
        apiInfo: {
          totalEvents: eventsData.totalEvents,
          pushEvents: eventsData.pushEvents,
          reposChecked: Math.min(repos.length, 5)
        }
      });

      if (totalTodayCommits > 0) {
        const repoText = reposWithCommitsToday === 1 ? 'repository' : 'repositories';
        setStatus(`✅ You coded today! ${totalTodayCommits} commit${totalTodayCommits > 1 ? 's' : ''} across ${reposWithCommitsToday} ${repoText} 🚀`);
      } else if (mostRecentCommit) {
        const timeSinceLastCommit = mostRecentCommit.isToday ? 'today' : 'recently';
        setStatus(`❌ No commits today, but you committed ${timeSinceLastCommit}. Keep coding! 💻`);
      } else {
        setStatus("❌ No recent commit activity found. Time to start coding! 💻");
      }
      
    } catch (error) {
      console.error('API Error:', error);
      setStatus(`❌ Error fetching data: ${error.message}`);
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
                <div className="stat-number">{commitStats.todayRepos}</div>
                <div className="stat-label">Repositories Today</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">{commitStats.apiInfo.reposChecked}</div>
                <div className="stat-label">Repos Checked</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">{commitStats.totalRecentEvents}</div>
                <div className="stat-label">Recent Push Events</div>
              </div>
            </div>
            
            {commitStats.lastCommit && (
              <div className="last-commit-info">
                <h4 className="last-commit-title">
                  🕒 Last Commit {commitStats.lastCommit.isToday ? '(Today)' : ''}
                </h4>
                <p className="last-commit-details">
                  <strong>{commitStats.lastCommit.repo}</strong> #{commitStats.lastCommit.sha}<br/>
                  "{commitStats.lastCommit.message}"<br/>
                  <span className="commit-time">{commitStats.lastCommit.time}</span>
                </p>
              </div>
            )}
            
            <div className="api-info">
              <small className="api-disclaimer">
                ✨ <strong>Real-time data</strong>: Using direct repository API calls for accurate, up-to-date commit information.
                Checking your {commitStats.apiInfo.reposChecked} most recently updated repositories.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
