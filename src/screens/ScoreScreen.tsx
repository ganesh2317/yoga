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
      <div className="min-h-screen bg-[#0C0D10] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#3F6B4F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A8A29B]">Calculating posture alignment score...</p>
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

  const scoreColorScheme = score >= 85 ? 'forest' : score >= 65 ? 'ochre' : 'rust';
  const statusType = score >= 85 ? 'Good' : score >= 65 ? 'Slight' : 'Poor';

  const cb = session?.categoryBreakdown || {
    knee: 92,
    torso: 84,
    shoulder: 78,
    hip: 86,
    balance: 88,
  };

  const categoryList = [
    { category: 'Knee', score: cb.knee || 90 },
    { category: 'Torso', score: cb.torso || 85 },
    { category: 'Shoulder', score: cb.shoulder || 80 },
    { category: 'Hip', score: cb.hip || 88 },
    { category: 'Balance', score: cb.balance || 86 },
  ];

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Session Summary" showBack onBack={() => navigate('/home')} />

      <div className="text-center space-y-1 pt-1">
        <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest block">
          Session Completed
        </span>
        <h2 className="font-serif font-extrabold text-3xl text-[#F4F1EC]">
          {poseName}
        </h2>
        <p className="text-xs text-[#C9A66B] italic font-medium">
          {sanskritName}
        </p>
      </div>

      {/* Hero Score Ring Focal Card */}
      <GlassCard variant="focal" glowColor={scoreColorScheme} className="p-6 text-center flex flex-col items-center justify-center space-y-4">
        <CircularProgressRing
          value={score}
          max={100}
          size={160}
          strokeWidth={12}
          colorScheme={scoreColorScheme}
        >
          <span className="font-serif font-extrabold text-5xl text-[#F4F1EC]">
            {score}
          </span>
          <span className="text-[10px] font-bold text-[#A8A29B] uppercase tracking-widest mt-0.5">
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
            <span className="text-[10px] text-[#635E58] uppercase tracking-widest block">
              Duration
            </span>
            <p className="font-serif font-bold text-lg text-[#F4F1EC]">
              {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-[#635E58] uppercase tracking-widest block">
              Est. Calories
            </span>
            <p className="font-serif font-bold text-lg text-[#88C49D]">
              {session?.caloriesBurned || 4} kcal
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Unboxed Category Alignment Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
          Joint Category Breakdown
        </h3>

        <div className="space-y-2.5">
          {categoryList.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F4F1EC]">{cat.category}</span>
                <span className="font-serif font-bold text-[#C9A66B]">{cat.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#3F6B4F] to-[#88C49D]"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
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
