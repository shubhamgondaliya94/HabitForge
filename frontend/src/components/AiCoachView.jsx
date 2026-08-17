import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Plus, Check, Lightbulb, Zap, ShieldCheck } from 'lucide-react';
import { aiAPI } from '../api';

export default function AiCoachView({ onAddSuggestedHabit }) {
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const res = await aiAPI.getCoach();
      setCoachData(res.data);
    } catch (error) {
      console.error('Failed to load AI coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (rec, index) => {
    if (rec.suggestedHabit && onAddSuggestedHabit) {
      onAddSuggestedHabit(rec.suggestedHabit);
      setAddedIds(prev => ({ ...prev, [index]: true }));
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Consulting Master Forge AI Coach...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Hero Coach Header */}
      <div className="glass-panel p-6 md:p-8 border-emerald-500/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-cyan-500 to-purple-600 p-1 shadow-[0_0_25px_rgba(16,185,129,0.4)] shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase rounded-full border border-emerald-500/40">
                AI HABIT COACH ENGINE
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              Master Forge Intelligence
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              Analyzing your current completion rates, active streaks, and habit balance to provide tailored micro-optimizations and habit stacking strategies.
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" /> Personalized Quest Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coachData?.recommendations?.map((rec, idx) => (
            <div key={idx} className="glass-panel p-5 border-emerald-500/30 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" /> {rec.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              {rec.suggestedHabit && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <span className="text-lg">{rec.suggestedHabit.icon}</span>
                    <span>{rec.suggestedHabit.name}</span>
                  </div>

                  <button
                    onClick={() => handleImport(rec, idx)}
                    disabled={addedIds[idx]}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      addedIds[idx]
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'btn-cyan py-1.5 px-3'
                    }`}
                  >
                    {addedIds[idx] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added to Quests
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> 1-Click Import
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
