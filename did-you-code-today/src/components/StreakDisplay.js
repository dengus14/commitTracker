import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStreakData } from '../hooks/useStreakDataPersisted';
import { LuFlame, LuTrophy, LuCircleCheck, LuTriangleAlert, LuCircleX, LuCircleHelp, LuRefreshCw } from 'react-icons/lu';

const StreakDisplay = () => {
  const { user } = useAuth();
  const { loading, streakData, error, calculateStreak, refreshStreak } = useStreakData();

  useEffect(() => {
    if (user && user.username) {
      calculateStreak(user.username);
    }
  }, [user, calculateStreak]);

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


  const calculateDays = (lastCommitDate) => {
  if(lastCommitDate === null){
    return {
      text: "No commit data found",
      color: "gray",
      icon: LuCircleHelp
    }
  }

  const todayDate = new Date()
  const commitDate = new Date(lastCommitDate)
  const diffTime = Math.abs(todayDate - commitDate)
  const days = Math.floor(diffTime / 86400000)

  if (days === 0) {
    return { text: "Today",            color: "green",  icon: LuCircleCheck }
  } else if (days === 1) {
    return { text: "Yesterday",        color: "green",  icon: LuCircleCheck }
  } else if (days <= 3) {
    return { text: `${days} days ago`, color: "yellow", icon: LuTriangleAlert }
  } else {
    return { text: `${days} days ago`, color: "red",    icon: LuCircleX }
  }
}

  const StreakHeader = () => (
    <div className="language-stats-header">
      <h3><LuFlame size={13} /> Coding Streak</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="language-stats">
        <StreakHeader />
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
        <StreakHeader />
        <div className="language-stats-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="language-stats">
        <StreakHeader />
        <div className="language-stats-empty">
          <p>No streak data available</p>
        </div>
      </div>
    );
  }



  const { currentStreak, longestStreak, lastCommitDate } = streakData;
  const lastCommitText = formatLastCommitDate(lastCommitDate);
  const badgeInfo = calculateDays(lastCommitDate);

  return (
    <div className="language-stats">
      <StreakHeader />

      <div className="streak-main-display">
        <div className="streak-current">
          <div className="streak-number">
            <LuFlame size={18} className="streak-icon" />
            <span className="streak-count">{currentStreak}</span>
          </div>
          <div className="streak-label">current streak</div>
        </div>

        <div className="streak-divider"></div>

        <div className="streak-longest">
          <div className="streak-number">
            <LuTrophy size={18} className="streak-trophy" />
            <span className="streak-count">{longestStreak}</span>
          </div>
          <div className="streak-label">longest streak</div>
        </div>
      </div>

      <div className="streak-message">
        <p>{getStreakMessage(currentStreak, longestStreak)}</p>
      </div>

      {badgeInfo && (
        <div className={`commit-badge commit-badge-${badgeInfo.color}`}>
          <badgeInfo.icon size={13} />
          <span>Last commit: {badgeInfo.text}</span>
        </div>
      )}

      <div className="language-stats-footer">
        {user && (
          <button
            className="refresh-languages-btn"
            onClick={() => refreshStreak(user.username)}
            disabled={loading}
          >
            <LuRefreshCw size={10} /> Refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
