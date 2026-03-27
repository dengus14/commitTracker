import { useState } from 'react';

const BAR_COUNT = 30;

const CommitChart = ({ days = [], loading }) => {
  const [hovered, setHovered] = useState(null);

  const maxCount = Math.max(...days.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="commit-chart-wrap">
        <div className="commit-chart-skeleton">
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <div
              key={i}
              className="commit-chart-skeleton-bar"
              style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (days.length === 0) return null;

  const totalCommits = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter(d => d.count > 0).length;

  return (
    <div className="commit-chart-wrap">
      <div className="commit-chart-meta">
        <span className="commit-chart-meta-item">
          <strong>{totalCommits}</strong> commits
        </span>
        <span className="commit-chart-meta-dot" />
        <span className="commit-chart-meta-item">
          <strong>{activeDays}</strong> active days
        </span>
      </div>

      <div className="commit-chart-bars">
        {days.map((day, i) => {
          const heightPct = day.count === 0 ? 0 : Math.max(8, (day.count / maxCount) * 100);
          const isHovered = hovered === i;
          const hasCommits = day.count > 0;

          return (
            <div
              key={day.dateKey}
              className="commit-chart-col"
              style={{ '--bar-h': `${heightPct}%` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className={`commit-chart-tooltip ${i > 22 ? 'left' : ''}`}>
                  <div className="commit-chart-tooltip-date">{day.shortDate}</div>
                  <div className="commit-chart-tooltip-count">
                    {day.count} commit{day.count !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* Day label above the bar — only when there are commits */}
              {hasCommits && (
                <div className={`commit-chart-top-label ${day.isToday ? 'today' : ''}`}>
                  {day.isToday ? 'Today' : day.dayName}
                </div>
              )}

              <div className="commit-chart-bar-track">
                <div
                  className={`commit-chart-bar ${!hasCommits ? 'empty' : ''} ${day.isToday ? 'today' : ''} ${isHovered ? 'active' : ''}`}
                  style={{ '--bar-height': `${heightPct}%`, animationDelay: `${i * 20}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommitChart;
