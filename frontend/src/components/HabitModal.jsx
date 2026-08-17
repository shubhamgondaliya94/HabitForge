import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  { id: 'health', name: '💧 Health & Hydration' },
  { id: 'fitness', name: '🏋️‍♂️ Fitness & Sports' },
  { id: 'learning', name: '📚 Learning & Reading' },
  { id: 'mindfulness', name: '🧘 Mindfulness & Zen' },
  { id: 'productivity', name: '💻 Work & Coding' },
  { id: 'other', name: '⭐ General Quest' }
];

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1'];
const ICONS = ['💧', '📚', '🏋️‍♂️', '🧘', '💻', '🏃', '🥗', '😴', '⭐', '⚡', '🛡️', '⚔️'];

export default function HabitModal({ isOpen, onClose, onSubmit, habitToEdit, isPremium }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    color: '#8b5cf6',
    icon: '💧',
    frequency: 'daily'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setFormData({
        name: habitToEdit.name || '',
        description: habitToEdit.description || '',
        category: habitToEdit.category || 'health',
        color: habitToEdit.color || '#8b5cf6',
        icon: habitToEdit.icon || '💧',
        frequency: habitToEdit.frequency || 'daily'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'health',
        color: '#8b5cf6',
        icon: '💧',
        frequency: 'daily'
      });
    }
    setErrorMsg('');
    setIsSubmitting(false);
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      setErrorMsg('Habit name is required.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit(formData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save habit quest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-panel p-6 md:p-8 max-w-lg w-full relative border-purple-500/50"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="font-cinzel text-2xl font-black text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {habitToEdit ? 'Edit RPG Quest' : 'Forge New Habit Quest'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Set up daily goals to gain XP, increase your level, and unlock achievement badges saved directly in MongoDB.
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Habit Quest Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Drink 2L Fresh Water"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Quest Objective / Note
              </label>
              <input
                type="text"
                placeholder="e.g. 8 full glasses throughout the workday"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Category & Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="daily">Daily Habit</option>
                  <option value="weekly">Weekly Target</option>
                </select>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Choose Icon Emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(icon => (
                  <button
                    type="button"
                    key={icon}
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      formData.icon === icon
                        ? 'bg-purple-600/40 border-2 border-purple-400 scale-110'
                        : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Tag Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Color Tag
              </label>
              <div className="flex gap-3">
                {COLORS.map(color => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      formData.color === color ? 'ring-4 ring-white/50 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary py-2.5 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2.5 px-6 text-xs"
              >
                {isSubmitting ? 'Saving to Database...' : (habitToEdit ? 'Save Changes' : 'Forge Habit Quest')}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
