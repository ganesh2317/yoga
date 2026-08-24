import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { BodySkeletonDiagram } from '../components/BodySkeletonDiagram';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { getSessionById } from '../services/db';
import type { JointEvaluation, SessionSummary } from '../types';

export const FeedbackScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function load() {
      if (sessionId && sessionId !== 'latest') {
        const found = await getSessionById(sessionId);
        setSession(found || null);
      }
    }
    load();
  }, [sessionId]);

  const tips = session?.feedbackTips || [
    'Great overall stability in your core and posture alignment!',
    'Softly roll your shoulders back and down to keep your chest open.',
    'Keep your standing foot firmly grounded through all four corners.',
  ];

  const jointEvalMap: Record<string, JointEvaluation> = session?.jointEvaluations || {
    leftKnee: { jointKey: 'leftKnee', displayName: 'Left Knee', status: 'Good', actualAngle: 176, targetAngle: 178, tolerance: 10, deviation: 2, score: 98 },
    rightKnee: { jointKey: 'rightKnee', displayName: 'Right Knee', status: 'Good', actualAngle: 175, targetAngle: 178, tolerance: 10, deviation: 3, score: 97 },
    leftShoulder: { jointKey: 'leftShoulder', displayName: 'Left Shoulder', status: 'Slight', actualAngle: 152, targetAngle: 170, tolerance: 20, deviation: 18, score: 75 },
    rightShoulder: { jointKey: 'rightShoulder', displayName: 'Right Shoulder', status: 'Slight', actualAngle: 154, targetAngle: 170, tolerance: 20, deviation: 16, score: 78 },
  };

  const jointList = Object.values(jointEvalMap);

  const speakTips = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = tips.join('. ');
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Personalized Feedback" showBack onBack={() => navigate(-1)} />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest block">
          AI Posture Analysis
        </span>
        <h2 className="font-serif font-extrabold text-3xl text-[#F4F1EC]">
          Personalized Tips
        </h2>
        <p className="text-xs text-[#A8A29B]">
          Plain-English corrective cues generated from your live session.
        </p>
      </div>

      {/* Audio Player Card */}
      <GlassCard variant="focal" glowColor="ochre" className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A66B]/20 border border-[#C9A66B]/40 text-[#C9A66B] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#F4F1EC]">Audio Guidance</h4>
            <p className="text-[11px] text-[#A8A29B]">Listen to speech feedback reader</p>
          </div>
        </div>

        <GlassButton
          onClick={speakTips}
          variant={isSpeaking ? 'danger' : 'warm'}
          size="sm"
          leftIcon={isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        >
          {isSpeaking ? 'Stop' : 'Listen'}
        </GlassButton>
      </GlassCard>

      {/* Corrective Tips Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
          Actionable Posture Cues
        </h3>

        <div className="space-y-2.5">
          {tips.map((tip, idx) => (
            <GlassCard key={idx} className="p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#88C49D] shrink-0 mt-0.5" />
              <p className="text-xs text-[#F4F1EC] leading-relaxed font-medium">
                {tip}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Interactive Body Joint Diagram */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
          Interactive Joint Map
        </h3>

        <GlassCard className="p-5 flex flex-col items-center justify-center">
          <BodySkeletonDiagram jointEvaluations={jointEvalMap} />
          <span className="text-[10px] text-[#635E58] mt-3 font-medium">
            Tap highlighted joint markers for target vs actual angles
          </span>
        </GlassCard>
      </div>

      {/* Joint Angle List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
          Joint Angle Measurements
        </h3>

        <div className="space-y-2">
          {jointList.map((je, i) => (
            <GlassCard key={i} className="p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F4F1EC]">{je.displayName}</h4>
                <p className="text-[11px] text-[#635E58]">
                  Target: {je.targetAngle}° • Actual: {Math.round(je.actualAngle)}°
                </p>
              </div>
              <StatusBadge status={je.status} size="sm" />
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <GlassButton
          onClick={() => navigate('/home')}
          variant="secondary"
          leftIcon={<Home className="w-4 h-4" />}
        >
          Return Home
        </GlassButton>

        <GlassButton
          onClick={() => navigate(`/live/${session?.poseId || 'tadasana'}`)}
          variant="primary"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Practice Again
        </GlassButton>
      </div>
    </div>
  );
};
