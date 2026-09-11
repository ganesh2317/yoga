import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Volume2, VolumeX, CheckCircle2, Home, ArrowLeft } from 'lucide-react';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { TopBar } from '../components/TopBar';
import { getAllSessions, getSessionById, getUserSessions } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import type { JointEvaluation, SessionSummary } from '../types';

export const FeedbackScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function load() {
      let found: SessionSummary | undefined = undefined;
      if (sessionId && sessionId !== 'latest') {
        found = await getSessionById(sessionId);
      }
      if (!found && user?.id) {
        const userSessions = await getUserSessions(user.id);
        found = userSessions[0];
      }
      if (!found) {
        const all = await getAllSessions();
        found = all[0];
      }
      setSession(found || null);
    }
    load();
  }, [sessionId, user]);

  const tips = session?.feedbackTips || [
    'Great overall stability in your core and posture alignment!',
    'Softly roll your shoulders back and down to keep your chest open.',
    'Keep your standing foot firmly grounded through all four corners.',
  ];

  const jointList: JointEvaluation[] = Object.values(session?.jointEvaluations || {});

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = tips.join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      <TopBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="accent" size="md">
            Biomechanical Diagnostics
          </Badge>
          <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
            Joint Form Breakdown
          </h1>
          {session && (
            <p className="text-sm text-text-muted">
              {session.poseName} • {session.averageScore}/100 Average Score
            </p>
          )}
        </div>

        <Button variant="secondary" size="md" onClick={toggleSpeech}>
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 mr-1.5" /> Stop Audio
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-1.5 text-primary-400" /> Read Feedback
            </>
          )}
        </Button>
      </div>

      {/* AI Alignment Coaching Notes */}
      <Surface variant="raised" className="p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          AI Alignment Guidance
        </h2>
        <div className="space-y-2">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 bg-surface-2 rounded-xl border border-surface-border text-xs md:text-sm text-text-secondary flex items-start space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </Surface>

      {/* Joint Angle Measurements Table */}
      <Surface variant="raised" className="p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Evaluated Joint Angles
        </h2>

        {jointList.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">
            No joint metrics recorded for this session.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {jointList.map((j) => (
              <div
                key={j.jointKey}
                className="p-3 bg-surface-2 rounded-xl border border-surface-border flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-text-primary">
                    {j.displayName}
                  </div>
                  <div className="text-[11px] text-text-muted tabular-nums">
                    Actual: {Math.round(j.actualAngle)}° • Target: {j.targetAngle}°
                  </div>
                </div>

                <StatusPill status={j.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </Surface>

      <div className="flex gap-4">
        <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Go Back
        </Button>
        <Button variant="primary" size="md" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-1.5" /> Return Home
        </Button>
      </div>
    </div>
  );
};
