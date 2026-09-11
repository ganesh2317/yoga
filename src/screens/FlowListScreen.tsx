import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Sparkles } from 'lucide-react';
import { YOGA_FLOWS, type Flow } from '../data/flows';
import { YOGA_POSES } from '../data/poses';
import { TopBar } from '../components/TopBar';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const FlowListScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      <TopBar />

      <div>
        <Badge variant="accent" size="md">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Vinyasa Flows
        </Badge>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Guided Multi-Pose Sequences
        </h1>
        <p className="text-sm text-text-muted">
          Seamlessly sequenced routines with posture hold timers, form tracking, and auto-advance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {YOGA_FLOWS.map((flow: Flow) => {
          const poses = flow.poses.map((p) => {
            const found = YOGA_POSES.find((yp) => yp.id === p.poseId);
            return {
              ...p,
              name: found ? found.name : p.poseId,
            };
          });

          return (
            <Surface
              key={flow.id}
              variant="raised"
              className="p-6 flex flex-col justify-between space-y-5 hover:border-primary-500/40 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="default" size="sm">
                    {flow.difficulty}
                  </Badge>
                  <span className="text-xs text-text-muted flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> ~{flow.estimatedDurationMinutes} min
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-display font-bold text-text-primary">
                    {flow.name}
                  </h2>
                  <p className="text-xs text-text-muted italic mt-0.5">
                    {flow.sanskritName}
                  </p>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {flow.description}
                </p>

                {/* Pose Sequence Pills */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Sequence ({poses.length} Asanas)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {poses.map((p, idx) => (
                      <span
                        key={idx}
                        className="bg-surface-2 text-text-secondary px-2.5 py-1 rounded-lg text-xs font-medium border border-surface-border flex items-center space-x-1"
                      >
                        <span className="text-primary-400 font-bold">{idx + 1}.</span>
                        <span>{p.name}</span>
                        <span className="text-text-muted text-[10px]">({p.targetHoldSeconds}s)</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <div className="text-xs text-text-muted">
                  {flow.benefits.length > 0 ? flow.benefits[0] : ''}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/flow/${flow.id}`)}
                >
                  <Play className="w-4 h-4 mr-1.5 fill-current" /> Start Flow
                </Button>
              </div>
            </Surface>
          );
        })}
      </div>
    </div>
  );
};
