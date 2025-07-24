export const BADGE_TYPES = {
  // Chapter Badges
  FIRST_CHAPTER: {
    id: 'first_chapter',
    name: 'First Chapter',
    description: 'Completed your first chapter',
    icon: '📚',
    type: 'chapter'
  },
  CHAPTER_MASTER: {
    id: 'chapter_master',
    name: 'Chapter Master',
    description: 'Completed 5 chapters',
    icon: '📖',
    type: 'chapter',
    requirement: 5
  },
  CHAPTER_EXPERT: {
    id: 'chapter_expert',
    name: 'Chapter Expert',
    description: 'Completed 10 chapters',
    icon: '📚',
    type: 'chapter',
    requirement: 10
  },

  // Streak Badges
  STREAK_5: {
    id: 'streak_5',
    name: '5 Day Streak',
    description: 'Maintained a 5-day learning streak',
    icon: '🔥',
    type: 'streak',
    requirement: 5
  },
  STREAK_10: {
    id: 'streak_10',
    name: '10 Day Streak',
    description: 'Maintained a 10-day learning streak',
    icon: '🔥',
    type: 'streak',
    requirement: 10
  },
  STREAK_25: {
    id: 'streak_25',
    name: '25 Day Streak',
    description: 'Maintained a 25-day learning streak',
    icon: '🔥',
    type: 'streak',
    requirement: 25
  },
  STREAK_50: {
    id: 'streak_50',
    name: '50 Day Streak',
    description: 'Maintained a 50-day learning streak',
    icon: '🔥',
    type: 'streak',
    requirement: 50
  },
  STREAK_75: {
    id: 'streak_75',
    name: '75 Day Streak',
    description: 'Maintained a 75-day learning streak',
    icon: '🔥',
    type: 'streak',
    requirement: 75
  },
  STREAK_100: {
    id: 'streak_100',
    name: '100 Day Streak',
    description: 'Maintained a 100-day learning streak',
    icon: '🔥',
    type: 'streak',
    requirement: 100
  },

  // Test Badges
  FIRST_TEST: {
    id: 'first_test',
    name: 'First Test',
    description: 'Completed your first test',
    icon: '📝',
    type: 'test'
  },
  TEST_MASTER: {
    id: 'test_master',
    name: 'Test Master',
    description: 'Completed 5 tests',
    icon: '✍️',
    type: 'test',
    requirement: 5
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Scored 100% in an exam',
    icon: '🎯',
    type: 'test'
  },
  CONSISTENCY_KING: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Scored above 90% in 5 consecutive tests',
    icon: '👑',
    type: 'test',
    requirement: 5
  },

  // Doubt Badges
  FIRST_DOUBT: {
    id: 'first_doubt',
    name: 'First Question',
    description: 'Asked your first doubt',
    icon: '❓',
    type: 'doubt'
  },
  CURIOUS_MIND: {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Asked 5 doubts',
    icon: '🤔',
    type: 'doubt',
    requirement: 5
  },
  DOUBT_SOLVER: {
    id: 'doubt_solver',
    name: 'Doubt Solver',
    description: 'Helped solve 5 doubts',
    icon: '💡',
    type: 'doubt',
    requirement: 5
  }
}; 