import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AnalyticsView from './components/AnalyticsView';
import LeaderboardView from './components/LeaderboardView';
import AiCoachView from './components/AiCoachView';
import BadgeShowcase from './components/BadgeShowcase';
import HabitModal from './components/HabitModal';
import LevelUpModal from './components/LevelUpModal';
import BadgeUnlockModal from './components/BadgeUnlockModal';
import AuthPage from './components/AuthPage';

import { authAPI, habitAPI, completionAPI, aiAPI } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [habits, setHabits] = useState([]);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [dailyQuest, setDailyQuest] = useState(null);

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, title: '' });

  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoadingApp(true);
      const token = localStorage.getItem('habitforge_token');
      if (token) {
        await refreshUserData();
        await fetchHabits();
        await fetchCoachSummary();
      }
    } catch (error) {
      console.error('App init error:', error);
      localStorage.removeItem('habitforge_token');
      setUser(null);
    } finally {
      setLoadingApp(false);
    }
  };

  const refreshUserData = async () => {
    const res = await authAPI.getProfile();
    setUser(res.data);
  };

  const fetchHabits = async () => {
    const res = await habitAPI.getHabits();
    setHabits(res.data);
  };

  const fetchCoachSummary = async () => {
    try {
      const res = await aiAPI.getCoach();
      setDailyQuote(res.data.quote);
      setDailyQuest(res.data.dailyQuest);
    } catch (e) {
      console.error('Failed to load coach summary:', e);
    }
  };

  // Called when user completes Sign Up or Login
  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    await fetchHabits();
    await fetchCoachSummary();
    setActiveTab('dashboard');
  };

  // Logout action
  const handleLogout = () => {
    localStorage.removeItem('habitforge_token');
    setUser(null);
    setHabits([]);
  };

  // Delete Account Action
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      `🚨 PERMANENT ACCOUNT DELETION WARNING 🚨\n\nAre you sure you want to permanently delete your account (${user?.username})?\n\nThis will automatically and permanently delete:\n- Your User Profile & Avatar\n- All your Habits & Categories\n- All your Streaks & Time-Series Completion Logs\n- Your XP, Level & Badges\n\nThis action cannot be undone!`
    );

    if (!confirmDelete) return;

    try {
      const res = await authAPI.deleteAccount();
      localStorage.removeItem('habitforge_token');
      setUser(null);
      setHabits([]);
      alert(res.data.message || 'Your account and all associated MongoDB data have been permanently deleted.');
    } catch (error) {
      alert('Failed to delete account: ' + (error.response?.data?.message || error.message));
    }
  };

  // Toggle habit completion with gamification pipeline
  const handleToggleHabit = async (habitId) => {
    try {
      const res = await completionAPI.toggle(habitId);
      const data = res.data;

      // Update habit item in local state
      setHabits(prev => prev.map(h => h._id === habitId ? { ...data.habit, completedToday: data.action === 'completed' } : h));

      // Update user state
      if (data.user) {
        setUser(prev => ({ ...prev, ...data.user }));
      }

      // Check level-up celebration
      if (data.isLevelUp) {
        setLevelUpData({ level: data.newLevel, title: data.user.title });
        setIsLevelUpOpen(true);
      }

      // Check new badge unlocks
      if (data.newBadges && data.newBadges.length > 0) {
        setUnlockedBadge(data.newBadges[0]);
        setIsBadgeModalOpen(true);
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  // Create or Update Habit & Store in MongoDB Atlas 'habit_info' collection
  const handleHabitSubmit = async (formData) => {
    try {
      if (habitToEdit) {
        const res = await habitAPI.updateHabit(habitToEdit._id, formData);
        setHabits(prev => prev.map(h => h._id === habitToEdit._id ? res.data : h));
      } else {
        const res = await habitAPI.createHabit(formData);
        if (res.data) {
          setHabits(prev => [res.data, ...prev]);
        }
      }
      setIsHabitModalOpen(false);
      setHabitToEdit(null);
      await fetchHabits();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error saving habit to MongoDB.';
      alert(msg);
      throw error;
    }
  };

  // Delete Habit
  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit quest?')) return;
    try {
      await habitAPI.deleteHabit(habitId);
      await fetchHabits();
    } catch (error) {
      alert('Error deleting habit: ' + (error.response?.data?.message || error.message));
    }
  };

  // Toggle Premium Status
  const handleTogglePremium = async () => {
    try {
      const res = await authAPI.togglePremium();
      setUser(prev => ({ ...prev, isPremium: res.data.isPremium }));
    } catch (error) {
      console.error('Error toggling premium:', error);
    }
  };

  // Add 1-click suggested habit from AI Coach
  const handleAddSuggestedHabit = async (suggested) => {
    try {
      const res = await habitAPI.createHabit(suggested);
      if (res.data) {
        setHabits(prev => [res.data, ...prev]);
      }
      await fetchHabits();
      setActiveTab('dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Error importing habit.';
      alert(msg);
    }
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-slate-300">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-extrabold uppercase tracking-widest text-purple-400">
            Initializing HabitForge Realm...
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render dedicated Sign Up / Login Landing Page!
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Render Authenticated User's Personal Dashboard
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAddHabit={() => { setHabitToEdit(null); setIsHabitModalOpen(true); }}
        onTogglePremium={handleTogglePremium}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onOpenAddHabit={() => { setHabitToEdit(null); setIsHabitModalOpen(true); }}
            onEditHabit={(h) => { setHabitToEdit(h); setIsHabitModalOpen(true); }}
            onDeleteHabit={handleDeleteHabit}
            dailyQuote={dailyQuote}
            dailyQuest={dailyQuest}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            isPremium={user?.isPremium}
            onTogglePremium={handleTogglePremium}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            currentUser={user}
            onUpdateUser={refreshUserData}
          />
        )}

        {activeTab === 'coach' && (
          <AiCoachView
            onAddSuggestedHabit={handleAddSuggestedHabit}
          />
        )}

        {activeTab === 'badges' && (
          <BadgeShowcase
            user={user}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        HabitForge RPG — Logged in as <strong className="text-purple-300">{user.username}</strong> ({user.email})
      </footer>

      {/* Modals */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => { setIsHabitModalOpen(false); setHabitToEdit(null); }}
        onSubmit={handleHabitSubmit}
        habitToEdit={habitToEdit}
        isPremium={user?.isPremium}
      />

      <LevelUpModal
        isOpen={isLevelUpOpen}
        onClose={() => setIsLevelUpOpen(false)}
        newLevel={levelUpData.level}
        newTitle={levelUpData.title}
      />

      <BadgeUnlockModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        badge={unlockedBadge}
      />

    </div>
  );
}
