import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { getAllSessions } from '../services/db';
import type { SessionSummary } from '../types';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllSessions();
      setSessions(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="Session History" showBack onBack={() => navigate('/home')} />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest block">
          Practice Log
        </span>
        <h2 className="font-serif font-extrabold text-3xl text-[#F4F1EC]">
          Session History
        </h2>
        <p className="text-xs text-[#A8A29B]">
          {sessions.length} recorded posture sessions in IndexedDB.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#635E58]">
          Loading session logs...
        </div>
      ) : sessions.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-[#635E58] mx-auto stroke-[1.5px]" />
          <h3 className="font-serif font-bold text-lg text-[#F4F1EC]">
            No Sessions Recorded
          </h3>
          <p className="text-xs text-[#A8A29B]">
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
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/12 flex items-center justify-center font-serif font-extrabold text-[#88C49D] text-lg shrink-0">
                    {ses.averageScore}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#F4F1EC]">
                      {ses.poseName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#635E58] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#635E58]" />
                        {ses.dateString}
                      </span>
                      <span>•</span>
                      <span>{Math.round(ses.durationSeconds / 60)} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={status} size="sm" />
                  <ChevronRight className="w-4 h-4 text-[#635E58]" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
