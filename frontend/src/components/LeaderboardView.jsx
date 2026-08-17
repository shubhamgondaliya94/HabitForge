import React, { useState, useEffect } from 'react';
import { Trophy, UserPlus, Users, Globe, Shield, Sparkles, Search } from 'lucide-react';
import { leaderboardAPI, authAPI } from '../api';

export default function LeaderboardView({ currentUser, onUpdateUser }) {
  const [scope, setScope] = useState('global'); // 'global' or 'friends'
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [friendMsg, setFriendMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await leaderboardAPI.getLeaderboard(scope);
      setLeaderboard(res.data.data || res.data);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendUsernameInput.trim()) return;
    try {
      const res = await authAPI.addFriend(friendUsernameInput.trim());
      setFriendMsg({ type: 'success', text: res.data.message });
      setFriendUsernameInput('');
      fetchLeaderboard();
      if (onUpdateUser) onUpdateUser();
    } catch (error) {
      setFriendMsg({
        type: 'error',
        text: error.response?.data?.message || 'Error adding friend.'
      });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" /> Hero Realm Leaderboard
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Compare weekly and total XP rankings against fellow habit adventurers.
          </p>
        </div>

        {/* Global vs Friends toggle */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setScope('global')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              scope === 'global'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Global Ranking
          </button>
          <button
            onClick={() => setScope('friends')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              scope === 'friends'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Friends Circle
          </button>
        </div>
      </div>

      {/* Add Friend Form Bar */}
      <div className="glass-panel p-4 border-amber-500/30">
        <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter hero username to send friend invite (e.g. ValkyrieAura)..."
              value={friendUsernameInput}
              onChange={(e) => setFriendUsernameInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <button type="submit" className="btn-amber text-xs py-2.5 px-5 w-full sm:w-auto justify-center">
            <UserPlus className="w-4 h-4" /> Add Friend
          </button>
        </form>

        {friendMsg.text && (
          <div className={`mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg ${
            friendMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {friendMsg.text}
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel overflow-hidden border-purple-500/30">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading realm rankings...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No heroes found in this ranking view. Add friends to populate your circle!
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-6">Rank</th>
                  <th className="py-3.5 px-6">Hero Adventurer</th>
                  <th className="py-3.5 px-6">Level</th>
                  <th className="py-3.5 px-6">Badges</th>
                  <th className="py-3.5 px-6 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {leaderboard.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      user.isCurrentUser
                        ? 'bg-purple-950/40 font-bold border-l-4 border-l-purple-500'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-4 px-6 font-black text-sm">
                      {user.rankDisplay}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                          {user.avatar || '⚔️'}
                        </div>
                        <div>
                          <div className="font-extrabold text-white flex items-center gap-2">
                            {user.username}
                            {user.isCurrentUser && (
                              <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/40">
                                YOU
                              </span>
                            )}
                            {user.isPremium && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-black">
                                PRO
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-amber-400 font-semibold">
                            {user.title}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold">
                        Lvl {user.level}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-300">
                      🏆 {user.badgeCount} Badges
                    </td>

                    <td className="py-4 px-6 text-right font-black text-sm text-cyan-400">
                      {user.xp} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-slate-800">
              <button
                onClick={() => leaderboardAPI.getLeaderboard(scope, pagination.page - 1).then(r => {
                  setLeaderboard(r.data.data || r.data);
                  setPagination(r.data.pagination || null);
                })}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => leaderboardAPI.getLeaderboard(scope, pagination.page + 1).then(r => {
                  setLeaderboard(r.data.data || r.data);
                  setPagination(r.data.pagination || null);
                })}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>

    </div>
  );
}
