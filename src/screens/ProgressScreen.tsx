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

  // Pose frequency distribution
  const poseCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    poseCounts[s.poseName] = (poseCounts[s.poseName] || 0) + 1;
  });

  const poseChartData = Object.entries(poseCounts).map(([name, count]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    count,
  }));

  // Score progress over time
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
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Analytics & Progress" />

      {/* Progress Metric Highlights */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
            Average Score
          </span>
          <p className="font-display font-extrabold text-3xl text-accent-mint">{avgScore}</p>
          <span className="text-[11px] text-text-secondary">Across {sessions.length} sessions</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
            Total Practice
          </span>
          <p className="font-display font-extrabold text-3xl text-accent-emerald">
            {streak.totalMinutes} <span className="text-sm font-normal text-text-secondary">min</span>
          </p>
          <span className="text-[11px] text-text-secondary">{streak.currentStreak} day streak</span>
        </GlassCard>
      </div>

      {/* Score Progress Trend Graph */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Score Trajectory
        </h3>
        <GlassCard className="p-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeChartData}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="index" stroke="#5B6472" fontSize={11} tickLine={false} />
              <YAxis domain={[40, 100]} stroke="#5B6472" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1620',
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#F5F7FA',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#22C55E"
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
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Pose Frequency Distribution
        </h3>
        <GlassCard className="p-4 h-52">
          {poseChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
              Complete sessions to view pose frequency breakdown
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poseChartData}>
                <XAxis dataKey="name" stroke="#5B6472" fontSize={10} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#5B6472" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1620',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#F5F7FA',
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
