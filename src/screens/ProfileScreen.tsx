import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Sun,
  Laptop,
  LogOut,
  Cpu,
  Smartphone,
  Download,
  CheckCircle2,
  Share,
} from 'lucide-react';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getTheme, setTheme, type Theme } from '../lib/theme';
import { getActiveModelTier } from '../lib/mediaPipeLoader';
import { saveUser, getUserSettings, saveUserSettings } from '../services/db';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [currentTheme, setCurrentThemeState] = useState<Theme>(getTheme());
  const [dailyGoal, setDailyGoal] = useState<number>(user?.dailyGoalMinutes || 20);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [modelTier] = useState<string>(getActiveModelTier() || 'mid');

  const { canPrompt, canShowIOSPrompt, isInstalled, promptInstall } = usePWAInstall();

  useEffect(() => {
    if (user) {
      getUserSettings(user.id).then((settings) => {
        if (settings) {
          if (settings.theme) setCurrentThemeState(settings.theme);
          setAudioFeedback(settings.audioFeedbackEnabled ?? true);
        }
      });
    }
  }, [user]);

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentThemeState(newTheme);
    setTheme(newTheme);
    if (user) {
      saveUserSettings({
        userId: user.id,
        dailyGoalMinutes: dailyGoal,
        audioFeedbackEnabled: audioFeedback,
        theme: newTheme,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleGoalChange = async (mins: number) => {
    setDailyGoal(mins);
    if (user) {
      const updated = { ...user, dailyGoalMinutes: mins };
      await saveUser(updated as any);
      await saveUserSettings({
        userId: user.id,
        dailyGoalMinutes: mins,
        audioFeedbackEnabled: audioFeedback,
        theme: currentTheme,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-28">
      <TopBar />

      <div>
        <Badge variant="accent">
          Settings & Account
        </Badge>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Profile & Preferences
        </h1>
      </div>

      {/* User Information Card */}
      <Surface variant="raised" className="p-6 flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold text-xl">
          {user?.name ? user.name[0].toUpperCase() : 'Y'}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-text-primary">
            {user?.name || 'Practitioner'}
          </h2>
          <p className="text-xs text-text-muted">{user?.email || 'guest@yogasense.ai'}</p>
        </div>
      </Surface>

      {/* Theme Selection */}
      <Surface variant="raised" className="p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Appearance Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex flex-col items-center p-3 rounded-xl border text-xs font-semibold transition-all ${
              currentTheme === 'dark'
                ? 'bg-primary-500/15 border-primary-500 text-primary-400'
                : 'bg-surface-2 border-surface-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Moon className="w-5 h-5 mb-1" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => handleThemeChange('light')}
            className={`flex flex-col items-center p-3 rounded-xl border text-xs font-semibold transition-all ${
              currentTheme === 'light'
                ? 'bg-primary-500/15 border-primary-500 text-primary-400'
                : 'bg-surface-2 border-surface-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sun className="w-5 h-5 mb-1" />
            <span>Light</span>
          </button>

          <button
            onClick={() => handleThemeChange('system')}
            className={`flex flex-col items-center p-3 rounded-xl border text-xs font-semibold transition-all ${
              currentTheme === 'system'
                ? 'bg-primary-500/15 border-primary-500 text-primary-400'
                : 'bg-surface-2 border-surface-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Laptop className="w-5 h-5 mb-1" />
            <span>System</span>
          </button>
        </div>
      </Surface>

      {/* Daily Goal Preferences */}
      <Surface variant="raised" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Daily Practice Target
          </h3>
          <span className="text-sm font-bold text-primary-400 tabular-nums">
            {dailyGoal} Minutes
          </span>
        </div>

        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={dailyGoal}
          onChange={(e) => handleGoalChange(Number(e.target.value))}
          className="w-full accent-primary-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-text-muted">
          <span>5 min</span>
          <span>20 min</span>
          <span>60 min</span>
        </div>
      </Surface>

      {/* App Installation & Offline Capabilities */}
      <Surface variant="raised" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              App & Installation
            </h3>
          </div>
          {isInstalled ? (
            <Badge variant="accent" size="sm">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Installed
            </Badge>
          ) : (
            <Badge variant="default" size="sm">
              Browser Web App
            </Badge>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-surface-border">
            <span className="text-text-secondary">App Shell & Library</span>
            <span className="font-semibold text-good">Offline Cached</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-surface-border">
            <span className="text-text-secondary">Install Status</span>
            <span className="font-semibold text-text-primary">
              {isInstalled ? 'Standalone Mode' : 'Ready to Install'}
            </span>
          </div>

          {!isInstalled && canPrompt && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={promptInstall}
              >
                <Download className="w-4 h-4" />
                <span>Install YogaSense App</span>
              </Button>
            </div>
          )}

          {!isInstalled && canShowIOSPrompt && (
            <div className="pt-1 flex items-start gap-2 bg-surface-2 p-3 rounded-xl border border-surface-border text-text-2">
              <Share className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-text-primary">Install on iOS Safari</div>
                <div className="text-[11px] mt-0.5">
                  Tap the <span className="font-medium text-text-primary">Share</span> button in Safari's toolbar, then scroll down and tap <span className="font-medium text-text-primary">'Add to Home Screen'</span>.
                </div>
              </div>
            </div>
          )}
        </div>
      </Surface>

      {/* Hardware & Diagnostics */}
      <Surface variant="raised" className="p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Vision Engine Diagnostics
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-surface-border">
            <span className="text-text-secondary flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-primary-400" /> Model Tier Selected
            </span>
            <span className="font-semibold uppercase text-primary-400">{modelTier}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-surface-border">
            <span className="text-text-secondary">Filtering Engine</span>
            <span className="font-semibold">One-Euro Adaptive Filter</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-secondary">Measurement Space</span>
            <span className="font-semibold">Metric World Coordinates</span>
          </div>
        </div>
      </Surface>

      {/* Logout Action */}
      <div className="pt-2">
        <Button variant="danger" size="md" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </div>
    </div>
  );
};
