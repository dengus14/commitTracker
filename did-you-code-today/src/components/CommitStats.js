const CommitStats = ({ commitStats, loading, currentStreak }) => {
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
          <div className="stat-label">Active Repos Today</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{commitStats.thisWeekCount ?? '—'}</div>
          <div className="stat-label">This Week</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{currentStreak ?? '—'}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>

      {commitStats.lastCommit && (
        <div className="last-commit-info">
          <h4 className="last-commit-title">
            🕒 Last Commit {commitStats.lastCommit.isToday ? '(Today)' : ''}
          </h4>
          <p className="last-commit-details">
            Repository: <strong>{commitStats.lastCommit.repo}</strong> #{commitStats.lastCommit.sha}<br />
            Commit Message: "{commitStats.lastCommit.message}"<br />
            <span className="commit-time">Commit Date: {commitStats.lastCommit.time}</span>
          </p>
        </div>
      )}

      <div className="api-info">
        <small className="api-disclaimer">
          ✨ <strong>Real-time data</strong>: Checking your {commitStats.apiInfo.reposChecked} most recently updated repositories.
        </small>
      </div>
    </div>
  );
};

export default CommitStats;
