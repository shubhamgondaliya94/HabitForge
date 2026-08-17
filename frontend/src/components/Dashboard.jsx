import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, CheckCircle2, Circle, Plus, Trash2, Edit3, 
  Sparkles, Zap, Target, Quote 
} from 'lucide-react';

export default function Dashboard({ 
  user, 
  habits, 
  onToggleHabit, 
  onOpenAddHabit, 
  onEditHabit, 
  onDeleteHabit,
  dailyQuote,
  dailyQuest
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [floatingXP, setFloatingXP] = useState({});

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  
  // Calculate level progress
  const currentLevelBaseXP = Math.pow((currentLevel - 1) / 0.4, 2);
  const nextLevelBaseXP = Math.pow(currentLevel / 0.4, 2);
  const xpInCurrentLevel = Math.max(0, currentXP - currentLevelBaseXP);
  const xpNeededForNext = Math.max(1, nextLevelBaseXP - currentLevelBaseXP);
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const filteredHabits = activeCategory === 'all' 
    ? habits 
    : habits.filter(h => h.category === activeCategory);

  const activeStreaksCount = habits.filter(h => h.currentStreak > 0).length;
  const completedTodayCount = habits.filter(h => h.completedToday).length;

  const handleHabitClick = async (habitId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const habit = habits.find(h => h._id === habitId);
    if (!habit.completedToday) {
      const earnedXP = 50 + (habit.currentStreak * 10);
      setFloatingXP(prev => ({ ...prev, [habitId]: { text: `+${earnedXP} XP`, x, y, id: Date.now() } }));
      setTimeout(() => {
        setFloatingXP(prev => ({ ...prev, [habitId]: null }));
      }, 1200);
    }

    onToggleHabit(habitId);
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Hero RPG Player Card Banner */}
      <div className="glass-panel p-4 sm:p-6 md:p-8 relative overflow-hidden border-purple-500/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Player Title */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 w-full lg:w-auto">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-cyan-500 to-amber-400 p-1 shadow-[0_0_25px_rgba(139,92,246,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-4xl sm:text-5xl">
                  {user?.avatar || '⚔️'}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-amber-300 shadow-md">
                LVL {currentLevel}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
                  {user?.username || 'Hero Adventurer'}
                </h1>
                {user?.isPremium && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-md border border-amber-500/40">
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-amber-400 font-bold text-sm sm:text-base mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4" /> {user?.title || 'Novice Adventurer'}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-cyan-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> {currentXP} Total XP
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Flame className="w-3.5 h-3.5 fire-pulse" /> {activeStreaksCount} Active Streaks
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar & Quick Stats */}
          <div className="w-full lg:w-80 bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-300 uppercase tracking-wider">Level {currentLevel} Progress</span>
              <span className="font-extrabold text-cyan-400">{levelProgressPct}%</span>
            </div>

            <div className="xp-bar-container">
              <div 
                className="xp-bar-fill" 
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{Math.round(xpInCurrentLevel)} XP earned</span>
              <span>{Math.round(xpNeededForNext - xpInCurrentLevel)} XP to Lvl {currentLevel + 1}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Motivational Quote & Daily Quest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Daily Quote Card */}
        <div className="lg:col-span-2 glass-panel p-4 sm:p-5 flex items-start gap-4 border-cyan-500/30">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shrink-0">
            <Quote className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
              DAILY MOTIVATION
            </div>
            <p className="text-slate-200 text-xs sm:text-sm italic font-medium">
              "{dailyQuote?.quote || "Small habits don't add up. They compound."}"
            </p>
            <div className="text-xs text-slate-400 font-semibold mt-1">
              — {dailyQuote?.author || "Atomic Habits"}
            </div>
          </div>
        </div>

        {/* Daily Random Quest */}
        <div className="glass-panel p-4 sm:p-5 border-amber-500/30 bg-gradient-to-br from-slate-900/90 to-amber-950/30">
          <div className="flex justify-between items-start mb-2">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase rounded-md border border-amber-500/30 flex items-center gap-1">
              <Target className="w-3 h-3" /> DAILY QUEST
            </span>
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
              +{dailyQuest?.xpBonus || 100} XP
            </span>
          </div>

          <h4 className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
            <span>{dailyQuest?.icon || '⚡'}</span> {dailyQuest?.title || 'Triple Combo'}
          </h4>
          <p className="text-xs text-slate-300">
            {dailyQuest?.description || 'Complete 3 habits in a single day for bonus XP!'}
          </p>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Progress: {completedTodayCount} / 3</span>
            <span className={completedTodayCount >= 3 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {completedTodayCount >= 3 ? '✓ QUEST COMPLETED!' : 'IN PROGRESS'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Habits Section */}
      <div className="space-y-5">
        
        {/* Filter Tabs & Add Habit Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Habits' },
              { id: 'health', label: '💧 Health' },
              { id: 'fitness', label: '🏋️‍♂️ Fitness' },
              { id: 'learning', label: '📚 Learning' },
              { id: 'mindfulness', label: '🧘 Mind' },
              { id: 'productivity', label: '💻 Work' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button 
            onClick={onOpenAddHabit}
            className="btn-primary py-2 px-4 text-xs whitespace-nowrap hidden sm:inline-flex"
          >
            <Plus className="w-4 h-4" /> Add New Habit
          </button>
        </div>

        {/* Habit Cards Grid */}
        {filteredHabits.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 text-center border-dashed border-slate-700 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-3xl">
              ⚔️
            </div>
            <h3 className="text-xl font-bold text-white">No habits found in this quest log</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Forge your first daily ritual to start earning XP, leveling up your avatar, and unlocking rare RPG badges!
            </p>
            <button 
              onClick={onOpenAddHabit}
              className="btn-cyan py-2.5 px-6 text-sm mx-auto inline-flex"
            >
              <Plus className="w-4 h-4" /> Forge First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHabits.map((habit) => (
              <motion.div
                key={habit._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-panel p-5 relative overflow-hidden transition-all group ${
                  habit.completedToday ? 'border-emerald-500/50 bg-emerald-950/20' : ''
                }`}
                style={{
                  borderLeftWidth: '5px',
                  borderLeftColor: habit.color || '#8b5cf6'
                }}
              >
                {/* Floating +XP animation popup */}
                <AnimatePresence>
                  {floatingXP[habit._id] && (
                    <motion.div
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -45, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute font-black text-amber-300 text-xl pointer-events-none drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] z-30"
                      style={{
                        left: floatingXP[habit._id].x || '50%',
                        top: floatingXP[habit._id].y || '40%'
                      }}
                    >
                      {floatingXP[habit._id].text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Top card header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                      style={{ backgroundColor: `${habit.color}25`, border: `1px solid ${habit.color}50` }}
                    >
                      {habit.icon || '⭐'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">
                        {habit.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {habit.frequency} • {habit.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Habit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {habit.description && (
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {habit.description}
                  </p>
                )}

                {/* Card footer with streak & completion button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                  
                  {/* Streak flame badge */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0">
                    <Flame className={`w-4 h-4 ${habit.currentStreak > 0 ? 'fire-pulse text-amber-400' : 'text-slate-600'}`} />
                    <span>{habit.currentStreak} Day Streak</span>
                  </div>

                  {/* Complete Checkbox Button */}
                  <button
                    onClick={(e) => handleHabitClick(habit._id, e)}
                    className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 ${
                      habit.completedToday
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white border border-slate-700'
                    }`}
                  >
                    {habit.completedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Completed!
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" /> Complete (+50 XP)
                      </>
                    )}
                  </button>

                </div>

              </motion.div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
