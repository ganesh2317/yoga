import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useJourneyStore } from '../store/useJourneyStore';
import { JOURNEY_LEVELS } from '../data/journey';
import { YOGA_POSES } from '../data/poses';
import { Ring } from '../components/ui/Ring';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Meter } from '../components/ui/Meter';
import { calculateLevelProgress } from '../lib/journeyEngine';

export const JourneyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentLevel,
    completedLevelNumbers,
    poseStats,
    journeyPercent,
    loadJourney,
  } = useJourneyStore();

  useEffect(() => {
    if (user) {
      loadJourney(user.id);
    }
  }, [user, loadJourney]);

  const activeLevelConfig =
    JOURNEY_LEVELS.find((l) => l.level === currentLevel) || JOURNEY_LEVELS[0];
  const activeLevelDetail = calculateLevelProgress(activeLevelConfig, poseStats);

  const posesById = React.useMemo(() => {
    const map = new Map();
    YOGA_POSES.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-28">
      {/* Header Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-1 rounded-3xl p-6 md:p-8 border border-surface-border shadow-xl">
        <div className="space-y-2">
          <Badge variant="accent">
            Mastery Path
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Your Yoga Journey
          </h1>
          <p className="text-sm md:text-base text-text-muted max-w-md">
            Master 10 sequential tiers of form, balance, and alignment to elevate your daily practice.
          </p>
        </div>

        <div className="flex items-center space-x-6 bg-surface-2/60 p-4 rounded-2xl border border-surface-border self-start md:self-auto">
          <Ring
            value={journeyPercent}
            size={88}
            strokeWidth={8}
            variant="good"
          >
            <div className="text-center">
              <span className="text-sm font-bold tabular-nums">{Math.round(journeyPercent)}%</span>
            </div>
          </Ring>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-text-muted font-semibold">
              Current Tier
            </div>
            <div className="text-lg font-bold text-text-primary">
              Level {currentLevel}: {activeLevelConfig.title}
            </div>
            <div className="text-xs text-primary-400 font-medium">
              {activeLevelConfig.tier} Tier
            </div>
          </div>
        </div>
      </div>

      {/* Level Stepper / Roadmap */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold">Progression Roadmap</h2>
        <div className="flex items-center overflow-x-auto pb-4 pt-2 space-x-4 scrollbar-thin">
          {JOURNEY_LEVELS.map((lvl) => {
            const isCompleted = completedLevelNumbers.includes(lvl.level);
            const isCurrent = lvl.level === currentLevel;

            return (
              <div
                key={lvl.level}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-surface-2 border-primary-500 shadow-md'
                    : isCompleted
                    ? 'bg-surface-1 border-primary-500/30'
                    : 'bg-surface-1/40 border-surface-border opacity-60'
                }`}
                style={{ width: 140 }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCompleted
                      ? 'bg-primary-500 text-background'
                      : isCurrent
                      ? 'border-2 border-primary-500 text-text-primary'
                      : 'bg-surface-2 text-text-muted'
                  }`}
                >
                  {isCompleted ? '✓' : lvl.level}
                </div>
                <div className="text-xs font-semibold text-text-primary mt-2 text-center truncate w-full">
                  {lvl.title}
                </div>
                <div className="text-[10px] text-text-muted text-center">
                  {lvl.tier}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Level Deep Dive */}
      <Surface variant="raised" className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{activeLevelConfig.icon}</span>
              <h3 className="text-2xl font-display font-bold">
                Level {activeLevelConfig.level}: {activeLevelConfig.title}
              </h3>
            </div>
            <p className="text-sm text-text-muted">
              {activeLevelConfig.description}
            </p>
          </div>

          <div className="w-full md:w-56 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-muted">Level Progress</span>
              <span className="text-primary-400 font-bold">
                {Math.round(activeLevelDetail.levelProgress * 100)}%
              </span>
            </div>
            <Meter
              value={activeLevelDetail.levelProgress * 100}
              max={100}
              variant="good"
            />
          </div>
        </div>

        {/* Target Poses for Active Level */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Target Postures & Mastery Criteria
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLevelDetail.poseDetails.map((pd) => {
              const pose = posesById.get(pd.poseId);
              if (!pose) return null;

              return (
                <div
                  key={pd.poseId}
                  className="bg-surface-2/70 p-4 rounded-2xl border border-surface-border flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-text-primary">
                          {pose.name}
                        </span>
                        {pd.isComplete && (
                          <Badge variant="accent">
                            ✓ Mastered
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-text-muted italic">
                        {pose.sanskritName}
                      </div>
                    </div>
                    <Badge variant="default">
                      {pose.difficulty}
                    </Badge>
                  </div>

                  {/* Requirements Progress Checklist */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-text-secondary">
                      <span>
                        Form Accuracy (Target: {pd.targetAccuracy}%)
                      </span>
                      <span className="font-semibold tabular-nums">
                        {Math.round(pd.currentAccuracy)}%
                      </span>
                    </div>
                    <Meter
                      value={pd.accuracyProgress * 100}
                      max={100}
                      variant={pd.accuracyProgress >= 1 ? 'good' : 'accent'}
                    />

                    <div className="flex justify-between text-text-secondary">
                      <span>
                        Continuous Hold (Target: {pd.targetHold}s)
                      </span>
                      <span className="font-semibold tabular-nums">
                        {Math.round(pd.currentHold)}s
                      </span>
                    </div>
                    <Meter
                      value={pd.holdProgress * 100}
                      max={100}
                      variant={pd.holdProgress >= 1 ? 'good' : 'accent'}
                    />

                    <div className="flex justify-between text-text-secondary">
                      <span>
                        Sessions Completed (Target: {pd.targetSessions})
                      </span>
                      <span className="font-semibold tabular-nums">
                        {pd.currentSessions} / {pd.targetSessions}
                      </span>
                    </div>
                    <Meter
                      value={pd.sessionsProgress * 100}
                      max={100}
                      variant={pd.sessionsProgress >= 1 ? 'good' : 'accent'}
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/live/${pd.poseId}`)}
                  >
                    Practise {pose.name}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </Surface>
    </div>
  );
};
