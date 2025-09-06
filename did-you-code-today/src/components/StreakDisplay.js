import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStreakData } from '../hooks/useStreakData';

const StreakDisplay = () => {
  const { user } = useAuth();
  const { loading, streakData, error, calculateStreak } = useStreakData();

  useEffect(() => {
    if (user && user.username) {
      calculateStreak(user.username);
    }
  }, [user, calculateStreak]);

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '😴';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🚀';
    if (streak < 30) return '💪';
    if (streak < 100) return '🏆';
    return '👑';
  };

  const getStreakMessage = (current, longest) => {
    if (current === 0 && longest === 0) {
      return "Ready to start your coding journey?";
    }
    if (current === 0) {
      return `Your longest was ${longest} days. Time for a comeback!`;
    }
    if (current === longest) {
      return "You're on your personal best streak!";
    }
    return `Keep going! Your record is ${longest} days.`;
  };

  const formatLastCommitDate = (date) => {
    if (!date) return null;
    
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="language-stats">
        <div className="language-stats-header">
          <h3>🔥 Coding Streak</h3>
        </div>
        <div className="language-stats-loading">
          <div className="loading-spinner"></div>
          <p>Calculating your streak...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="language-stats">
        <div className="language-stats-header">
          <h3>🔥 Coding Streak</h3>
        </div>
        <div className="language-stats-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="language-stats">
        <div className="language-stats-header">
          <h3>🔥 Coding Streak</h3>
        </div>
        <div className="language-stats-empty">
          <p>No streak data available</p>
        </div>
      </div>
    );
  }

  const { currentStreak, longestStreak, lastCommitDate } = streakData;
  const lastCommitText = formatLastCommitDate(lastCommitDate);

  return (
    <div className="language-stats">
      <div className="language-stats-header">
        <h3>🔥 Coding Streak</h3>
      </div>

      <div className="streak-main-display">
        <div className="streak-current">
          <div className="streak-number">
            <span className="streak-emoji">{getStreakEmoji(currentStreak)}</span>
            <span className="streak-count">{currentStreak}</span>
          </div>
          <div className="streak-label">
            {currentStreak === 1 ? 'day' : 'days'} current
          </div>
        </div>

        <div className="streak-divider"></div>

        <div className="streak-longest">
          <div className="streak-number">
            <span className="streak-emoji">🏆</span>
            <span className="streak-count">{longestStreak}</span>
          </div>
          <div className="streak-label">
            {longestStreak === 1 ? 'day' : 'days'} longest
          </div>
        </div>
      </div>

      <div className="streak-message">
        <p>{getStreakMessage(currentStreak, longestStreak)}</p>
      </div>

      {lastCommitText && (
        <div className="streak-last-commit">
          <small>Last commit: {lastCommitText}</small>
        </div>
      )}

      <div className="language-stats-footer">
        {user && (
          <button 
            className="refresh-languages-btn"
            onClick={() => calculateStreak(user.username)}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
