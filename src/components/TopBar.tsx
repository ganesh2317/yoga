import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';
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
    <header className="sticky top-0 z-30 py-2.5 bg-background/85 backdrop-blur-xl border-b border-surface-border flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-surface-2 border border-surface-border text-text-primary hover:bg-surface-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/home')}
          >
            <div className="w-8 h-8 rounded-xl bg-primary-500 text-background flex items-center justify-center font-display font-bold text-sm shadow-md shadow-primary-500/20">
              YS
            </div>
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">
              YogaSense <span className="text-primary-400 text-xs px-1.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30">v2</span>
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-surface-border text-text-primary text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
            <span>{streak.currentStreak}d</span>
          </div>
        )}
      </div>
    </header>
  );
};
