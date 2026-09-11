import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
  const shouldReduceMotion = useReducedMotion();

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
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className="pointer-events-auto rounded-3xl bg-bg-elev/90 border border-border backdrop-blur-xl shadow-2 p-1.5 flex items-center justify-between relative"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl select-none transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-text-3 hover:text-text-2 font-medium'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 rounded-2xl bg-accent-soft border border-accent/25 shadow-sm"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 32 }
                  }
                />
              )}
              <motion.div
                className="relative z-10 flex items-center justify-center"
                animate={
                  shouldReduceMotion
                    ? {}
                    : isActive
                    ? { scale: [1, 0.88, 1.16, 1.08], y: [0, 1, -2, -1] }
                    : { scale: 1, y: 0 }
                }
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 22,
                  duration: 0.3,
                }}
              >
                <Icon className="w-5 h-5 transition-colors duration-200" />
              </motion.div>
              <motion.span
                className="relative z-10 text-[10px] mt-0.5 tracking-tight transition-colors duration-200"
                animate={{
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.15 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

