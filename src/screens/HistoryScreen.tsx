import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { getAllSessions, getUserSessions } from '../services/db';
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
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Session History" showBack onBack={() => navigate('/home')} />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block">
          Practice Log
        </span>
        <h2 className="font-display font-extrabold text-3xl text-[#F5F7FA]">
          Session History
        </h2>
        <p className="text-xs text-[#94A3B8]">
          {sessions.length} recorded posture sessions in IndexedDB.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#64748B]">
          Loading session logs...
        </div>
      ) : sessions.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-[#64748B] mx-auto stroke-[1.75px]" />
          <h3 className="font-display font-bold text-lg text-[#F5F7FA]">
            No Sessions Recorded
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Start a live pose detection session to log your posture score history!
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {sessions.map((ses) => {
            const status = ses.averageScore >= 85 ? 'Good' : ses.averageScore >= 65 ? 'Slight' : 'Poor';
            return (
              <GlassCard
                key={ses.id}
                variant="interactive"
                onClick={() => navigate(`/score/${ses.id}`)}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/12 flex items-center justify-center font-display font-extrabold text-[#34D399] text-lg shrink-0">
                    {ses.averageScore}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#F5F7FA]">
                      {ses.poseName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#64748B]" />
                        {ses.dateString}
                      </span>
                      <span>•</span>
                      <span>{Math.round(ses.durationSeconds / 60)} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={status} size="sm" />
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
