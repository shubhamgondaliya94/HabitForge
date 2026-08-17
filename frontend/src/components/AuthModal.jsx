import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, LogIn, UserPlus } from 'lucide-react';
import { authAPI } from '../api';

const AVATARS = ['⚔️', '🛡️', '🧙‍♂️', '🧝‍♀️', '🐉', '⚡', '👑', '🔥'];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatar: '⚔️'
  });
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      let res;
      if (isLogin) {
        res = await authAPI.login({ email: formData.email, password: formData.password });
      } else {
        res = await authAPI.register(formData);
      }
      localStorage.setItem('habitforge_token', res.data.token);
      onAuthSuccess(res.data.user);
      onClose();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Authentication failed.');
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel p-6 md:p-8 max-w-md w-full relative border-purple-500/50"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-lg flex items-center justify-center">
              <Swords className="w-6 h-6 text-slate-950" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              {isLogin ? 'Enter the Habit Realm' : 'Forge Your Hero Identity'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin ? 'Sign in to sync your level, XP, and badges' : 'Register a new RPG account to start tracking'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Hero Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. ShadowKnight"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="hero@habitforge.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Select Avatar Emoji
                </label>
                <div className="flex gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: av })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center ${
                        formData.avatar === av ? 'bg-purple-600 border border-purple-300' : 'bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3 text-sm">
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isLogin ? 'Sign In to Realm' : 'Create Hero Account'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-400 hover:text-cyan-300 font-semibold"
            >
              {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in here"}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
