import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, Home } from 'lucide-react';
import { BodySkeletonDiagram } from '../components/BodySkeletonDiagram';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { getSessionById } from '../services/db';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionSummary } from '../types';

export const FeedbackScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions } = useSessionStore();

  const [session, setSession] = useState<SessionSummary | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);

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

  // Clean up TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg-darkest text-text-primary">
        <GlassCard className="p-6 text-center space-y-4 max-w-sm">
          <p className="text-sm text-text-secondary">Loading session feedback...</p>
          <GlassButton onClick={() => navigate('/home')} variant="primary" fullWidth>
            Return to Dashboard
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const { poseName, sanskritName, jointEvaluations, feedbackTips, durationSeconds, caloriesBurned, averageScore } = session;

  // Web Speech API Text-To-Speech handler
  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
    } else {
      const speechText = `Feedback for your ${poseName} session. Overall score is ${averageScore} out of 100. ${feedbackTips.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.95; // Natural speed
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);

      window.speechSynthesis.cancel(); // cancel any previous speech
      window.speechSynthesis.speak(utterance);
      setIsPlayingTTS(true);
    }
  };

  const jointList = Object.values(jointEvaluations || {});

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Personalized Feedback" showBack onBack={() => navigate('/home')} />

      {/* Header Overview Card */}
      <GlassCard variant="glow" glowColor="green" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-mint uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> AI Feedback Analysis
            </span>
            <h2 className="font-display font-extrabold text-2xl text-text-primary">
              {poseName}
            </h2>
            <p className="text-xs text-accent-emerald font-medium italic">
              {sanskritName}
            </p>
          </div>

          <GlassButton
            onClick={handleToggleTTS}
            variant={isPlayingTTS ? 'primary' : 'secondary'}
            size="sm"
            className="rounded-full shadow-lg shrink-0"
            leftIcon={isPlayingTTS ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent-emerald" />}
          >
            {isPlayingTTS ? 'Mute Speech' : 'Listen'}
          </GlassButton>
        </div>

        {/* Quick Session Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-[10px] text-text-tertiary block">Score</span>
            <span className="font-display font-bold text-lg text-accent-mint">{averageScore}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-[10px] text-text-tertiary block">Duration</span>
            <span className="font-display font-bold text-lg text-text-primary">{Math.round(durationSeconds)}s</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-[10px] text-text-tertiary block">Calories</span>
            <span className="font-display font-bold text-lg text-amber-300">~{caloriesBurned} kcal</span>
          </div>
        </div>
      </GlassCard>

      {/* Body Skeleton Diagram */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Joint Alignment Map
        </h3>
        <BodySkeletonDiagram jointEvaluations={jointEvaluations} />
      </div>

      {/* Plain-English Tips List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Corrective Tips & Encouragement
        </h3>
        <div className="space-y-2.5">
          {feedbackTips.map((tip, index) => (
            <GlassCard
              key={index}
              className="p-3.5 flex items-start gap-3 border-accent-green/20"
            >
              <div className="w-7 h-7 rounded-xl bg-accent-green/20 border border-accent-green/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-xs text-text-primary leading-relaxed font-medium">
                {tip}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Joint Angle Details List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Detailed Joint Measurements
        </h3>
        <GlassCard className="p-4 divide-y divide-white/10">
          {jointList.length === 0 ? (
            <p className="text-xs text-text-tertiary text-center py-2">
              No individual joint deviations recorded.
            </p>
          ) : (
            jointList.map((j) => (
              <div key={j.jointKey} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block">{j.displayName}</span>
                  <span className="text-[11px] text-text-tertiary">
                    Target: {j.targetAngle}° (±{j.tolerance}°) • Actual: {j.actualAngle}°
                  </span>
                </div>
                <StatusBadge status={j.status} size="sm" />
              </div>
            ))
          )}
        </GlassCard>
      </div>

      {/* Finish Session CTA */}
      <div className="pt-2">
        <GlassButton
          onClick={() => navigate('/home')}
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Home className="w-5 h-5" />}
        >
          Finish Session & Return Home
        </GlassButton>
      </div>
    </div>
  );
};
