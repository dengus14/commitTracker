import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useStreakData } from '../hooks/useStreakDataPersisted';
import { useLanguageStats } from '../hooks/useLanguageStats';
import { ACHIEVEMENTS } from '../data/achievements';

const AchievementContext = createContext(null);

function evaluateAchievements(streakData, languageData, commitStats) {
  const unlocked = new Set(['welcome']);

  if (streakData) {
    const { currentStreak, longestStreak } = streakData;
    ACHIEVEMENTS.forEach(({ id, criteria }) => {
      if (criteria.minStreak && currentStreak >= criteria.minStreak) unlocked.add(id);
      if (criteria.comeback && currentStreak >= 1 && longestStreak > currentStreak) unlocked.add(id);
    });
  }

  if (languageData?.languages) {
    const count = languageData.languages.length;
    ACHIEVEMENTS.forEach(({ id, criteria }) => {
      if (criteria.languageCount && count >= criteria.languageCount) unlocked.add(id);
    });
  }

  if (commitStats) {
    const { todayCount, events } = commitStats;
    ACHIEVEMENTS.forEach(({ id, criteria }) => {
      if (criteria.dailyCommits && todayCount >= criteria.dailyCommits) unlocked.add(id);
    });

    if (Array.isArray(events)) {
      const pushEvents = events.filter(e => e.type === 'PushEvent');
      const hasSat = pushEvents.some(e => new Date(e.created_at).getDay() === 6);
      const hasSun = pushEvents.some(e => new Date(e.created_at).getDay() === 0);
      if (hasSat && hasSun) unlocked.add('weekend_warrior');
      if (pushEvents.some(e => new Date(e.created_at).getHours() < 6)) unlocked.add('early_bird');
      if (pushEvents.some(e => new Date(e.created_at).getHours() >= 23)) unlocked.add('night_owl');
    }
  }

  return unlocked;
}

export const AchievementProvider = ({ children }) => {
  const { user } = useAuth();
  const { streakData, calculateStreak } = useStreakData();
  const { languageData, fetchLanguageStats } = useLanguageStats();
  const [commitStats, setCommitStats] = useState(null);

  useEffect(() => {
    if (user?.username) {
      calculateStreak(user.username);
      fetchLanguageStats(user.username);
    }
  }, [user, calculateStreak, fetchLanguageStats]);

  const unlockedIds = useMemo(
    () => evaluateAchievements(streakData, languageData, commitStats),
    [streakData, languageData, commitStats]
  );

  return (
    <AchievementContext.Provider value={{ unlockedIds, provideCommitStats: setCommitStats }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => useContext(AchievementContext);
