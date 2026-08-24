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
      <GlassCard variant="focal" glowColor="forest" className="p-6 text-center flex flex-col items-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-[#3F6B4F] border-2 border-[#88C49D]/40 text-[#F4F1EC] flex items-center justify-center font-serif font-extrabold text-3xl shadow-lg shadow-[#3F6B4F]/30">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
        </div>

        <div>
          <h2 className="font-serif font-extrabold text-2xl text-[#F4F1EC]">
            {user?.name || 'Yogi Practitioner'}
          </h2>
          <p className="text-xs text-[#A8A29B] font-medium">{user?.email || 'yogi@yogasense.ai'}</p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9A66B]/15 border border-[#C9A66B]/30 text-[#E2C389] text-xs font-bold">
            <Flame className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
            <span>{streak.currentStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3F6B4F]/20 border border-[#3F6B4F]/40 text-[#88C49D] text-xs font-bold">
            <Shield className="w-4 h-4 text-[#88C49D]" />
            <span>Local IndexedDB</span>
          </div>
        </div>
      </GlassCard>

      {/* Daily Goal Settings Card */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#C9A66B] stroke-[1.5px]" />
            <h3 className="font-serif font-bold text-base text-[#F4F1EC]">
              Daily Goal Minutes
            </h3>
          </div>
          <span className="font-serif font-bold text-lg text-[#C9A66B]">{goal} min</span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full accent-[#3F6B4F] bg-white/10 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#635E58]">
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
          <span className="text-[#635E58]">Vision Engine</span>
          <span className="text-[#F4F1EC] font-semibold">MediaPipe PoseLandmarker (WASM)</span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
          <span className="text-[#635E58]">Persistence</span>
          <span className="text-[#F4F1EC] font-semibold">IndexedDB (idb v8)</span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
          <span className="text-[#635E58]">Version</span>
          <span className="text-[#C9A66B] font-mono font-bold">Round 3 Refined v3.0</span>
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
