import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Flame } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, showBack, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { streak } = useSessionStore();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const isHome = location.pathname === '/home';

  return (
    <header className="sticky top-0 z-30 px-4 py-3 bg-[#0A0E14]/85 backdrop-blur-2xl border-b border-white/[0.07] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#F5F7FA] hover:bg-white/10 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.75px]" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#34D399] flex items-center justify-center shadow-lg shadow-[#22C55E]/30 border border-[#34D399]/40">
              <span className="font-display font-extrabold text-[#0A0E14] text-lg">Y</span>
            </div>
            <span className="font-display font-extrabold text-xl text-[#F5F7FA] tracking-tight">
              YogaSense <span className="text-[#34D399] text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30">AI</span>
            </span>
          </div>
        )}

        {title && !isHome && (
          <h1 className="font-display font-bold text-lg text-[#F5F7FA] truncate">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user && streak && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FBBF24] text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span>{streak.currentStreak}d</span>
          </div>
        )}

        <button
          onClick={() => alert('Daily practice reminder scheduled for 5:00 PM')}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#64748B] hover:text-[#F5F7FA] hover:bg-white/10 transition-all"
        >
          <Bell className="w-4 h-4 stroke-[1.75px]" />
        </button>
      </div>
    </header>
  );
};
