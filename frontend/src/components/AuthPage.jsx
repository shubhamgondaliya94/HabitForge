import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, LogIn, UserPlus, Shield, Sparkles, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../api';

const AVATARS = ['⚔️', '🛡️', '🧙‍♂️', '🧝‍♀️', '🐉', '⚡', '👑', '🔥'];

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up
  const [formData, setFormData] = useState({
    username: '',
    emailOrUsername: '',
    email: '',
    password: '',
    avatar: '⚔️'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!isLogin) {
        // Step 1: SIGN UP (Register user in database)
        const res = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar
        });

        // Step 2: Redirect to Log In Page with pre-filled username/email & success message
        const registeredIdentifier = formData.username || formData.email;
        setSuccessMsg(`Account created successfully for "${formData.username}"! Please log in with your password below.`);
        setFormData(prev => ({
          ...prev,
          emailOrUsername: registeredIdentifier,
          password: ''
        }));
        setIsLogin(true); // Switch to Log In tab!

      } else {
        // Step 3: LOG IN (Authenticate user & enter dashboard)
        const loginIdentifier = formData.emailOrUsername || formData.email || formData.username;
        const res = await authAPI.login({
          identifier: loginIdentifier,
          password: formData.password
        });

        localStorage.setItem('habitforge_token', res.data.token);
        onAuthSuccess(res.data.user);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-darkBg text-slate-100 relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Swords className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-cinzel font-black text-2xl tracking-tight text-white flex items-center gap-1">
              HABIT<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400">FORGE</span>
            </span>
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest block -mt-1">
              GAMIFIED RPG HABIT TRACKER
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Hero Value Proposition */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 text-amber-300 text-xs font-extrabold rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> TURN DAILY RITUALS INTO LEGEND
          </span>

          <h1 className="font-cinzel text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Forge Your Destiny. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400">
              Level Up Your Life.
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed">
            Replace boring checklists with an RPG experience. Complete daily habits, accumulate XP, level up your hero avatar, and unlock rare achievement badges.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4.5 rounded-2xl bg-slate-900/70 border border-purple-500/30 flex items-start gap-3.5">
              <Shield className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Personal Hero Account</h4>
                <p className="text-xs text-slate-400 leading-snug">Your habits, streaks, and progress saved securely in MongoDB.</p>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900/70 border border-amber-500/30 flex items-start gap-3.5">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Streak Math & XP Engine</h4>
                <p className="text-xs text-slate-400 leading-snug">Automated date calculations award streak multipliers & level-ups.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card (Sign Up / Login) */}
        <div className="lg:col-span-5 w-full">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 md:p-8 border-purple-500/50 relative shadow-[0_0_60px_rgba(139,92,246,0.2)]"
          >
            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all ${
                  !isLogin
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Hero ID (Sign Up)
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all ${
                  isLogin
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Enter Realm (Log In)
              </button>
            </div>

            <h3 className="font-cinzel text-2xl font-black text-white text-center mb-1">
              {isLogin ? 'Welcome Back, Hero' : 'Create Your RPG Account'}
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6">
              {isLogin
                ? 'Enter your Username/Email and password to access your dashboard'
                : 'Sign up to create your hero ID, then log in to access your dashboard'}
            </p>

            {errorMsg && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold mb-4 text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold mb-4 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin ? (
                /* SIGN UP FIELDS */
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Hero Username *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DragonSlayer"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="hero@realm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                      Select Avatar Emoji
                    </label>
                    <div className="flex gap-2 justify-center">
                      {AVATARS.map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: av })}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                            formData.avatar === av ? 'bg-purple-600 border border-purple-300 scale-110' : 'bg-slate-900 border border-slate-800'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* LOG IN FIELDS */
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Username or Email Address *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your username or email"
                      value={formData.emailOrUsername}
                      onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm mt-2"
              >
                {loading ? (
                  'Processing...'
                ) : isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" /> Enter Realm & Launch Dashboard
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Register Hero Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Helper Link */}
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              {isLogin ? (
                <button
                  type="button"
                  onClick={() => handleTabSwitch(false)}
                  className="text-xs text-purple-300 hover:text-cyan-300 font-semibold"
                >
                  Need a new account? Create Hero ID here
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTabSwitch(true)}
                  className="text-xs text-purple-300 hover:text-cyan-300 font-semibold"
                >
                  Already registered? Click here to Log In
                </button>
              )}
            </div>

          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900 relative z-10">
        HabitForge — Gamified RPG Habit Tracker • Secured User Registration & Saved Data
      </footer>

    </div>
  );
}
