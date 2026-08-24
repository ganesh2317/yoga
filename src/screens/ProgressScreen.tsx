import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { TopBar } from '../components/TopBar';
import { getAllSessions } from '../services/db';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionSummary } from '../types';

export const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { streak } = useSessionStore();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getAllSessions();
      setSessions(data);
    }
    load();
  }, []);

  const chartData = sessions.slice(0, 7).reverse().map((s) => ({
    date: s.dateString.slice(5),
    score: s.averageScore,
    duration: Math.round(s.durationSeconds / 60),
  }));

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.averageScore, 0) / sessions.length)
      : 85;

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Analytics & Progress" showBack onBack={() => navigate('/home')} />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest block">
          Practice Insights
        </span>
        <h2 className="font-serif font-extrabold text-3xl text-[#F4F1EC]">
          Analytics & Progress
        </h2>
        <p className="text-xs text-[#A8A29B]">
          Track posture form improvement over time.
        </p>
      </div>

      {/* Asymmetric Hero Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard variant="focal" glowColor="forest" className="p-4 text-center">
          <span className="text-[10px] font-bold text-[#635E58] uppercase tracking-widest block mb-1">
            Avg Score
          </span>
          <p className="font-serif font-extrabold text-3xl text-[#88C49D]">
            {avgScore}
          </p>
          <span className="text-[10px] text-[#A8A29B] font-medium mt-1 block">Form Rating</span>
        </GlassCard>

        <GlassCard variant="focal" glowColor="ochre" className="p-4 text-center">
          <span className="text-[10px] font-bold text-[#635E58] uppercase tracking-widest block mb-1">
            Streak
          </span>
          <p className="font-serif font-extrabold text-3xl text-[#C9A66B]">
            {streak.currentStreak}d
          </p>
          <span className="text-[10px] text-[#A8A29B] font-medium mt-1 block">Active Habit</span>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <span className="text-[10px] font-bold text-[#635E58] uppercase tracking-widest block mb-1">
            Sessions
          </span>
          <p className="font-serif font-extrabold text-3xl text-[#F4F1EC]">
            {streak.totalSessions}
          </p>
          <span className="text-[10px] text-[#A8A29B] font-medium mt-1 block">Total Logged</span>
        </GlassCard>
      </div>

      {/* Recharts Score Trend Card */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#88C49D] stroke-[1.5px]" />
            <h3 className="font-serif font-bold text-base text-[#F4F1EC]">
              Score Trend (Recent)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#C9A66B]">Last 7 Sessions</span>
        </div>

        <div className="h-44 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#635E58]">
              No practice data yet to chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F6B4F" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3F6B4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#635E58" fontSize={10} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#635E58" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#13151A',
                    borderColor: 'rgba(244,241,236,0.15)',
                    borderRadius: '12px',
                    color: '#F4F1EC',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#88C49D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      {/* Session Minutes Bar Chart */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C9A66B] stroke-[1.5px]" />
            <h3 className="font-serif font-bold text-base text-[#F4F1EC]">
              Practice Duration (Mins)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#A8A29B]">{streak.totalMinutes} total mins</span>
        </div>

        <div className="h-40 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#635E58]">
              No practice data yet to chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#635E58" fontSize={10} tickLine={false} />
                <YAxis stroke="#635E58" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#13151A',
                    borderColor: 'rgba(244,241,236,0.15)',
                    borderRadius: '12px',
                    color: '#F4F1EC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="duration" fill="#C9A66B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
