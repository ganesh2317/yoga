import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { TopBar } from '../components/TopBar';
import { useSessionStore } from '../store/useSessionStore';

export const ProgressScreen: React.FC = () => {
  const { sessions, streak } = useSessionStore();

  const poseCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    poseCounts[s.poseName] = (poseCounts[s.poseName] || 0) + 1;
  });

  const poseChartData = Object.entries(poseCounts).map(([name, count]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    count,
  }));

  const timeChartData = sessions
    .slice(0, 10)
    .reverse()
    .map((s, idx) => ({
      index: `#${idx + 1}`,
      score: s.averageScore,
      duration: Math.round(s.durationSeconds / 60),
    }));

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.averageScore, 0) / sessions.length)
      : 85;

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-6">
      <TopBar title="Analytics & Progress" />

      {/* Asymmetric Header Metric Cards */}
      <div className="grid grid-cols-5 gap-3">
        <GlassCard variant="focal" className="col-span-3 p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest block">
            Average Score
          </span>
          <p className="font-display font-extrabold text-4xl text-accent-mint tracking-tight">
            {avgScore}
          </p>
          <span className="text-xs text-text-secondary block pt-1">
            Across {sessions.length} logged sessions
          </span>
        </GlassCard>

        {/* Unboxed side stat for contrast */}
        <div className="col-span-2 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
            Total Time
          </span>
          <div>
            <p className="font-display font-extrabold text-2xl text-accent-emerald">
              {streak.totalMinutes}<span className="text-xs text-text-secondary font-normal ml-0.5">m</span>
            </p>
            <span className="text-[11px] text-amber-300 font-semibold block mt-0.5">
              {streak.currentStreak}d streak
            </span>
          </div>
        </div>
      </div>

      {/* Main Score Trajectory Wide Area Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
            Score Trajectory (Last 10 Sessions)
          </h3>
          <span className="text-[11px] text-accent-emerald font-semibold">Live Trend</span>
        </div>

        <GlassCard className="p-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeChartData}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="index" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis domain={[40, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D131C',
                  borderColor: 'rgba(255,255,255,0.18)',
                  borderRadius: '14px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Pose Frequency Distribution Chart */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
          Pose Distribution Breakdown
        </h3>
        <GlassCard className="p-4 h-52">
          {poseChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
              Complete practice sessions to view pose distribution
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poseChartData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D131C',
                    borderColor: 'rgba(255,255,255,0.18)',
                    borderRadius: '14px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#34D399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
