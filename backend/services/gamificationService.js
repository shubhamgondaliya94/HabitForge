import { format, parseISO, differenceInCalendarDays, subDays } from 'date-fns';
import CompletionLog from '../models/CompletionLog.js';

/**
 * Calculates level from total XP using Level = floor(sqrt(XP) * 0.4) + 1
 */
export function calculateLevel(xp) {
  if (!xp || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp) * 0.4) + 1;
}

/**
 * Determines RPG player title based on user level
 */
export function getTitleForLevel(level) {
  if (level >= 20) return 'Ascended Legend 🌟';
  if (level >= 15) return 'Habit Titan 🛡️';
  if (level >= 12) return 'Master of Discipline ⚔️';
  if (level >= 8) return 'Iron Will Warrior 🗡️';
  if (level >= 5) return 'Habit Apprentice 📘';
  if (level >= 3) return 'Aspiring Pathfinder 🧭';
  return 'Novice Adventurer 🐣';
}

/**
 * Catalog of all unlockable badges with requirement checks
 */
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

/**
 * Calculates new streak based on date-fns logic
 */
export function calculateStreak(lastCompletedDateStr, todayStr) {
  if (!lastCompletedDateStr) {
    return 1; // First time completing
  }

  const today = parseISO(todayStr);
  const lastDate = parseISO(lastCompletedDateStr);
  const diffDays = differenceInCalendarDays(today, lastDate);

  if (diffDays === 0) {
    // Already completed today
    return null; // Return null to signal no change needed
  } else if (diffDays === 1) {
    // Completed yesterday -> increment streak
    return 'INCREMENT';
  } else {
    // Missed 1 or more days -> reset streak to 1
    return 'RESET';
  }
}

/**
 * Evaluates unlockable badges for user after a habit completion
 */
export async function evaluateBadges(user, habit, currentStreak) {
  const existingBadgeCodes = new Set(user.badges.map(b => b.code));
  const newBadges = [];

  const totalLogsCount = await CompletionLog.countDocuments({ user: user._id });
  const categoryLogsCount = await CompletionLog.countDocuments({
    user: user._id,
    habit: habit._id
  });

  const hourNow = new Date().getHours();

  for (const badgeDef of BADGE_CATALOG) {
    if (existingBadgeCodes.has(badgeDef.code)) continue;

    let shouldUnlock = false;

    switch (badgeDef.code) {
      case 'first_step':
        shouldUnlock = totalLogsCount >= 1;
        break;
      case 'early_bird':
        shouldUnlock = hourNow < 8;
        break;
      case 'night_owl':
        shouldUnlock = hourNow >= 22;
        break;
      case 'streak_3':
        shouldUnlock = currentStreak >= 3;
        break;
      case 'streak_7':
        shouldUnlock = currentStreak >= 7;
        break;
      case 'streak_30':
        shouldUnlock = currentStreak >= 30;
        break;
      case 'water_master':
        shouldUnlock = (habit.category === 'health' || habit.name.toLowerCase().includes('water')) && categoryLogsCount >= 5;
        break;
      case 'fitness_hero':
        shouldUnlock = (habit.category === 'fitness' || habit.name.toLowerCase().includes('workout') || habit.name.toLowerCase().includes('run')) && categoryLogsCount >= 5;
        break;
      case 'reading_champion':
        shouldUnlock = (habit.category === 'learning' || habit.name.toLowerCase().includes('read') || habit.name.toLowerCase().includes('book')) && categoryLogsCount >= 5;
        break;
      case 'mindfulness_guru':
        shouldUnlock = (habit.category === 'mindfulness' || habit.name.toLowerCase().includes('meditate')) && categoryLogsCount >= 5;
        break;
      case 'level_5':
        shouldUnlock = user.level >= 5;
        break;
      case 'habit_master':
        shouldUnlock = totalLogsCount >= 50;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      newBadges.push({
        code: badgeDef.code,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        category: badgeDef.category,
        unlockedAt: new Date()
      });
    }
  }

  return newBadges;
}
