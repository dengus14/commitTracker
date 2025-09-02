import React from 'react';

const CommitStats = ({ commitStats, loading }) => {
  if (!commitStats || loading) return null;

  return (
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
  );
};

export default CommitStats;
