// Achievement definitions and configuration
export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  COMMITS: 'commits', 
  LANGUAGES: 'languages',
  CONSISTENCY: 'consistency',
  SPECIAL: 'special'
};

export const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Make your first commit',
    emoji: '👶',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 1 },
    rarity: 'common'
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Code for 3 consecutive days',
    emoji: '🚀',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 3 },
    rarity: 'common'
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Code for 7 consecutive days',
    emoji: '🔥',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 7 },
    rarity: 'uncommon'
  },
  {
    id: 'dedicated',
    title: 'Dedicated Coder',
    description: 'Code for 14 consecutive days',
    emoji: '💪',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 14 },
    rarity: 'uncommon'
  },
  {
    id: 'supercomputer',
    title: 'Supercomputer',
    description: 'Code for 30 consecutive days',
    emoji: '🤖',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 30 },
    rarity: 'rare'
  },
  {
    id: 'coding_machine',
    title: 'Coding Machine',
    description: 'Code for 50 consecutive days',
    emoji: '⚡',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 50 },
    rarity: 'rare'
  },
  {
    id: 'legendary',
    title: 'Legendary Coder',
    description: 'Code for 100 consecutive days',
    emoji: '👑',
    type: ACHIEVEMENT_TYPES.STREAK,
    criteria: { minStreak: 100 },
    rarity: 'legendary'
  },

  // Commit-based achievements
  {
    id: 'productive_day',
    title: 'Productive Day',
    description: 'Make 5 commits in a single day',
    emoji: '📈',
    type: ACHIEVEMENT_TYPES.COMMITS,
    criteria: { dailyCommits: 5 },
    rarity: 'common'
  },
  {
    id: 'commit_machine',
    title: 'Commit Machine',
    description: 'Make 10 commits in a single day',
    emoji: '🏭',
    type: ACHIEVEMENT_TYPES.COMMITS,
    criteria: { dailyCommits: 10 },
    rarity: 'uncommon'
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Make 100 total commits',
    emoji: '💯',
    type: ACHIEVEMENT_TYPES.COMMITS,
    criteria: { totalCommits: 100 },
    rarity: 'uncommon'
  },
  {
    id: 'thousand_commits',
    title: 'Commit Master',
    description: 'Make 1000 total commits',
    emoji: '🎖️',
    type: ACHIEVEMENT_TYPES.COMMITS,
    criteria: { totalCommits: 1000 },
    rarity: 'rare'
  },

  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Code in 3 different languages',
    emoji: '🌍',
    type: ACHIEVEMENT_TYPES.LANGUAGES,
    criteria: { languageCount: 3 },
    rarity: 'common'
  },
  {
    id: 'language_master',
    title: 'Language Master',
    description: 'Code in 5 different languages',
    emoji: '🎓',
    type: ACHIEVEMENT_TYPES.LANGUAGES,
    criteria: { languageCount: 5 },
    rarity: 'uncommon'
  },
  {
    id: 'multilingual',
    title: 'Multilingual',
    description: 'Code in 10 different languages',
    emoji: '🗣️',
    type: ACHIEVEMENT_TYPES.LANGUAGES,
    criteria: { languageCount: 10 },
    rarity: 'rare'
  },

  // Consistency achievements
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Code on both Saturday and Sunday',
    emoji: '⚔️',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    criteria: { weekendCommits: true },
    rarity: 'uncommon'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Make a commit before 6 AM',
    emoji: '🐦',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    criteria: { earlyCommit: true },
    rarity: 'uncommon'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Make a commit after 11 PM',
    emoji: '🦉',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    criteria: { lateCommit: true },
    rarity: 'uncommon'
  },

  {
    id: 'welcome',
    title: 'Welcome!',
    description: 'Join the Commit Tracker community',
    emoji: '👋',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    criteria: { firstLogin: true },
    rarity: 'common'
  },
  {
    id: 'comeback',
    title: 'The Comeback',
    description: 'Start a new streak after a break',
    emoji: '🔄',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    criteria: { comeback: true },
    rarity: 'uncommon'
  }
];

export const RARITY_COLORS = {
  common: '#22c55e',      // Green
  uncommon: '#3b82f6',    // Blue  
  rare: '#a855f7',        // Purple
  legendary: '#f59e0b'    // Gold
};

export const RARITY_LABELS = {
  common: 'Common',
  uncommon: 'Uncommon', 
  rare: 'Rare',
  legendary: 'Legendary'
};
