import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LevelUpModal({ isOpen, onClose, newLevel, newTitle }) {
  useEffect(() => {
    if (isOpen) {
      // Trigger canvas-confetti particle explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981']
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="glass-panel p-8 max-w-md w-full text-center relative border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)]"
          style={{ background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-xs tracking-widest uppercase rounded-full border border-amber-500/40 mb-2">
            LEVEL UP UNLOCKED!
          </span>

          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-300 to-cyan-400 mb-2">
            HERO LEVEL {newLevel}!
          </h2>

          <p className="text-purple-200 text-sm mb-4">
            Your discipline has forged a new rank in the realm of HabitForge!
          </p>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-purple-500/30 mb-6 flex items-center justify-center gap-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">New Player Title</div>
              <div className="text-lg font-bold text-amber-300">{newTitle}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-amber w-full justify-center py-3 text-base"
          >
            Claim Rewards & Continue <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
