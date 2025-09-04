import React from 'react';
import { useCalendarCommitData } from '../hooks/useCalendarCommitData';

const StreakDisplay = () => {
  const { currentStreak, longestStreak, loading } = useCalendarCommitData();

  if (loading) {
    return (
      <div className="streak-display">
        <div className="streak-loading">
          <div className="streak-item">
            <div className="streak-number">--</div>
            <div className="streak-label">Current Streak</div>
          </div>
        </div>
      </div>
    );
  }

  const getStreakMessage = (streak) => {
    if (streak === 0) return "Time to start coding!";
    if (streak === 1) return "Great start!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "On fire! 🔥";
    if (streak < 100) return "Coding machine! 🚀";
    return "Legendary streak! 🏆";
  };

  const getStreakEmoji = (streak) => {
    if (streak === 0) return "💤";
    if (streak === 1) return "🌱";
    if (streak < 7) return "⚡";
    if (streak < 30) return "🔥";
    if (streak < 100) return "🚀";
    return "🏆";
  };

  return (
    <div className="streak-display">
      <div className="streak-header">
        <h3>Coding Streaks</h3>
        <span className="streak-emoji">{getStreakEmoji(currentStreak)}</span>
      </div>
      
      <div className="streak-stats">
        <div className="streak-item current">
          <div className="streak-number">{currentStreak}</div>
          <div className="streak-label">Current Streak</div>
          <div className="streak-unit">day{currentStreak !== 1 ? 's' : ''}</div>
        </div>
        
        <div className="streak-item longest">
          <div className="streak-number">{longestStreak}</div>
          <div className="streak-label">Best Streak</div>
          <div className="streak-unit">day{longestStreak !== 1 ? 's' : ''}</div>
        </div>
      </div>
      
      <div className="streak-message">
        {getStreakMessage(currentStreak)}
      </div>
    </div>
  );
};

export default StreakDisplay;
