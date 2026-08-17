import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { Download, Crown, Calendar, TrendingUp, PieChart as PieIcon, Lock } from 'lucide-react';
import { completionAPI } from '../api';

const CATEGORY_COLORS = {
  health: '#06b6d4',
  fitness: '#ef4444',
  learning: '#f59e0b',
  mindfulness: '#8b5cf6',
  productivity: '#10b981',
  other: '#ec4899'
};

export default function AnalyticsView({ isPremium, onTogglePremium }) {
  const [heatmap, setHeatmap] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [heatmapRes, analyticsRes] = await Promise.all([
        completionAPI.getHeatmap(),
        completionAPI.getAnalytics()
      ]);
      setHeatmap(heatmapRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!isPremium) {
      alert('CSV Export is exclusive to Premium Heroes! Toggle your Premium status in the top bar to unlock.');
      return;
    }

    try {
      const response = await completionAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'habitforge_completion_history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export CSV: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading analytics & heatmap data...
      </div>
    );
  }

  const categoryData = (analytics?.categoryStats || []).map(item => ({
    name: item.category.toUpperCase(),
    value: item.count,
    color: CATEGORY_COLORS[item.category] || '#6366f1'
  }));

  return (
    <div className="space-y-8">
      
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-cyan-400" /> Mastery Analytics & Heatmaps
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track your 365-day consistency heat matrix and 30-day completion rate trends.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className={`btn-amber text-xs py-2.5 px-4 ${!isPremium ? 'opacity-80' : ''}`}
        >
          {isPremium ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isPremium ? 'Export CSV History' : 'Export CSV (Premium Only)'}
        </button>
      </div>

      {/* GitHub-style 365-Day Heatmap */}
      <div className="glass-panel p-6 border-purple-500/30 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> 365-Day Habit Consistency Heatmap
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm heat-0" />
            <div className="w-3 h-3 rounded-sm heat-1" />
            <div className="w-3 h-3 rounded-sm heat-2" />
            <div className="w-3 h-3 rounded-sm heat-3" />
            <div className="w-3 h-3 rounded-sm heat-4" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="heatmap-grid pt-2">
          {heatmap.map((day, idx) => (
            <div
              key={idx}
              title={`${day.date}: ${day.count} completion${day.count === 1 ? '' : 's'}`}
              className={`heatmap-cell heat-${day.intensity}`}
            />
          ))}
        </div>

        <div className="text-[11px] text-slate-400 text-right">
          Total completion events logged in past year: <strong className="text-cyan-300">{heatmap.reduce((a, c) => a + c.count, 0)}</strong>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 30-Day Completion Rate Line Chart */}
        <div className="lg:col-span-2 glass-panel p-6 border-cyan-500/30">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> 30-Day Completion Rate Trend (%)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.lineChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#06b6d4',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 7, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="glass-panel p-6 border-purple-500/30 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" /> Category Breakdown
          </h3>

          {categoryData.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-12">
              No habit category data available yet.
            </div>
          ) : (
            <>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#8b5cf6',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {categoryData.map(c => (
                  <div key={c.name} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-bold text-white">{c.value} Habit{c.value === 1 ? '' : 's'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
