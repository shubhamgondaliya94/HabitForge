import HabitInfo from '../models/HabitInfo.js';
import CompletionLog from '../models/CompletionLog.js';
import SignUp from '../models/SignUp.js';
import { getTodayString } from '../utils/dateUtils.js';
import { logger } from '../utils/logger.js';

export async function getHabits(req, res) {
  try {
    const habits = await HabitInfo.find({ owner: req.userId }).sort({ createdAt: -1 });
    const todayStr = getTodayString();

    // Fetch today's completion logs from 'completionlogs' table
    const todayLogs = await CompletionLog.find({
      user: req.userId,
      date: todayStr
    });

    const completedHabitIds = new Set(todayLogs.map(log => log.habit.toString()));

    const enrichedHabits = habits.map(habit => {
      const h = habit.toObject();
      h.completedToday = completedHabitIds.has(habit._id.toString());
      return h;
    });

    res.json(enrichedHabits);
  } catch (error) {
    logger.error('Error fetching habits', { userId: req.userId, error: error.message });
    res.status(500).json({ message: 'Error fetching habits.', error: error.message });
  }
}

export async function createHabit(req, res) {
  try {
    const { name, description, frequency, category, color, icon, targetPerWeek } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Habit name is required.' });
    }

    const user = await SignUp.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Free tier limit check (up to 25 habits)
    if (!user.isPremium) {
      const activeCount = await HabitInfo.countDocuments({ owner: req.userId });
      if (activeCount >= 25) {
        return res.status(403).json({
          message: 'Free tier limit reached (25 habits). Upgrade to Premium for unlimited habits!',
          isPremiumRequired: true
        });
      }
    }

    // Save directly in 'habit_info' collection with user's name (userName)
    const habit = new HabitInfo({
      name: name.trim(),
      description: description ? description.trim() : '',
      frequency: frequency || 'daily',
      category: category || 'productivity',
      color: color || '#8b5cf6',
      icon: icon || '⭐',
      targetPerWeek: targetPerWeek || 7,
      owner: req.userId,
      userName: user.username // Stores user's name directly in habit_info table!
    });

    await habit.save();

    logger.info(`Saved new habit "${habit.name}" owned by user "${user.username}" (${user._id})`);

    res.status(201).json(habit);
  } catch (error) {
    logger.error('Error creating habit', { userId: req.userId, error: error.message });
    res.status(500).json({ message: 'Error saving habit to database.', error: error.message });
  }
}

export async function getHabitById(req, res) {
  try {
    const habit = await HabitInfo.findOne({ _id: req.params.id, owner: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habit.', error: error.message });
  }
}

export async function updateHabit(req, res) {
  try {
    const { name, description, frequency, category, color, icon, targetPerWeek } = req.body;

    const habit = await HabitInfo.findOne({ _id: req.params.id, owner: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    const user = await SignUp.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found. Cannot update habit.' });

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Habit name cannot be empty.' });
      }
      habit.name = name.trim();
    }
    if (description !== undefined) habit.description = description.trim();
    if (frequency) habit.frequency = frequency;
    if (category) habit.category = category;
    if (color) habit.color = color;
    if (icon) habit.icon = icon;
    if (targetPerWeek) habit.targetPerWeek = targetPerWeek;
    if (user) habit.userName = user.username;

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating habit.', error: error.message });
  }
}

export async function deleteHabit(req, res) {
  try {
    const habit = await HabitInfo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    // Clean up completion logs for deleted habit from 'completionlogs' table
    await CompletionLog.deleteMany({ habit: req.params.id });

    res.json({ message: 'Habit and associated logs deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit.', error: error.message });
  }
}
