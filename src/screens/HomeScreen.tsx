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
  const { todayMinutes, streak, sessions, getLastSession } = useSessionStore();

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

      {/* Editorial Serif Header Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex items-end justify-between pt-1"
      >
        <div>
          <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest block mb-1">
            Personal Practice
          </span>
          <h2 className="font-serif font-extrabold text-3xl text-[#F4F1EC] tracking-tight">
            {getGreeting()}, <span className="italic text-[#C9A66B] font-semibold">{userName}</span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9A66B]/15 border border-[#C9A66B]/30 text-[#E2C389] text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
          <span>{streak.currentStreak}d Streak</span>
        </div>
      </motion.div>

      {/* Boutique Hero Glass Card */}
      <GlassCard variant="focal" glowColor="forest" className="p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#3F6B4F]/15 blur-3xl pointer-events-none" />
        <div className="flex flex-col space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3F6B4F]/20 text-[#88C49D] text-xs font-bold border border-[#3F6B4F]/40">
              <Sparkles className="w-3.5 h-3.5" /> Real-Time CV Engine
            </span>
            <span className="text-[11px] font-semibold text-[#A8A29B]">8 Reference Poses</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-extrabold text-2xl text-[#F4F1EC] tracking-tight leading-snug">
              Perfect Your Pose Form
            </h3>
            <p className="text-xs text-[#A8A29B] leading-relaxed">
              Align your joints live in front of your camera with gentle, plain-English posture guidance.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <GlassButton
              onClick={() => navigate('/live')}
              variant="primary"
              size="md"
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Free Practice
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

      {/* Asymmetric Habit Section */}
      <div className="grid grid-cols-5 gap-3">
        {/* Today's Goal Ring */}
        <GlassCard className="col-span-3 p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-[#A8A29B] uppercase tracking-widest mb-3">
            Today's Goal
          </span>
          <CircularProgressRing
            value={todayMinutes}
            max={dailyGoal}
            size={120}
            strokeWidth={9}
            colorScheme="forest"
          >
            <span className="font-serif font-extrabold text-3xl text-[#88C49D]">
              {todayMinutes}
            </span>
            <span className="text-[10px] font-medium text-[#A8A29B]">/{dailyGoal} min</span>
          </CircularProgressRing>
          <span className="text-[11px] text-[#A8A29B] mt-3 font-medium">
            {todayMinutes >= dailyGoal ? 'Goal Completed 🎉' : `${dailyGoal - todayMinutes} mins remaining`}
          </span>
        </GlassCard>

        {/* Unboxed Lifetime Stats Panel */}
        <div className="col-span-2 flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <span className="text-[10px] font-bold text-[#635E58] uppercase tracking-widest">
            Summary
          </span>

          <div className="space-y-3 my-1">
            <div>
              <span className="text-[11px] text-[#635E58] block">Sessions</span>
              <p className="font-serif font-extrabold text-2xl text-[#F4F1EC]">
                {streak.totalSessions}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[#635E58] block">Total Time</span>
              <p className="font-serif font-extrabold text-2xl text-[#88C49D]">
                {streak.totalMinutes}<span className="text-xs text-[#A8A29B] font-normal ml-0.5">m</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] text-[#635E58]">Updated live</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <GlassCard
            variant="interactive"
            onClick={() => navigate('/library')}
            className="p-4 flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-[#3F6B4F]/20 border border-[#3F6B4F]/40 text-[#88C49D] flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#F4F1EC]">Pose Library</h4>
              <p className="text-[11px] text-[#635E58] mt-0.5">8 Reference Poses</p>
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            onClick={() => navigate('/live')}
            className="p-4 flex flex-col justify-between h-28 border-[#C9A66B]/30 bg-[#C9A66B]/5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C9A66B]/20 border border-[#C9A66B]/40 text-[#C9A66B] flex items-center justify-center">
              <Camera className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#F4F1EC]">Auto Detect</h4>
              <p className="text-[11px] text-[#635E58] mt-0.5">Free Practice Mode</p>
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            onClick={() => navigate('/progress')}
            className="p-4 flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-[#3F6B4F]/20 border border-[#3F6B4F]/40 text-[#88C49D] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#F4F1EC]">Analytics</h4>
              <p className="text-[11px] text-[#635E58] mt-0.5">Score Trends & Charts</p>
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            onClick={() => navigate('/history')}
            className="p-4 flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C9A66B]/20 border border-[#C9A66B]/40 text-[#C9A66B] flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#F4F1EC]">History</h4>
              <p className="text-[11px] text-[#635E58] mt-0.5">{sessions.length} Logged</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Practice Card */}
      {lastSession && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
              Last Session
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-[#C9A66B] font-semibold hover:underline"
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
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/12 flex items-center justify-center font-serif font-extrabold text-[#88C49D] text-lg">
                {lastSession.averageScore}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#F4F1EC]">
                  {lastSession.poseName}
                </h4>
                <p className="text-xs text-[#635E58]">
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
