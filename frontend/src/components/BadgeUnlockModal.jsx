import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2 } from 'lucide-react';

export default function BadgeUnlockModal({ isOpen, onClose, badge }) {
  useEffect(() => {
    if (isOpen && badge) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', damping: 18 }}
          className="glass-panel p-8 max-w-sm w-full text-center relative border-2 border-purple-500/50 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
          style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)' }}
        >
          <div className="text-6xl mb-3 animate-pulse">{badge.icon || '🏅'}</div>

          <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 font-extrabold text-xs tracking-widest uppercase rounded-full border border-purple-500/40 mb-2">
            NEW BADGE UNLOCKED!
          </span>

          <h3 className="text-2xl font-bold text-white mb-2">{badge.name}</h3>

          <p className="text-slate-300 text-sm mb-6">{badge.description}</p>

          <button
            onClick={onClose}
            className="btn-primary w-full justify-center py-2.5 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> Equip Badge & Dismiss
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
