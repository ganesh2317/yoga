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
    <header className="sticky top-0 z-30 px-4 py-3 bg-[#0C0D10]/80 backdrop-blur-2xl border-b border-[#F4F1EC]/[0.07] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-[#F4F1EC]/[0.04] border border-[#F4F1EC]/10 text-[#F4F1EC] hover:bg-[#F4F1EC]/10 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5px]" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-9 h-9 rounded-xl bg-[#3F6B4F] flex items-center justify-center shadow-lg shadow-[#3F6B4F]/25 border border-[#88C49D]/30">
              <span className="font-serif font-extrabold text-[#F4F1EC] text-lg">Y</span>
            </div>
            <span className="font-serif font-extrabold text-xl text-[#F4F1EC] tracking-tight">
              YogaSense <span className="text-[#C9A66B] text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#C9A66B]/15 border border-[#C9A66B]/30">AI</span>
            </span>
          </div>
        )}

        {title && !isHome && (
          <h1 className="font-serif font-bold text-lg text-[#F4F1EC] truncate">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user && streak && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/15 border border-[#C9A66B]/30 text-[#E2C389] text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
            <span>{streak.currentStreak}d</span>
          </div>
        )}

        <button
          onClick={() => alert('Daily practice reminder scheduled for 5:00 PM')}
          className="p-2 rounded-xl bg-[#F4F1EC]/[0.04] border border-[#F4F1EC]/10 text-[#635E58] hover:text-[#F4F1EC] hover:bg-[#F4F1EC]/10 transition-all"
        >
          <Bell className="w-4 h-4 stroke-[1.5px]" />
        </button>
      </div>
    </header>
  );
};
