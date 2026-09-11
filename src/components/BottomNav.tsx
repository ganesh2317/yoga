import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Activity, Compass, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', path: '/home', icon: Home },
  { id: 'library', label: 'Library', path: '/library', icon: BookOpen },
  { id: 'free-track', label: 'Practice', path: '/free-track', icon: Activity },
  { id: 'journey', label: 'Journey', path: '/journey', icon: Compass },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/journey')) return 'journey';
    if (path.startsWith('/free-track')) return 'free-track';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/home')) return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 max-w-lg mx-auto pointer-events-none">
      <nav className="pointer-events-auto rounded-3xl bg-surface-1/90 border border-surface-border backdrop-blur-xl shadow-2xl p-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-primary-400 font-bold bg-primary-500/10'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
