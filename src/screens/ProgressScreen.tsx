import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
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
import { localDateKey } from '../lib/localDate';

export const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sessions, streak, fetchUserSessions } = useSessionStore();
  const { currentLevel, journeyPercent, loadJourney } = useJourneyStore();

  useEffect(() => {
    if (user) {
      fetchUserSessions(user.id, user.dailyGoalMinutes);
      loadJourney(user.id);
    }
  }, [user, fetchUserSessions, loadJourney]);

  const activeLevelConfig =
    JOURNEY_LEVELS.find((l) => l.level === currentLevel) || JOURNEY_LEVELS[0];

  // Compute Last 7 Days Activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = localDateKey(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayMinutes = sessions
      .filter((s) => (s.dateString || localDateKey(new Date(s.timestamp))) === key)
      .reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0);

    return { dateKey: key, dayName, minutes: dayMinutes };
  });

  const maxDayMins = Math.max(20, ...last7Days.map((d) => d.minutes));

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      <TopBar />

      <div>
        <Badge variant="accent" size="md">
          Performance Analytics
        </Badge>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Your Practice Progress
        </h1>
        <p className="text-sm text-text-muted">
          Track consistency, journey level advancements, and form accuracy over time.
        </p>
      </div>

      {/* 1. Journey Summary Card First */}
      <Surface
        variant="raised"
        className="p-6 bg-gradient-to-br from-surface-1 to-surface-2 border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="accent" size="sm">
            {activeLevelConfig.tier} Tier
          </Badge>
          <h2 className="text-2xl font-display font-bold">
            Level {currentLevel}: {activeLevelConfig.title}
          </h2>
          <p className="text-xs text-text-muted max-w-md">
            {activeLevelConfig.description}
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <Ring
            value={journeyPercent}
            size={90}
            strokeWidth={8}
            label={`${Math.round(journeyPercent)}%`}
            variant="good"
          />
          <Button variant="primary" size="md" onClick={() => navigate('/journey')}>
            Open Journey <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </Surface>

      {/* 2. Key Lifetime Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Surface variant="flat" className="p-4 flex flex-col items-center justify-center text-center">
          <Flame className="w-5 h-5 text-accent-500 mb-1" />
          <Stat label="Current Streak" value={`${streak.currentStreak} Days`} size="sm" />
        </Surface>

        <Surface variant="flat" className="p-4 flex flex-col items-center justify-center text-center">
          <Clock className="w-5 h-5 text-primary-400 mb-1" />
          <Stat label="Total Mat Time" value={`${streak.totalMinutes}m`} size="sm" />
        </Surface>

        <Surface variant="flat" className="p-4 flex flex-col items-center justify-center text-center">
          <Award className="w-5 h-5 text-info-400 mb-1" />
          <Stat label="Sessions Done" value={streak.totalSessions} size="sm" />
        </Surface>

        <Surface variant="flat" className="p-4 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-5 h-5 text-success-400 mb-1" />
          <Stat
            label="Avg Accuracy"
            value={
              sessions.length > 0
                ? `${Math.round(
                    sessions.reduce(
                      (acc, s) => acc + (s.accuracyPercent ?? s.averageScore ?? 0),
                      0
                    ) / sessions.length
                  )}%`
                : '--'
            }
            size="sm"
          />
        </Surface>
      </div>

      {/* 3. 7-Day Activity Chart */}
      <Surface variant="raised" className="p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Last 7 Days Activity (Minutes)
        </h3>

        <div className="h-44 flex items-end justify-between pt-6 px-2 gap-2">
          {last7Days.map((day) => {
            const heightPercent = Math.max(8, (day.minutes / maxDayMins) * 100);
            return (
              <div key={day.dateKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] text-text-muted tabular-nums mb-1 group-hover:text-primary-400 transition-colors">
                  {day.minutes > 0 ? `${day.minutes}m` : ''}
                </span>
                <div
                  className="w-full max-w-[36px] bg-primary-500/20 group-hover:bg-primary-500/40 rounded-t-lg transition-all duration-300 relative overflow-hidden"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 bg-primary-500 rounded-t-lg transition-all"
                    style={{ height: day.minutes > 0 ? '100%' : '0%' }}
                  />
                </div>
                <span className="text-xs font-medium text-text-muted mt-2">
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </Surface>

      {/* 4. Session History */}
      <Surface variant="raised" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Recent Practice Sessions
          </h3>
          <span className="text-xs text-text-muted">{sessions.length} total</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">
            No completed sessions yet. Start your first practice from Home or Library!
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {sessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="p-3 bg-surface-2/60 rounded-xl border border-surface-border flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-text-primary text-sm">
                    {s.poseName}
                  </div>
                  <div className="text-text-muted">
                    {s.dateString || s.timestamp.split('T')[0]} • {Math.round(s.durationSeconds / 60)} min
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-primary-400 tabular-nums">
                      {s.averageScore}/100
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {s.accuracyPercent ?? s.averageScore}% Acc
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
};
