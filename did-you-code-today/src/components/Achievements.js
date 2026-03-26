import { useAchievements } from '../context/AchievementContext';
import { ACHIEVEMENTS, RARITY_LABELS } from '../data/achievements';
import { LuTrophy, LuLock } from 'react-icons/lu';

const Achievements = () => {
  const { unlockedIds } = useAchievements();

  const ordered = [
    ...ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)),
    ...ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id)),
  ];

  return (
    <div className="achievements">
      <div className="achievements-header">
        <h3><LuTrophy size={13} /> Achievements</h3>
        <span className="achievements-count">
          {unlockedIds.size}/{ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="achievements-grid">
        {ordered.map(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`achievement-badge rarity-${achievement.rarity} ${isUnlocked ? 'unlocked' : 'locked'}`}
              title={achievement.description}
            >
              <span className="achievement-emoji">
                {isUnlocked ? achievement.emoji : <LuLock size={20} />}
              </span>
              <div className="achievement-info">
                <span className="achievement-title">{achievement.title}</span>
                <span className="achievement-rarity">{RARITY_LABELS[achievement.rarity]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
