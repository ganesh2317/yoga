import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Flame, Target, Shield } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateDailyGoal } = useAuthStore();
  const { streak } = useSessionStore();
  const [goal, setGoal] = useState(user?.dailyGoalMinutes || 20);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveGoal = async () => {
    await updateDailyGoal(goal);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="User Profile" showBack onBack={() => navigate('/home')} />

      {/* User Header Focal Card */}
      <GlassCard variant="focal" glowColor="emerald" className="p-6 text-center flex flex-col items-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22C55E] to-[#34D399] border-2 border-[#34D399]/50 text-[#0A0E14] flex items-center justify-center font-display font-extrabold text-3xl shadow-lg shadow-[#22C55E]/30">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
        </div>

        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#F5F7FA]">
            {user?.name || 'Yogi Practitioner'}
          </h2>
          <p className="text-xs text-[#94A3B8] font-medium">{user?.email || 'yogi@yogasense.ai'}</p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FBBF24] text-xs font-bold">
            <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span>{streak.currentStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#34D399] text-xs font-bold">
            <Shield className="w-4 h-4 text-[#34D399]" />
            <span>Local IndexedDB</span>
          </div>
        </div>
      </GlassCard>

      {/* Daily Goal Settings Card */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#F59E0B] stroke-[1.75px]" />
            <h3 className="font-display font-bold text-base text-[#F5F7FA]">
              Daily Goal Minutes
            </h3>
          </div>
          <span className="font-display font-bold text-lg text-[#F59E0B]">{goal} min</span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full accent-[#22C55E] bg-white/10 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#64748B]">
            <span>5 mins</span>
            <span>30 mins</span>
            <span>60 mins</span>
          </div>
        </div>

        <GlassButton
          onClick={handleSaveGoal}
          variant="primary"
          size="md"
          fullWidth
        >
          {isSaved ? 'Goal Saved!' : 'Update Practice Goal'}
        </GlassButton>
      </GlassCard>

      {/* App Info Card */}
      <GlassCard className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#64748B]">Vision Engine</span>
          <span className="text-[#F5F7FA] font-semibold">MediaPipe PoseLandmarker (Heavy GPU)</span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
          <span className="text-[#64748B]">Persistence</span>
          <span className="text-[#F5F7FA] font-semibold">IndexedDB (idb v8)</span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
          <span className="text-[#64748B]">Version</span>
          <span className="text-[#F59E0B] font-mono font-bold">Round 4 Refined v4.0</span>
        </div>
      </GlassCard>

      {/* Logout Action */}
      <GlassButton
        onClick={handleLogout}
        variant="danger"
        size="lg"
        fullWidth
        leftIcon={<LogOut className="w-5 h-5" />}
      >
        Sign Out
      </GlassButton>
    </div>
  );
};
