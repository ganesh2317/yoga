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
    <header className="sticky top-0 z-30 px-4 py-3 bg-[#090D12]/75 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-text-primary hover:bg-white/10 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-display font-extrabold text-bg-darkest text-lg">Y</span>
            </div>
            <span className="font-display font-extrabold text-lg text-text-primary tracking-tight">
              YogaSense <span className="text-accent-mint text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">AI</span>
            </span>
          </div>
        )}

        {title && !isHome && (
          <h1 className="font-display font-bold text-base text-text-primary truncate">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user && streak && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-500/25 text-amber-300 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{streak.currentStreak}d</span>
          </div>
        )}

        <button
          onClick={() => alert('Daily practice reminder scheduled for 5:00 PM')}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
