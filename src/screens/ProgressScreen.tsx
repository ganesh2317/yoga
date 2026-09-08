import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { TopBar } from '../components/TopBar';
import { getAllSessions, getUserSessions } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionSummary } from '../types';

export const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { streak } = useSessionStore();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const data = await getUserSessions(user.id);
        setSessions(data);
      } else {
        const data = await getAllSessions();
        setSessions(data);
      }
    }
    load();
  }, [user]);

  const chartData = sessions.slice(0, 7).reverse().map((s) => ({
    date: s.dateString ? s.dateString.slice(5) : (s.timestamp ? s.timestamp.slice(5, 10) : 'Today'),
    score: s.averageScore,
    accuracy: s.accuracyPercent !== undefined ? s.accuracyPercent : null,
    duration: Math.round(s.durationSeconds / 60),
  }));

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.averageScore, 0) / sessions.length)
      : 85;

  const validAccuracySessions = sessions.filter((s) => s.accuracyPercent !== undefined);
  const avgAccuracy =
    validAccuracySessions.length > 0
      ? Math.round(validAccuracySessions.reduce((acc, s) => acc + (s.accuracyPercent || 0), 0) / validAccuracySessions.length)
      : null;

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Analytics & Progress" showBack onBack={() => navigate('/home')} />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block">
          Practice Insights
        </span>
        <h2 className="font-display font-extrabold text-3xl text-[#F5F7FA]">
          Analytics & Progress
        </h2>
        <p className="text-xs text-[#94A3B8]">
          Track posture alignment and time-in-position accuracy trends.
        </p>
      </div>

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-4 gap-2">
        <GlassCard variant="focal" glowColor="emerald" className="p-3 text-center">
          <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest block mb-1">
            Alignment
          </span>
          <p className="font-display font-extrabold text-2xl text-[#34D399]">
            {avgScore}
          </p>
          <span className="text-[9px] text-[#94A3B8] font-medium mt-0.5 block">Avg Rating</span>
        </GlassCard>

        <GlassCard variant="focal" glowColor="amber" className="p-3 text-center">
          <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest block mb-1">
            Accuracy
          </span>
          <p className="font-display font-extrabold text-2xl text-[#F59E0B]">
            {avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
          </p>
          <span className="text-[9px] text-[#94A3B8] font-medium mt-0.5 block">In Position</span>
        </GlassCard>

        <GlassCard className="p-3 text-center">
          <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest block mb-1">
            Streak
          </span>
          <p className="font-display font-extrabold text-2xl text-[#F5F7FA]">
            {streak.currentStreak}d
          </p>
          <span className="text-[9px] text-[#94A3B8] font-medium mt-0.5 block">Active Habit</span>
        </GlassCard>

        <GlassCard className="p-3 text-center">
          <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest block mb-1">
            Sessions
          </span>
          <p className="font-display font-extrabold text-2xl text-[#F5F7FA]">
            {streak.totalSessions}
          </p>
          <span className="text-[9px] text-[#94A3B8] font-medium mt-0.5 block">Total Logged</span>
        </GlassCard>
      </div>

      {/* Recharts Score & Accuracy Trend Card */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#34D399] stroke-[1.75px]" />
            <h3 className="font-display font-bold text-base text-[#F5F7FA]">
              Alignment vs Accuracy Trend
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#F59E0B]">Last 7 Sessions</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold px-1">
          <div className="flex items-center gap-1.5 text-[#34D399]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
            <span>Alignment (Score)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#F59E0B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>Accuracy (% Time)</span>
          </div>
        </div>

        <div className="h-44 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
              No practice data yet to chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1620',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#F5F7FA',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Alignment Score"
                  stroke="#34D399"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Time Accuracy %"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#accGrad)"
                  connectNulls
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
            <Calendar className="w-4 h-4 text-[#F59E0B] stroke-[1.75px]" />
            <h3 className="font-display font-bold text-base text-[#F5F7FA]">
              Practice Duration (Mins)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#94A3B8]">{streak.totalMinutes} total mins</span>
        </div>

        <div className="h-40 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
              No practice data yet to chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1620',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#F5F7FA',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="duration" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
