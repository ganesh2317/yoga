import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Flame,
  History as HistoryIcon,
  Play,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { todayMinutes, streak, sessions, getLastSession } = useSessionStore();

  // Compute dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name || 'Yogi';
  const dailyGoal = user?.dailyGoalMinutes || 20;
  const lastSession = getLastSession();

  const QUICK_ACTIONS = [
    {
      id: 'library',
      title: 'Pose Library',
      desc: 'Explore 8 poses',
      icon: BookOpen,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
      path: '/library',
    },
    {
      id: 'history',
      title: 'History',
      desc: `${sessions.length} sessions logged`,
      icon: HistoryIcon,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
      path: '/history',
    },
    {
      id: 'progress',
      title: 'Analytics',
      desc: 'Score trends & graphs',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30',
      path: '/progress',
    },
    {
      id: 'profile',
      title: 'Profile',
      desc: 'Goals & preferences',
      icon: User,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
      path: '/profile',
    },
  ];

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar />

      {/* Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
            {getGreeting()}, <span className="text-accent-emerald">{userName}</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Ready to perfect your posture & alignment?
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-amber-300 text-xs font-bold shadow-green-glow">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span>{streak.currentStreak} Day Streak</span>
        </div>
      </motion.div>

      {/* Hero Glass Card: Start Your Session */}
      <GlassCard variant="glow" glowColor="green" className="p-6 relative">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-accent-green/10 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2 max-w-[70%]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-green/20 text-accent-mint text-[11px] font-bold border border-accent-green/30">
              <Sparkles className="w-3 h-3" /> Real-Time CV Assistant
            </span>
            <h3 className="font-display font-bold text-xl text-text-primary tracking-tight">
              Start Posture Session
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Align your joints live in front of camera with instant feedback.
            </p>
          </div>

          <GlassButton
            onClick={() => navigate('/library')}
            variant="primary"
            size="lg"
            className="rounded-full !p-4 shadow-xl shrink-0"
          >
            <Play className="w-6 h-6 fill-current" />
          </GlassButton>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-text-tertiary">
          <span>8 Poses available</span>
          <button
            onClick={() => navigate('/library')}
            className="flex items-center gap-1 text-accent-emerald font-semibold hover:underline"
          >
            Select pose <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      {/* Daily Progress & Habit Ring */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today's Goal Ring */}
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Today's Goal
          </span>
          <CircularProgressRing
            value={todayMinutes}
            max={dailyGoal}
            size={110}
            strokeWidth={8}
            colorScheme="green"
          >
            <span className="font-display font-extrabold text-2xl text-accent-mint">
              {todayMinutes}
            </span>
            <span className="text-[10px] font-medium text-text-secondary">/{dailyGoal} min</span>
          </CircularProgressRing>
          <span className="text-[11px] text-text-tertiary mt-2">
            {todayMinutes >= dailyGoal ? 'Goal completed! 🎉' : `${dailyGoal - todayMinutes} min remaining`}
          </span>
        </GlassCard>

        {/* Lifetime Stats */}
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Habit Overview
          </span>

          <div className="space-y-3 my-2">
            <div>
              <span className="text-xs text-text-tertiary">Total Sessions</span>
              <p className="font-display font-bold text-xl text-text-primary">
                {streak.totalSessions} <span className="text-xs font-normal text-text-secondary">logged</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-text-tertiary">Total Minutes</span>
              <p className="font-display font-bold text-xl text-accent-emerald">
                {streak.totalMinutes} <span className="text-xs font-normal text-text-secondary">mins</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-text-tertiary pt-2 border-t border-white/10">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated today</span>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <GlassCard
                key={action.id}
                variant="interactive"
                onClick={() => navigate(action.path)}
                className="p-4 flex flex-col justify-between h-28"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} border flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-text-primary leading-tight">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{action.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Recent Session Preview */}
      {lastSession && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Recent Practice
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-accent-emerald font-semibold hover:underline"
            >
              View all
            </button>
          </div>

          <GlassCard
            variant="interactive"
            onClick={() => navigate(`/score/${lastSession.id}`)}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-extrabold text-accent-emerald text-lg">
                {lastSession.averageScore}
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary">
                  {lastSession.poseName}
                </h4>
                <p className="text-xs text-text-tertiary">
                  {lastSession.dateString} • {Math.round(lastSession.durationSeconds / 60)} mins
                </p>
              </div>
            </div>

            <StatusBadge
              status={
                lastSession.averageScore >= 85
                  ? 'Good'
                  : lastSession.averageScore >= 65
                  ? 'Slight'
                  : 'Poor'
              }
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
};
