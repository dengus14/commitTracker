import { LuActivity, LuGitCommitHorizontal, LuDatabase, LuCalendarDays, LuFlame, LuTrendingUp, LuClock } from 'react-icons/lu';

const CommitStats = ({ commitStats, loading, currentStreak }) => {
  if (!commitStats || loading) return null;

  const stats = [
    {
      icon: LuGitCommitHorizontal,
      pillClass: 'stat-icon-pill-blue',
      label: 'Commits Today',
      value: commitStats.todayCount,
      trend: commitStats.todayCount > 0 ? 'Active today' : null,
    },
    {
      icon: LuDatabase,
      pillClass: 'stat-icon-pill-green',
      label: 'Active Repos Today',
      value: commitStats.todayRepos,
      trend: commitStats.todayRepos > 1 ? 'Multiple repos' : null,
    },
    {
      icon: LuCalendarDays,
      pillClass: 'stat-icon-pill-purple',
      label: 'This Week',
      value: commitStats.thisWeekCount ?? '—',
      trend: null,
    },
    {
      icon: LuFlame,
      pillClass: 'stat-icon-pill-orange',
      label: 'Current Streak',
      value: currentStreak ?? '—',
      trend: currentStreak > 0 ? `${currentStreak} day${currentStreak !== 1 ? 's' : ''}` : null,
    },
  ];

  return (
    <div className="stats-container">
      <h3 className="stats-title">
        <LuActivity size={13} />
        Activity Summary
      </h3>

      <div className="stats-grid">
        {stats.map(({ icon: Icon, pillClass, label, value, trend }) => (
          <div className="stat-item" key={label}>
            <div className="stat-item-top">
              <div className={`stat-icon-pill ${pillClass}`}>
                <Icon size={16} />
              </div>
              {trend && <LuTrendingUp size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />}
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-number">{value}</div>
            {trend && <div className="stat-trend">{trend}</div>}
          </div>
        ))}
      </div>

      {commitStats.lastCommit && (
        <div className="last-commit-info">
          <h4 className="last-commit-title">
            <LuClock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Last Commit {commitStats.lastCommit.isToday ? '(Today)' : ''}
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
          <strong>Real-time data</strong>: Checking your {commitStats.apiInfo.reposChecked} most recently updated repositories.
        </small>
      </div>
    </div>
  );
};

export default CommitStats;
