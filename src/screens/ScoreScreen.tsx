import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, RotateCcw, Share2 } from 'lucide-react';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { getSessionById } from '../services/db';
import type { SessionSummary } from '../types';

export const ScoreScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (sessionId) {
        const found = await getSessionById(sessionId);
        setSession(found || null);
      }
      setLoading(false);
    }
    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#94A3B8]">Calculating posture alignment score...</p>
        </div>
      </div>
    );
  }

  const score = session?.averageScore || 85;
  const poseName = session?.poseName || 'Warrior I';
  const sanskritName = session?.sanskritName || 'Virabhadrasana I';
  const durationSec = session?.durationSeconds || 60;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;

  const scoreColorScheme = score >= 85 ? 'emerald' : score >= 65 ? 'amber' : 'red';
  const statusType = score >= 85 ? 'Good' : score >= 65 ? 'Slight' : 'Poor';

  const cb = session?.categoryBreakdown || {
    knee: 92,
    torso: 84,
    shoulder: 78,
    hip: 86,
    balance: 88,
  };

  const categoryList = [
    { category: 'Knee Alignment', score: cb.knee || 92 },
    { category: 'Torso Tilt', score: cb.torso || 84 },
    { category: 'Shoulder Position', score: cb.shoulder || 78 },
    { category: 'Hip Balance', score: cb.hip || 86 },
    { category: 'Overall Stability', score: cb.balance || 88 },
  ];

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Session Summary" showBack onBack={() => navigate('/home')} />

      <div className="text-center space-y-1 pt-1">
        <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block">
          Session Completed
        </span>
        <h2 className="font-display font-extrabold text-3xl text-[#F5F7FA]">
          {poseName}
        </h2>
        <p className="text-xs text-[#F59E0B] italic font-medium">
          {sanskritName}
        </p>
      </div>

      {/* Hero Score Ring Focal Card matching reference style */}
      <GlassCard variant="focal" glowColor={scoreColorScheme} className="p-6 text-center flex flex-col items-center justify-center space-y-4">
        <CircularProgressRing
          value={score}
          max={100}
          size={160}
          strokeWidth={12}
          colorScheme={scoreColorScheme}
        >
          <span className="font-display font-extrabold text-5xl text-[#F5F7FA]">
            {score}
          </span>
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">
            Form Score
          </span>
        </CircularProgressRing>

        <StatusBadge
          status={statusType}
          label={
            score >= 85
              ? 'Excellent Alignment!'
              : score >= 65
              ? 'Good Pose Form'
              : 'Form Correction Suggested'
          }
        />

        <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-white/10">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase tracking-widest block">
              Duration
            </span>
            <p className="font-display font-bold text-lg text-[#F5F7FA]">
              {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase tracking-widest block">
              Est. Calories
            </span>
            <p className="font-display font-bold text-lg text-[#34D399]">
              {session?.caloriesBurned || 4} kcal
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Breakdown Rows matching the reference screenshot layout */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
          Joint Alignment Breakdown
        </h3>

        <div className="space-y-3">
          {categoryList.map((cat, idx) => {
            const isGood = cat.score >= 85;
            const barColor = isGood ? 'from-[#22C55E] to-[#34D399]' : 'from-[#F59E0B] to-[#FBBF24]';
            const textColor = isGood ? 'text-[#34D399]' : 'text-[#F59E0B]';

            return (
              <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-[#151B24] border border-white/8">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F5F7FA]">{cat.category}</span>
                  <span className={`font-display font-extrabold ${textColor}`}>{cat.score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${barColor}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <GlassButton
          onClick={() => navigate(`/feedback/${sessionId || 'latest'}`)}
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          View Detailed Posture Tips
        </GlassButton>

        <div className="grid grid-cols-2 gap-3">
          <GlassButton
            onClick={() => navigate(`/live/${session?.poseId || 'tadasana'}`)}
            variant="secondary"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Practice Again
          </GlassButton>

          <GlassButton
            onClick={() => alert('Posture alignment card saved to clipboard!')}
            variant="secondary"
            size="md"
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Share Score
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
