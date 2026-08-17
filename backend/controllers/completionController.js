import HabitInfo from '../models/HabitInfo.js';
import CompletionLog from '../models/CompletionLog.js';
import SignUp from '../models/SignUp.js';
import { format, subDays, parseISO, differenceInCalendarDays, eachDayOfInterval } from 'date-fns';
import { calculateStreak, calculateLevel, getTitleForLevel, evaluateBadges } from '../services/gamificationService.js';

export async function toggleCompletion(req, res) {
  try {
    const { habitId, dateStr } = req.body;
    const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');

    const habit = await HabitInfo.findOne({ _id: habitId, owner: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    const user = await SignUp.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const existingLog = await CompletionLog.findOne({ habit: habitId, date: targetDate });

    if (existingLog) {
      // UNDO Completion
      await CompletionLog.deleteOne({ _id: existingLog._id });

      // Deduct XP
      const xpDeduction = existingLog.xpEarned || 50;
      user.xp = Math.max(0, user.xp - xpDeduction);
      user.level = calculateLevel(user.xp);
      user.title = getTitleForLevel(user.level);
      await user.save();

      // Recalculate streak
      const latestLog = await CompletionLog.findOne({ habit: habitId }).sort({ date: -1 });
      if (latestLog) {
        habit.lastCompletedDate = latestLog.date;
      } else {
        habit.lastCompletedDate = null;
        habit.currentStreak = 0;
      }
      await habit.save();

      return res.json({
        action: 'uncompleted',
        habit,
        user: {
          xp: user.xp,
          level: user.level,
          title: user.title,
          badges: user.badges
        }
      });
    }

    // COMPLETE Habit
    const streakAction = calculateStreak(habit.lastCompletedDate, targetDate);

    if (streakAction === 'INCREMENT') {
      habit.currentStreak += 1;
    } else if (streakAction === 'RESET' || habit.lastCompletedDate === null) {
      habit.currentStreak = 1;
    }

    habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
    habit.lastCompletedDate = targetDate;
    await habit.save();

    const baseXP = 50;
    const streakBonus = habit.currentStreak * 10;
    const totalXPEarned = baseXP + streakBonus;

    const oldLevel = user.level;
    user.xp += totalXPEarned;
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;
    user.title = getTitleForLevel(newLevel);

    const isLevelUp = newLevel > oldLevel;

    // Create completion log in 'completionlogs' table
    const log = new CompletionLog({
      habit: habitId,
      user: req.userId,
      date: targetDate,
      timestamp: new Date(),
      xpEarned: totalXPEarned
    });

    try {
      await log.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Habit already completed for this date.' });
      }
      throw err;
    }

    // Evaluate badges
    const newBadges = await evaluateBadges(user, habit, habit.currentStreak);
    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
    }

    await user.save();

    res.json({
      action: 'completed',
      xpEarned: totalXPEarned,
      isLevelUp,
      oldLevel,
      newLevel,
      newBadges,
      habit,
      user: {
        xp: user.xp,
        level: user.level,
        title: user.title,
        badges: user.badges
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error toggling completion.', error: error.message });
  }
}

/**
 * Returns GitHub-style 365 day completion heatmap data from 'completionlogs' table
 */
export async function getHeatmapData(req, res) {
  try {
    const end = new Date();
    const start = subDays(end, 364);

    const logs = await CompletionLog.find({
      user: req.userId,
      timestamp: { $gte: start, $lte: end }
    });

    const countsByDate = {};
    logs.forEach(log => {
      countsByDate[log.date] = (countsByDate[log.date] || 0) + 1;
    });

    const dateRange = eachDayOfInterval({ start, end });
    const heatmap = dateRange.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      return {
        date: dateStr,
        count: countsByDate[dateStr] || 0,
        intensity: Math.min(4, countsByDate[dateStr] || 0)
      };
    });

    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ message: 'Error generating heatmap data.', error: error.message });
  }
}

/**
 * Returns 30-day completion rate analytics from 'completionlogs' table
 */
export async function getAnalyticsData(req, res) {
  try {
    const end = new Date();
    const start = subDays(end, 29);

    const totalHabitsCount = await HabitInfo.countDocuments({ owner: req.userId });

    const logs = await CompletionLog.find({
      user: req.userId,
      timestamp: { $gte: start, $lte: end }
    });

    const logsByDate = {};
    logs.forEach(log => {
      logsByDate[log.date] = (logsByDate[log.date] || 0) + 1;
    });

    const days = eachDayOfInterval({ start, end });
    const lineChartData = days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = logsByDate[dateStr] || 0;
      const rate = totalHabitsCount > 0 ? Math.min(100, Math.round((count / totalHabitsCount) * 100)) : 0;
      return {
        date: format(d, 'MMM dd'),
        fullDate: dateStr,
        completions: count,
        completionRate: rate
      };
    });

    const categoryStats = await HabitInfo.aggregate([
      { $match: { owner: req.userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalHabits: totalHabitsCount,
      lineChartData,
      categoryStats: categoryStats.map(c => ({ category: c._id, count: c.count }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating analytics.', error: error.message });
  }
}

/**
 * Premium feature: CSV Export of completion history
 */
export async function exportCSV(req, res) {
  try {
    const user = await SignUp.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.isPremium) {
      return res.status(403).json({ message: 'CSV Export is a Premium Tier feature.' });
    }

    const logs = await CompletionLog.find({ user: req.userId }).populate('habit', 'name category').sort({ timestamp: -1 });

    let csvContent = 'Date,Timestamp,Habit Name,Category,XP Earned\n';
    logs.forEach(log => {
      const habitName = log.habit ? `"${log.habit.name.replace(/"/g, '""')}"` : '"Deleted Habit"';
      const category = log.habit ? log.habit.category : 'N/A';
      csvContent += `${log.date},"${log.timestamp.toISOString()}",${habitName},${category},${log.xpEarned}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=habitforge_completions.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting CSV.', error: error.message });
  }
}
