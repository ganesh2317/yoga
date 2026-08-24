import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Camera,
  ChevronRight,
  Flame,
  History as HistoryIcon,
  Sparkles,
  TrendingUp,
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
  const { todayMinutes, streak, getLastSession } = useSessionStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name || 'Yogi';
  const dailyGoal = user?.dailyGoalMinutes || 20;
  const lastSession = getLastSession();

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-6">
      <TopBar />

      {/* Header Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex items-end justify-between pt-1"
      >
        <div>
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block mb-1">
            Personal Practice
          </span>
          <h2 className="font-display font-extrabold text-3xl text-[#F5F7FA] tracking-tight">
            {getGreeting()}, <span className="text-[#34D399] font-bold">{userName}</span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FBBF24] text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
          <span>{streak.currentStreak}d Streak</span>
        </div>
      </motion.div>

      {/* Hero Glass Card matching reference style */}
      <GlassCard variant="focal" glowColor="emerald" className="p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#22C55E]/15 blur-3xl pointer-events-none" />
        <div className="flex flex-col space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/20 text-[#34D399] text-xs font-bold border border-[#22C55E]/40">
              <Sparkles className="w-3.5 h-3.5" /> Real-Time CV Tracking
            </span>
            <span className="text-[11px] font-semibold text-[#94A3B8]">20 Asanas</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-2xl text-[#F5F7FA] tracking-tight leading-snug">
              Perfect Your Pose Form
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Align your body in real time with gentle, live joint angle scoring and voice tips.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <GlassButton
              onClick={() => navigate('/live')}
              variant="primary"
              size="md"
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Start Free Practice
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/library')}
              variant="secondary"
              size="md"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Pose Library
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Asymmetric Habit Section with Reference Goal Gauge */}
      <div className="grid grid-cols-5 gap-3">
        {/* Today's Goal Ring Card */}
        <GlassCard className="col-span-3 p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
            Today's Goal
          </span>
          <CircularProgressRing
            value={todayMinutes}
            max={dailyGoal}
            size={120}
            strokeWidth={9}
            colorScheme="emerald"
          >
            <span className="font-display font-extrabold text-3xl text-[#34D399]">
              {todayMinutes}
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8]">/{dailyGoal} min</span>
          </CircularProgressRing>
          <span className="text-[11px] text-[#94A3B8] mt-3 font-medium">
            {todayMinutes >= dailyGoal ? 'Goal Completed 🎉' : `${dailyGoal - todayMinutes} mins remaining`}
          </span>
        </GlassCard>

        {/* Unboxed Lifetime Stats Panel */}
        <div className="col-span-2 flex flex-col justify-between p-4 rounded-2xl bg-[#0F1620] border border-white/8">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
            Summary
          </span>

          <div className="space-y-3 my-1">
            <div>
              <span className="text-[11px] text-[#64748B] block">Sessions</span>
              <p className="font-display font-extrabold text-2xl text-[#F5F7FA]">
                {streak.totalSessions}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block">Total Time</span>
              <p className="font-display font-extrabold text-2xl text-[#34D399]">
                {streak.totalMinutes}<span className="text-xs text-[#94A3B8] font-normal ml-0.5">m</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] text-[#64748B]">Updated live</span>
        </div>
      </div>

      {/* Quick Action Circular Icon Buttons matching reference layout */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/library')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#151B24] border border-white/10 flex items-center justify-center text-[#34D399] group-hover:border-[#22C55E]/50 group-active:scale-95 group-active:shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all shadow-glass-subtle">
              <BookOpen className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#34D399] transition-colors">
              Library
            </span>
          </button>

          <button
            onClick={() => navigate('/live')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#151B24] border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] group-hover:border-[#F59E0B]/60 group-active:scale-95 group-active:shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all shadow-glass-subtle">
              <Camera className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#F59E0B] transition-colors">
              Auto Detect
            </span>
          </button>

          <button
            onClick={() => navigate('/progress')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#151B24] border border-white/10 flex items-center justify-center text-[#34D399] group-hover:border-[#22C55E]/50 group-active:scale-95 group-active:shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all shadow-glass-subtle">
              <TrendingUp className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#34D399] transition-colors">
              Analytics
            </span>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#151B24] border border-white/10 flex items-center justify-center text-[#F59E0B] group-hover:border-[#F59E0B]/50 group-active:scale-95 group-active:shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all shadow-glass-subtle">
              <HistoryIcon className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#F59E0B] transition-colors">
              History
            </span>
          </button>
        </div>
      </div>

      {/* Recent Practice Card */}
      {lastSession && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
              Last Session
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-[#F59E0B] font-semibold hover:underline"
            >
              View history
            </button>
          </div>

          <GlassCard
            variant="interactive"
            onClick={() => navigate(`/score/${lastSession.id}`)}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/12 flex items-center justify-center font-display font-extrabold text-[#34D399] text-lg">
                {lastSession.averageScore}
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-[#F5F7FA]">
                  {lastSession.poseName}
                </h4>
                <p className="text-xs text-[#64748B]">
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
