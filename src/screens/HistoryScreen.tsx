import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, History as HistoryIcon, ArrowRight } from 'lucide-react';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TopBar } from '../components/TopBar';
import { getUserSessions, getAllSessions } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import type { SessionSummary } from '../types';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const data = await getUserSessions(user.id);
        setSessions(data);
      } else {
        const data = await getAllSessions();
        setSessions(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      <TopBar />

      <div>
        <Badge variant="accent" size="md">
          Practice Log
        </Badge>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Session History
        </h1>
        <p className="text-sm text-text-muted">
          {sessions.length} recorded posture sessions stored locally in your private IndexedDB.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-text-muted">
          Loading practice records...
        </div>
      ) : sessions.length === 0 ? (
        <Surface variant="raised" className="p-8 text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="font-display font-bold text-lg text-text-primary">
            No Sessions Recorded Yet
          </h3>
          <p className="text-xs text-text-muted">
            Start a live pose practice session to automatically record your form accuracy and holds!
          </p>
          <Button variant="primary" onClick={() => navigate('/library')}>
            Browse Poses
          </Button>
        </Surface>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Surface
              key={s.id}
              variant="raised"
              className="p-4 flex items-center justify-between hover:border-primary-500/40 transition-all cursor-pointer"
              onClick={() => navigate('/score', { state: { summary: s } })}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-text-primary">
                    {s.poseName}
                  </h3>
                  <Badge variant="default" size="sm">
                    {Math.round(s.durationSeconds / 60)} min
                  </Badge>
                </div>
                <div className="text-xs text-text-muted flex items-center space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {s.dateString || s.timestamp.split('T')[0]}
                  </span>
                  <span>{s.caloriesBurned} kcal</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-base font-bold text-accent tabular-nums">
                    {s.averageScore}/100
                  </div>
                  <div className="text-[11px] text-text-3">
                    {(s.accuracyPercent || s.averageScore) ?? 0}% Accuracy
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
};
