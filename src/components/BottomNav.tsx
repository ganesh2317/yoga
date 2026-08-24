import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Camera, TrendingUp, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', path: '/home', icon: Home },
  { id: 'library', label: 'Library', path: '/library', icon: BookOpen },
  { id: 'live', label: 'Live', path: '/live', icon: Camera },
  { id: 'progress', label: 'Progress', path: '/progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/live') return 'live';
    if (path.startsWith('/home')) return 'home';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/live/')) return 'live';
    if (path.startsWith('/progress') || path.startsWith('/history')) return 'progress';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto rounded-3xl bg-[#0F1620]/95 border border-white/12 backdrop-blur-2xl shadow-glass-glow p-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-colors duration-200 select-none ${
                isActive ? 'text-[#0A0E14] font-extrabold' : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#22C55E] to-[#34D399] rounded-2xl shadow-lg shadow-[#22C55E]/30 border border-[#34D399]/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2px] text-[#0A0E14]' : 'stroke-[1.75px]'}`} />
                <span className={`text-[10px] tracking-tight ${isActive ? 'text-[#0A0E14] font-extrabold' : 'text-[#94A3B8]'}`}>{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
