import React from 'react';
import { Award, Lock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { BADGE_CATALOG } from '../../../backend/services/gamificationService.js';

export default function BadgeShowcase({ user }) {
  const unlockedMap = {};
  (user?.badges || []).forEach(b => {
    unlockedMap[b.code] = b;
  });

  const unlockedCount = Object.keys(unlockedMap).length;
  const totalCount = BADGE_CATALOG.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      
      {/* Header & Trophy Bar */}
      <div className="glass-panel p-6 border-rose-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-rose-400" /> Hero Trophy Room & Badges
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Complete habit quests and hold active streaks to unlock legendary RPG achievements.
          </p>
        </div>

        {/* Progress pill */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 w-full md:w-64 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-rose-300">Badges Unlocked</span>
            <span className="text-amber-400">{unlockedCount} / {totalCount} ({progressPct}%)</span>
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {BADGE_CATALOG.map((badgeDef) => {
          const isUnlocked = !!unlockedMap[badgeDef.code];
          const unlockedData = unlockedMap[badgeDef.code];

          return (
            <div
              key={badgeDef.code}
              className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="text-4xl mb-3">{badgeDef.icon}</div>
              
              <h4 className="font-bold text-white text-sm mb-1">
                {badgeDef.name}
              </h4>
              
              <p className="text-[11px] text-slate-300 mb-3 leading-snug">
                {badgeDef.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-bold">
                {isUnlocked ? (
                  <span className="text-amber-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> LOCKED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
