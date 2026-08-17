import SignUp from '../models/SignUp.js';
import HabitInfo from '../models/HabitInfo.js';
import CompletionLog from '../models/CompletionLog.js';
import bcrypt from 'bcryptjs';
import { format, subDays } from 'date-fns';
import { calculateLevel, getTitleForLevel } from '../services/gamificationService.js';

export async function seedInitialData() {
  try {
    const existingUsers = await SignUp.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already initialized with users in sign_up table.');
      return;
    }

    console.log('Seeding initial RPG HabitForge data across sign_up, habit_info, and completionlogs tables...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create Main Demo Hero User in 'sign_up' table
    const heroUser = new SignUp({
      username: 'ShadowKnight',
      email: 'hero@habitforge.com',
      password: passwordHash,
      avatar: '🛡️',
      xp: 1250,
      level: calculateLevel(1250),
      title: getTitleForLevel(calculateLevel(1250)),
      isPremium: true,
      badges: [
        { code: 'first_step', name: 'First Step', description: 'Logged your very first habit completion!', icon: '🐣', category: 'general', unlockedAt: subDays(new Date(), 30) },
        { code: 'early_bird', name: 'Early Bird', description: 'Completed a habit before 8:00 AM', icon: '🌅', category: 'time', unlockedAt: subDays(new Date(), 20) },
        { code: 'streak_7', name: 'Streak Demon', description: 'Reached a 7-day streak on any habit', icon: '⚡', category: 'streak', unlockedAt: subDays(new Date(), 10) },
        { code: 'water_master', name: 'Hydration Master', description: 'Completed 5 health or water habits', icon: '💧', category: 'health', unlockedAt: subDays(new Date(), 5) }
      ]
    });
    await heroUser.save();

    // Create Friend 1
    const friend1 = new SignUp({
      username: 'ValkyrieAura',
      email: 'valkyrie@habitforge.com',
      password: passwordHash,
      avatar: '⚡',
      xp: 2100,
      level: calculateLevel(2100),
      title: getTitleForLevel(calculateLevel(2100)),
      isPremium: false,
      badges: [
        { code: 'first_step', name: 'First Step', description: 'Logged your first habit', icon: '🐣', category: 'general' },
        { code: 'streak_30', name: 'Unstoppable', description: 'Achieved a 30-day streak', icon: '🏆', category: 'streak' }
      ]
    });
    await friend1.save();

    // Create Friend 2
    const friend2 = new SignUp({
      username: 'IronPaladin',
      email: 'iron@habitforge.com',
      password: passwordHash,
      avatar: '⚔️',
      xp: 950,
      level: calculateLevel(950),
      title: getTitleForLevel(calculateLevel(950)),
      isPremium: false
    });
    await friend2.save();

    heroUser.friends = [friend1._id, friend2._id];
    await heroUser.save();

    // Create Sample Habits in 'habit_info' table with userName field included!
    const habit1 = new HabitInfo({
      name: 'Hydrate 2.5L Water',
      description: 'Drink 8 glasses of fresh water daily',
      frequency: 'daily',
      category: 'health',
      color: '#06b6d4',
      icon: '💧',
      currentStreak: 12,
      longestStreak: 15,
      lastCompletedDate: format(new Date(), 'yyyy-MM-dd'),
      owner: heroUser._id,
      userName: heroUser.username
    });

    const habit2 = new HabitInfo({
      name: 'Read 20 Pages',
      description: 'Read non-fiction or tech books',
      frequency: 'daily',
      category: 'learning',
      color: '#f59e0b',
      icon: '📚',
      currentStreak: 7,
      longestStreak: 7,
      lastCompletedDate: format(new Date(), 'yyyy-MM-dd'),
      owner: heroUser._id,
      userName: heroUser.username
    });

    const habit3 = new HabitInfo({
      name: 'Morning Workout & Stretch',
      description: '30 mins resistance or cardio training',
      frequency: 'daily',
      category: 'fitness',
      color: '#ef4444',
      icon: '🏋️‍♂️',
      currentStreak: 4,
      longestStreak: 10,
      lastCompletedDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      owner: heroUser._id,
      userName: heroUser.username
    });

    const habit4 = new HabitInfo({
      name: 'Daily Meditation',
      description: '10 minutes of calm mindfulness breathwork',
      frequency: 'daily',
      category: 'mindfulness',
      color: '#8b5cf6',
      icon: '🧘',
      currentStreak: 0,
      longestStreak: 5,
      lastCompletedDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      owner: heroUser._id,
      userName: heroUser.username
    });

    const habit5 = new HabitInfo({
      name: 'Code Project Feature',
      description: 'Ship 1 commit or feature daily',
      frequency: 'daily',
      category: 'productivity',
      color: '#10b981',
      icon: '💻',
      currentStreak: 9,
      longestStreak: 9,
      lastCompletedDate: format(new Date(), 'yyyy-MM-dd'),
      owner: heroUser._id,
      userName: heroUser.username
    });

    await HabitInfo.insertMany([habit1, habit2, habit3, habit4, habit5]);

    // Seed past 60 days of logs in 'completionlogs' table
    const logs = [];
    const habitsList = [habit1, habit2, habit3, habit4, habit5];

    for (let i = 0; i < 60; i++) {
      const logDate = subDays(new Date(), i);
      const dateStr = format(logDate, 'yyyy-MM-dd');

      habitsList.forEach((habit, idx) => {
        const probability = idx < 2 ? 0.85 : 0.6;
        if (Math.random() < probability) {
          logs.push({
            habit: habit._id,
            user: heroUser._id,
            date: dateStr,
            timestamp: logDate,
            xpEarned: 50 + (idx * 10)
          });
        }
      });
    }

    await CompletionLog.insertMany(logs);
    console.log(`Successfully seeded sample data with userName fields across sign_up, habit_info, and completionlogs tables.`);

  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}
