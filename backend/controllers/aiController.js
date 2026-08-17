import HabitInfo from '../models/HabitInfo.js';
import CompletionLog from '../models/CompletionLog.js';
import SignUp from '../models/SignUp.js';

const MOTIVATIONAL_QUOTES = [
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { quote: "Small habits don't add up. They compound.", author: "James Clear (Atomic Habits)" },
  { quote: "Success is the product of daily habits—not once-in-a-lifetime transformations.", author: "James Clear" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "Atomic Habits" },
  { quote: "Energy flows where attention goes and intention sits.", author: "RPG Habit Wisdom" },
  { quote: "A journey of a thousand miles begins with a single quest.", author: "Lao Tzu" },
  { quote: "Consistency is the fire that tempers the legendary blade of discipline.", author: "HabitForge Codex" }
];

const DAILY_QUESTS = [
  { id: 'quest_1', title: 'Morning Vanguard', description: 'Complete at least 2 habits before 12 PM', xpBonus: 100, icon: '⚡' },
  { id: 'quest_2', title: 'Triple Combo', description: 'Complete 3 habits in a single day', xpBonus: 150, icon: '🔥' },
  { id: 'quest_3', title: 'Mindfulness & Body', description: 'Log one Fitness habit and one Mindfulness habit', xpBonus: 120, icon: '🧘' },
  { id: 'quest_4', title: 'Streak Preserver', description: 'Keep a 3+ day streak active on any habit', xpBonus: 80, icon: '🛡️' }
];

export async function getCoachInsights(req, res) {
  try {
    const habits = await HabitInfo.find({ owner: req.userId });
    const user = await SignUp.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const totalHabits = habits.length;
    const activeStreaks = habits.filter(h => h.currentStreak > 0).length;
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
    const dailyQuest = DAILY_QUESTS[dayOfYear % DAILY_QUESTS.length];

    const recommendations = [];

    if (totalHabits === 0) {
      recommendations.push({
        title: "Begin Your Hero Journey",
        description: "Start small with 1 or 2 core daily habits like 'Hydrate with 2L Water' or '10 Minute Morning Read'.",
        suggestedHabit: { name: "Hydrate (2L Water)", category: "health", icon: "💧", color: "#06b6d4" }
      });
    } else if (activeStreaks === 0) {
      recommendations.push({
        title: "Ignite Your Streak Fire",
        description: "You have no active streaks right now. Complete any single habit today to kickstart your momentum!",
        suggestedHabit: { name: "5-Min Quick Meditation", category: "mindfulness", icon: "🧘", color: "#8b5cf6" }
      });
    } else if (maxStreak >= 5) {
      recommendations.push({
        title: "Habit Stacking Synergy",
        description: `Great job holding a ${maxStreak}-day streak! Try 'habit stacking': pair your strong habit with a new learning or fitness quest immediately after.`,
        suggestedHabit: { name: "Read 10 Pages of a Book", category: "learning", icon: "📚", color: "#f59e0b" }
      });
    }

    const existingCategories = new Set(habits.map(h => h.category));
    if (!existingCategories.has('mindfulness')) {
      recommendations.push({
        title: "Balance Your Mind & Mana",
        description: "Adding a daily mindfulness ritual lowers stress and increases focus.",
        suggestedHabit: { name: "Deep Breathing (5 Mins)", category: "mindfulness", icon: "🌌", color: "#a855f7" }
      });
    }
    if (!existingCategories.has('fitness')) {
      recommendations.push({
        title: "Forge Physical Stamina",
        description: "A quick 15-minute daily workout boosts XP gains and daily energy levels.",
        suggestedHabit: { name: "15 Min Daily Workout", category: "fitness", icon: "🏋️‍♂️", color: "#ef4444" }
      });
    }

    res.json({
      quote,
      dailyQuest,
      statsSummary: {
        totalHabits,
        activeStreaks,
        maxStreak,
        userLevel: user.level,
        userXP: user.xp
      },
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI coach insights.', error: error.message });
  }
}
