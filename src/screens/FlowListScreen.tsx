import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Sparkles, Flame, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { YOGA_FLOWS, type Flow } from '../data/flows';
import { YOGA_POSES } from '../data/poses';
import { PoseReferenceIllustration } from '../components/PoseReferenceIllustration';

export const FlowListScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Multi-Pose Flows" showBack onBack={() => navigate('/home')} />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest block flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#34D399]" />
          Guided Flow Routines
        </span>
        <h2 className="font-display font-extrabold text-3xl text-[#F5F7FA]">
          Custom Routines
        </h2>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Sequenced multi-pose flows with real-time posture hold timers & auto-advance.
        </p>
      </div>

      <div className="space-y-4">
        {YOGA_FLOWS.map((flow: Flow) => {
          const poses = flow.poses.map((p) => {
            const found = YOGA_POSES.find((yp) => yp.id === p.poseId);
            return {
              ...p,
              name: found ? found.name : p.poseId,
            };
          });

          return (
            <GlassCard key={flow.id} variant="focal" glowColor="emerald" className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-[#F5F7FA]">
                    {flow.name}
                  </h3>
                  <p className="text-xs text-[#F59E0B] font-medium italic mt-0.5">
                    {flow.sanskritName}
                  </p>
                </div>
                <StatusBadge status={flow.difficulty} size="sm" />
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {flow.description}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>~{flow.estimatedDurationMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{flow.poses.length} Poses</span>
                </div>
              </div>

              {/* Pose Sequence Thumbnail Strip */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block">
                  Pose Sequence ({flow.poses.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {poses.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 shrink-0"
                    >
                      <div className="w-6 h-6 rounded-md bg-white/10 p-0.5 shrink-0 flex items-center justify-center">
                        <PoseReferenceIllustration poseId={p.poseId} strokeColor="#34D399" />
                      </div>
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-[#F5F7FA] block leading-tight truncate max-w-[90px]">
                          {p.name}
                        </span>
                        <span className="text-[9px] text-[#34D399] font-mono block">
                          {p.targetHoldSeconds}s hold
                        </span>
                      </div>
                      {idx < poses.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-[#64748B] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-white/10">
                <GlassButton
                  onClick={() => navigate(`/flow/${flow.id}`)}
                  variant="primary"
                  fullWidth
                  size="md"
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                >
                  Start {flow.name}
                </GlassButton>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
