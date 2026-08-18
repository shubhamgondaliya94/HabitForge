// Frontend copy of BADGE_CATALOG used by UI components.
// Kept minimal to avoid bundling backend-only code into the frontend build.

export const BADGE_CATALOG = [
  {
    code: 'first_step',
    name: 'First Step',
    description: 'Logged your very first habit completion!',
    icon: '🐣',
    category: 'general'
  },
  {
    code: 'early_bird',
    name: 'Early Bird',
    description: 'Completed a habit before 8:00 AM',
    icon: '🌅',
    category: 'time'
  },
  {
    code: 'night_owl',
    name: 'Night Owl',
    description: 'Completed a habit after 10:00 PM',
    icon: '🦉',
    category: 'time'
  },
  {
    code: 'streak_3',
    name: 'On Fire',
    description: 'Reached a 3-day streak on any habit',
    icon: '🔥',
    category: 'streak'
  },
  {
    code: 'streak_7',
    name: 'Streak Demon',
    description: 'Reached a 7-day streak on any habit',
    icon: '⚡',
    category: 'streak'
  },
  {
    code: 'streak_30',
    name: 'Unstoppable',
    description: 'Achieved an epic 30-day streak!',
    icon: '🏆',
    category: 'streak'
  },
  {
    code: 'water_master',
    name: 'Hydration Master',
    description: 'Completed 5 health or water habits',
    icon: '💧',
    category: 'health'
  },
  {
    code: 'fitness_hero',
    name: 'Fitness Hero',
    description: 'Completed 5 workout or fitness habits',
    icon: '🏋️‍♂️',
    category: 'fitness'
  },
  {
    code: 'reading_champion',
    name: 'Reading Champion',
    description: 'Completed 5 reading or learning habits',
    icon: '📚',
    category: 'learning'
  },
  {
    code: 'mindfulness_guru',
    name: 'Zen Master',
    description: 'Completed 5 mindfulness or meditation habits',
    icon: '🧘',
    category: 'mindfulness'
  },
  {
    code: 'level_5',
    name: 'Level 5 Hero',
    description: 'Reached Hero Level 5',
    icon: '👑',
    category: 'level'
  },
  {
    code: 'habit_master',
    name: 'Habit Master',
    description: 'Completed 50 habit logs overall!',
    icon: '🎖️',
    category: 'milestone'
  }
];

export default {
  BADGE_CATALOG
};
