import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Target, Shield, Flame, Check } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateDailyGoal } = useAuthStore();
  const { streak } = useSessionStore();

  const [dailyGoalInput, setDailyGoalInput] = useState<number>(user?.dailyGoalMinutes || 20);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGoal = () => {
    updateDailyGoal(dailyGoalInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-5">
      <TopBar title="User Profile" />

      {/* User Info Header Card */}
      <GlassCard variant="glow" glowColor="green" className="p-6 text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent-green to-accent-emerald mx-auto flex items-center justify-center font-display font-extrabold text-3xl text-bg-darkest shadow-green-glow">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
        </div>

        <div>
          <h2 className="font-display font-extrabold text-2xl text-text-primary">
            {user?.name || 'Yogi User'}
          </h2>
          <p className="text-xs text-text-secondary">{user?.email || 'demo@yogasense.ai'}</p>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-text-tertiary">
          <Shield className="w-4 h-4 text-accent-emerald" />
          <span>Local Encrypted Session Active</span>
        </div>
      </GlassCard>

      {/* Daily Practice Goal Settings */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Practice Goal Configuration
        </h3>

        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-green/20 border border-accent-green/30 flex items-center justify-center text-accent-mint">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary">Daily Goal Target</h4>
                <p className="text-xs text-text-tertiary">Target practice duration per day</p>
              </div>
            </div>

            <span className="font-display font-extrabold text-lg text-accent-emerald">
              {dailyGoalInput} min
            </span>
          </div>

          {/* Goal options */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setDailyGoalInput(mins)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  dailyGoalInput === mins
                    ? 'bg-accent-green text-bg-darkest shadow-md shadow-accent-green/30'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                }`}
              >
                {mins} m
              </button>
            ))}
          </div>

          <GlassButton
            onClick={handleSaveGoal}
            variant="secondary"
            fullWidth
            size="sm"
            leftIcon={savedSuccess ? <Check className="w-4 h-4 text-accent-green" /> : undefined}
          >
            {savedSuccess ? 'Goal Saved!' : 'Save Practice Target'}
          </GlassButton>
        </GlassCard>
      </div>

      {/* Account Habit Overview */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Habit Metrics
        </h3>

        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/10">
            <span className="text-text-secondary">Current Active Streak</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {streak.currentStreak} Days
            </span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/10">
            <span className="text-text-secondary">Total Logged Sessions</span>
            <span className="font-bold text-text-primary">{streak.totalSessions}</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-text-secondary">Total Practice Time</span>
            <span className="font-bold text-accent-emerald">{streak.totalMinutes} Mins</span>
          </div>
        </GlassCard>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <GlassButton
          onClick={handleLogout}
          variant="danger"
          size="lg"
          fullWidth
          leftIcon={<LogOut className="w-5 h-5" />}
        >
          Sign Out of YogaSense AI
        </GlassButton>
      </div>
    </div>
  );
};
