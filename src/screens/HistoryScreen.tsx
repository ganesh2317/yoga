import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, History as HistoryIcon, Search } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { useSessionStore } from '../store/useSessionStore';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { sessions } = useSessionStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(
    (s) =>
      s.poseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sanskritName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dateString.includes(searchTerm)
  );

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-4">
      <TopBar title="Session History" />

      <div className="space-y-3">
        <h2 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
          Past Practice Log
        </h2>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by pose name or date..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.06] border border-white/12 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-green transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <GlassCard className="p-8 text-center space-y-3">
            <HistoryIcon className="w-10 h-10 text-text-tertiary mx-auto" />
            <h3 className="font-display font-bold text-base text-text-primary">
              No Sessions Recorded Yet
            </h3>
            <p className="text-xs text-text-secondary">
              Complete your first posture session from the Pose Library to build your habit!
            </p>
          </GlassCard>
        ) : (
          filteredSessions.map((s) => (
            <GlassCard
              key={s.id}
              variant="interactive"
              onClick={() => navigate(`/score/${s.id}`)}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-extrabold text-accent-mint text-lg shrink-0">
                  {s.averageScore}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h3 className="font-display font-bold text-sm text-text-primary truncate">
                    {s.poseName}
                  </h3>
                  <p className="text-xs text-text-tertiary truncate">
                    {s.dateString} • {Math.round(s.durationSeconds / 60)} min • {s.caloriesBurned} kcal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge
                  status={s.averageScore >= 85 ? 'Good' : s.averageScore >= 65 ? 'Slight' : 'Poor'}
                  size="sm"
                />
                <ChevronRight className="w-4 h-4 text-text-tertiary" />
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
