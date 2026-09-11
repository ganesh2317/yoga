import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  Play,
  BookOpen,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Ring } from '../components/ui/Ring';
import { Stat } from '../components/ui/Stat';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import { useJourneyStore } from '../store/useJourneyStore';
import { JOURNEY_LEVELS } from '../data/journey';
import { YOGA_POSES } from '../data/poses';
import { getNextRequirementText } from '../lib/journeyEngine';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { todayMinutes, streak, getLastSession, fetchUserSessions } = useSessionStore();
  const {
    currentLevel,
    poseStats,
    journeyPercent,
    loadJourney,
  } = useJourneyStore();

  useEffect(() => {
    if (user) {
      fetchUserSessions(user.id, user.dailyGoalMinutes);
      loadJourney(user.id);
    }
  }, [user, fetchUserSessions, loadJourney]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name || 'Practitioner';
  const dailyGoal = user?.dailyGoalMinutes || 20;
  const lastSession = getLastSession();

  const activeLevelConfig =
    JOURNEY_LEVELS.find((l) => l.level === currentLevel) || JOURNEY_LEVELS[0];

  const nextReqText = getNextRequirementText(activeLevelConfig, poseStats);

  // Find recommended pose to practice next from active level
  const recommendedPoseId =
    activeLevelConfig.targetPoseIds.find((id) => {
      const stats = poseStats[id];
      return (
        !stats ||
        stats.bestAccuracy < activeLevelConfig.requiredAccuracy ||
        stats.bestHoldSeconds < activeLevelConfig.requiredHoldSeconds
      );
    }) || activeLevelConfig.targetPoseIds[0];

  const recommendedPose =
    YOGA_POSES.find((p) => p.id === recommendedPoseId) || YOGA_POSES[0];

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      <TopBar />

      {/* Greeting Header & Streak Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-500">
            Personal Practice
          </span>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            {getGreeting()}, <span className="text-primary-400">{userName}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 bg-surface-1 px-4 py-2 rounded-full border border-surface-border self-start sm:self-auto shadow-sm">
          <Flame className="w-5 h-5 text-accent-500 fill-accent-500 animate-pulse" />
          <span className="text-sm font-bold text-text-primary">
            {streak.currentStreak} Day Streak
          </span>
        </div>
      </div>

      {/* Main Grid: Continue Journey Hero + Daily Practice Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Continue Journey Hero Card (2 cols on desktop) */}
        <Surface
          variant="raised"
          className="md:col-span-2 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-surface-1 to-surface-2 border-primary-500/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="accent" size="md">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Journey Level {currentLevel} • {activeLevelConfig.tier}
              </Badge>
              <span className="text-xs text-text-muted font-semibold">
                {Math.round(journeyPercent)}% Complete
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary">
                {activeLevelConfig.title}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {activeLevelConfig.description}
              </p>
            </div>

            <div className="bg-surface-2/80 p-3 rounded-xl border border-surface-border text-xs text-text-muted flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0" />
              <span>Next goal: <strong className="text-text-primary">{nextReqText}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-4 border-t border-surface-border">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto flex-1 shadow-lg shadow-primary-500/20"
              onClick={() => navigate(`/live/${recommendedPose.id}`)}
            >
              <Play className="w-4 h-4 fill-current mr-2" />
              Practise {recommendedPose.name}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/journey')}
            >
              View Full Journey <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Surface>

        {/* Daily Goal & Stats (1 col) */}
        <Surface variant="raised" className="p-6 flex flex-col items-center justify-between space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted self-start">
            Today's Practice
          </h3>

          <Ring
            value={Math.min(100, (todayMinutes / dailyGoal) * 100)}
            size={110}
            strokeWidth={9}
            label={`${todayMinutes}m`}
            variant={todayMinutes >= dailyGoal ? 'good' : 'accent'}
          />

          <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-surface-border text-center">
            <Stat
              label="Total Time"
              value={`${streak.totalMinutes}m`}
              size="sm"
            />
            <Stat
              label="Sessions"
              value={streak.totalSessions}
              size="sm"
            />
          </div>
        </Surface>
      </div>

      {/* Quick Launch Practice Modes */}
      <div className="space-y-3">
        <h3 className="text-lg font-display font-semibold">Explore Practice Modes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Surface
            variant="flat"
            className="p-4 flex items-center space-x-4 cursor-pointer hover:border-primary-500/40 hover:bg-surface-2 transition-all"
            onClick={() => navigate('/library')}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Pose Library</div>
              <div className="text-xs text-text-muted">21 Asanas & Form Targets</div>
            </div>
          </Surface>

          <Surface
            variant="flat"
            className="p-4 flex items-center space-x-4 cursor-pointer hover:border-accent-500/40 hover:bg-surface-2 transition-all"
            onClick={() => navigate('/flows')}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent-500/10 text-accent-500 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Guided Flows</div>
              <div className="text-xs text-text-muted">Structured Vinyasa Sequences</div>
            </div>
          </Surface>

          <Surface
            variant="flat"
            className="p-4 flex items-center space-x-4 cursor-pointer hover:border-info-500/40 hover:bg-surface-2 transition-all"
            onClick={() => navigate('/free-track')}
          >
            <div className="w-12 h-12 rounded-2xl bg-info-500/10 text-info-400 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Free Practice</div>
              <div className="text-xs text-text-muted">Auto Pose Detection</div>
            </div>
          </Surface>
        </div>
      </div>

      {/* Recent Session Banner if available */}
      {lastSession && (
        <Surface variant="outline" className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-primary-400 font-bold text-sm">
              {Math.round(lastSession.averageScore)}
            </div>
            <div>
              <div className="text-xs text-text-muted">Recent Session</div>
              <div className="text-sm font-semibold text-text-primary">
                {lastSession.poseName} • {Math.round(lastSession.durationSeconds / 60)} min
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/progress')}
          >
            View History <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Surface>
      )}
    </div>
  );
};
