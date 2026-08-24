import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowRight, Award } from 'lucide-react';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { getSessionById } from '../services/db';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionSummary } from '../types';

export const ScoreScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions } = useSessionStore();
  const [session, setSession] = useState<SessionSummary | null>(null);

  useEffect(() => {
    async function load() {
      if (sessionId) {
        const found = await getSessionById(sessionId);
        if (found) {
          setSession(found);
        } else if (sessions.length > 0) {
          setSession(sessions[0]);
        }
      }
    }
    load();
  }, [sessionId, sessions]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg-darkest text-text-primary">
        <GlassCard className="p-6 text-center space-y-4 max-w-sm">
          <p className="text-sm text-text-secondary">Loading session score data...</p>
          <GlassButton onClick={() => navigate('/home')} variant="primary" fullWidth>
            Return to Dashboard
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const { averageScore, poseName, sanskritName, categoryBreakdown } = session;

  const scoreLabel =
    averageScore >= 88 ? 'Great Form!' : averageScore >= 75 ? 'Good Alignment' : 'Needs Practice';
  const colorScheme = averageScore >= 85 ? 'sage' : averageScore >= 65 ? 'amber' : 'red';

  const last7Data = sessions.slice(0, 7).reverse().map((s, idx) => ({
    name: `S${idx + 1}`,
    score: s.averageScore,
    pose: s.poseName,
  }));

  const BREAKDOWN_ITEMS = [
    { label: 'Shoulder Alignment', score: categoryBreakdown.shoulder },
    { label: 'Hip Level & Rotation', score: categoryBreakdown.hip },
    { label: 'Knee Extension & Track', score: categoryBreakdown.knee },
    { label: 'Torso & Spine Line', score: categoryBreakdown.torso },
    { label: 'Symmetry & Balance', score: categoryBreakdown.balance },
  ];

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Posture Score" showBack onBack={() => navigate('/home')} />

      {/* Main Score Hero Card */}
      <GlassCard variant="focal" glowColor={colorScheme} className="p-6 text-center relative space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-text-secondary border border-white/15">
          <Award className="w-4 h-4 text-accent-emerald" />
          <span>{poseName} ({sanskritName})</span>
        </div>

        <div className="flex justify-center my-2">
          <CircularProgressRing
            value={averageScore}
            size={160}
            strokeWidth={12}
            colorScheme={colorScheme}
          >
            <div className="flex flex-col items-center">
              <AnimatedNumber
                value={averageScore}
                className="font-display font-extrabold text-4xl text-accent-mint tracking-tight"
              />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                Score / 100
              </span>
            </div>
          </CircularProgressRing>
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-3xl text-text-primary tracking-tight">
            {scoreLabel}
          </h2>
          <p className="text-xs text-text-secondary">
            Session completed • {Math.round(session.durationSeconds)}s duration
          </p>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-3">
          <StatusBadge
            status={averageScore >= 85 ? 'Good' : averageScore >= 65 ? 'Slight' : 'Poor'}
          />
          <span className="text-xs text-text-tertiary">
            Burned ~{session.caloriesBurned} kcal
          </span>
        </div>
      </GlassCard>

      {/* Category Breakdown Bars */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
          Alignment Breakdown
        </h3>
        <GlassCard className="p-4 space-y-3.5">
          {BREAKDOWN_ITEMS.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary">{item.label}</span>
                <span className="font-bold text-accent-emerald">{item.score}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.score >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : item.score >= 65
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Score Trend (Last 7 Sessions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
            Score Trend (Last 7 Sessions)
          </h3>
          <span className="text-[11px] text-text-tertiary">Recent progress</span>
        </div>

        <GlassCard className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Data}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D131C',
                  borderColor: 'rgba(255,255,255,0.18)',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#34D399', r: 5 }}
                activeDot={{ r: 8, fill: '#6EE7B7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* CTA Button to Feedback */}
      <div className="pt-2">
        <GlassButton
          onClick={() => navigate(`/feedback/${session.id}`)}
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          View Personalized AI Feedback
        </GlassButton>
      </div>
    </div>
  );
};
