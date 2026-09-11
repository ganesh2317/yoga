import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  Home,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { SessionSummary } from '../types';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Ring } from '../components/ui/Ring';
import { Meter } from '../components/ui/Meter';
import { Stat } from '../components/ui/Stat';
import { useJourneyStore } from '../store/useJourneyStore';

export const ScoreScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLevel, journeyPercent } = useJourneyStore();

  const summary = location.state?.summary as SessionSummary | undefined;

  if (!summary) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-2xl font-bold font-display">No Session Record Found</h2>
        <p className="text-sm text-text-muted">Start a practice session from the library or home.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" /> Go to Home
        </Button>
      </div>
    );
  }

  const categoryNames: Record<string, string> = {
    overall: 'Overall Score',
    shoulder: 'Shoulder Alignment',
    hip: 'Pelvic & Hip Balance',
    knee: 'Knee Tracking',
    torso: 'Spine & Torso Posture',
    balance: 'Center of Gravity',
  };

  const jointEvaluations = Object.values(summary.jointEvaluations || {});
  const goodCount = jointEvaluations.filter((j) => j.status === 'Good').length;
  const slightCount = jointEvaluations.filter((j) => j.status === 'Slight').length;
  const poorCount = jointEvaluations.filter((j) => j.status === 'Poor').length;

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header Celebration */}
      <div className="text-center space-y-2 pt-4">
        <Badge variant="accent" size="md">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Practice Completed
        </Badge>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          {summary.poseName} Session
        </h1>
        <p className="text-sm text-text-muted italic">{summary.sanskritName}</p>
      </div>

      {/* Main Score Hero Card */}
      <Surface
        variant="raised"
        className="p-6 md:p-8 bg-gradient-to-br from-surface-1 to-surface-2 border-primary-500/20 flex flex-col md:flex-row items-center justify-around gap-6 shadow-xl"
      >
        <div className="flex items-center space-x-6">
          <Ring
            value={summary.averageScore}
            size={120}
            strokeWidth={10}
            label={`${summary.averageScore}`}
            variant={
              summary.averageScore >= 80
                ? 'good'
                : summary.averageScore >= 60
                ? 'slight'
                : 'poor'
            }
          />
          <Ring
            value={summary.accuracyPercent ?? summary.averageScore}
            size={120}
            strokeWidth={10}
            label={`${summary.accuracyPercent ?? summary.averageScore}%`}
            variant="accent"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-surface-border pt-4 md:pt-0 md:pl-8">
          <Stat
            label="Duration"
            value={`${Math.round(summary.durationSeconds)}s`}
            size="md"
          />
          <Stat
            label="Best Hold"
            value={`${summary.longestHoldSeconds ?? summary.inPositionSeconds ?? 0}s`}
            size="md"
          />
          <Stat
            label="Calories"
            value={`${summary.caloriesBurned} kcal`}
            size="md"
          />
        </div>
      </Surface>

      {/* Journey Progression Card */}
      <Surface variant="flat" className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold">
            L{currentLevel}
          </div>
          <div>
            <div className="text-xs text-text-muted uppercase font-semibold">Journey Progress</div>
            <div className="text-sm font-bold text-text-primary">
              {Math.round(journeyPercent)}% Complete
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/journey')}>
          View Journey <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </Surface>

      {/* Category Breakdown & Joint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Surface variant="raised" className="p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Anatomical Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.categoryBreakdown).map(([catKey, score]) => {
              if (catKey === 'overall') return null;
              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-secondary">
                      {categoryNames[catKey] || catKey}
                    </span>
                    <span className="font-semibold tabular-nums">{score}%</span>
                  </div>
                  <Meter
                    value={score}
                    max={100}
                    variant={score >= 80 ? 'good' : score >= 60 ? 'slight' : 'poor'}
                  />
                </div>
              );
            })}
          </div>
        </Surface>

        {/* Form Feedback & Coaching Summary */}
        <Surface variant="raised" className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Form Feedback Tips
            </h3>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-success-500 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {goodCount} Good
              </span>
              <span className="flex items-center text-warning-500 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {slightCount} Slight
              </span>
              <span className="flex items-center text-danger-500 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {poorCount} Poor
              </span>
            </div>

            <div className="space-y-2">
              {summary.feedbackTips.slice(0, 3).map((tip, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-2 border border-surface-border text-xs text-text-secondary flex items-start space-x-2"
                >
                  <span className="text-primary-400 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto flex-1"
          onClick={() => navigate(`/live/${summary.poseId}`)}
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Practise Again
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto flex-1 shadow-lg shadow-primary-500/20"
          onClick={() => navigate('/journey')}
        >
          Continue Journey <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
