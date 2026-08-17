import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, LayoutDashboard, BarChart3, Trophy, Bot, Award, 
  Plus, LogOut, Crown, Trash2, Menu, X, Sparkles 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenAddHabit, 
  onTogglePremium, 
  onLogout, 
  onDeleteAccount 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  
  // XP progress inside level formula
  const currentLevelBaseXP = Math.pow((currentLevel - 1) / 0.4, 2);
  const nextLevelBaseXP = Math.pow(currentLevel / 0.4, 2);
  const xpInCurrentLevel = Math.max(0, currentXP - currentLevelBaseXP);
  const xpNeededForNext = Math.max(1, nextLevelBaseXP - currentLevelBaseXP);
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-purple-500/20 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand logo & title */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Swords className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-cinzel font-black text-xl md:text-2xl tracking-tight text-white flex items-center gap-1">
              HABIT<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400">FORGE</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-purple-300 font-bold uppercase tracking-widest block -mt-1">
              RPG HABIT TRACKER
            </span>
          </div>
        </div>

        {/* Center Nav tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-sm font-semibold">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

          <button
            onClick={() => handleNavClick('analytics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>

          <button
            onClick={() => handleNavClick('leaderboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>

          <button
            onClick={() => handleNavClick('coach')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'coach'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4" /> AI Coach
          </button>

          <button
            onClick={() => handleNavClick('badges')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'badges'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" /> Badges
          </button>
        </nav>

        {/* Right side Controls (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Add Habit desktop button */}
          <button 
            onClick={onOpenAddHabit}
            className="btn-cyan py-2 px-4 text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> New Habit
          </button>

          {/* Premium Tier Toggle Pill */}
          <button
            onClick={onTogglePremium}
            title="Toggle Free / Premium Tier"
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              user?.isPremium
                ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${user?.isPremium ? 'text-amber-400' : 'text-slate-500'}`} />
            {user?.isPremium ? 'PREMIUM' : 'FREE TIER'}
          </button>

          {/* Player Profile Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-purple-500/30 p-1.5 pr-3 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center text-sm">
              {user?.avatar || '⚔️'}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {user?.username || 'Hero Player'}
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 rounded">Lvl {currentLevel}</span>
              </div>
              <div className="text-[10px] text-purple-300 font-medium">
                {currentXP} XP ({levelProgressPct}%)
              </div>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors"
              title="Log Out Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Delete Account Button */}
          {onDeleteAccount && (
            <button
              onClick={onDeleteAccount}
              className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-xl border border-rose-900/50 transition-colors"
              title="Permanently Delete Account & MongoDB Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Mobile Action Controls (Mobile < 1024px) */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Quick Add Habit button mobile */}
          <button 
            onClick={onOpenAddHabit}
            className="btn-cyan py-1.5 px-3 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Habit
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-purple-500/40 text-purple-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-purple-500/20 mt-3 pt-3 space-y-3"
          >
            {/* Player Info Summary Card Mobile */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xl">
                  {user?.avatar || '⚔️'}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-2">
                    {user?.username}
                    <span className="text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      Lvl {currentLevel}
                    </span>
                  </div>
                  <div className="text-xs text-purple-300">
                    {currentXP} Total XP • {user?.title}
                  </div>
                </div>
              </div>

              <button
                onClick={onTogglePremium}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  user?.isPremium
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {user?.isPremium ? 'PRO' : 'FREE'}
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-500/60'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" /> Dashboard
              </button>

              <button
                onClick={() => handleNavClick('analytics')}
                className={`p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-cyan-600/40 text-cyan-200 border border-cyan-500/60'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Analytics
              </button>

              <button
                onClick={() => handleNavClick('leaderboard')}
                className={`p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-amber-600/40 text-amber-200 border border-amber-500/60'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
              </button>

              <button
                onClick={() => handleNavClick('coach')}
                className={`p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'coach'
                    ? 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/60'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}
              >
                <Bot className="w-4 h-4 text-emerald-400" /> AI Coach
              </button>

              <button
                onClick={() => handleNavClick('badges')}
                className={`p-3 rounded-xl col-span-2 flex items-center justify-center gap-2.5 transition-all ${
                  activeTab === 'badges'
                    ? 'bg-rose-600/40 text-rose-200 border border-rose-500/60'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}
              >
                <Award className="w-4 h-4 text-rose-400" /> Badges & Trophies
              </button>
            </div>

            {/* Mobile Account Actions (Logout & Delete Account) */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-900">
              {onLogout && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4 text-cyan-400" /> Log Out
                </button>
              )}

              {onDeleteAccount && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onDeleteAccount(); }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-900/60"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" /> Delete Account
                </button>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
