import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, LogOut, Layers } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import { Surface } from './ui/Surface';
import { Button } from './ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    initialize,
    user,
    error,
    isBlocked,
    blockedMessage,
    retry,
    logout,
  } = useAuthStore();
  const { fetchUserSessions } = useSessionStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Local fallback timer in case something else stalls
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadTimedOut(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setLoadTimedOut(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (user) {
      fetchUserSessions(user.id, user.dailyGoalMinutes);
    }
  }, [user, fetchUserSessions]);

  // If blocked or initialization error or loading timed out, show clear recovery UI
  if ((!isLoading && error) || isBlocked || (isLoading && loadTimedOut)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary p-4">
        <Surface variant="raised" className="max-w-md w-full p-6 md:p-8 space-y-5 text-center shadow-2xl border-poor/40 animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-poor-soft border border-poor flex items-center justify-center text-poor mx-auto">
            {isBlocked ? (
              <Layers className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-text">
              {isBlocked
                ? 'Database Upgrade Blocked by Another Tab'
                : 'Session Restoration Stalled'}
            </h2>
            <p className="text-xs md:text-sm text-text-3 leading-relaxed">
              {blockedMessage ||
                error ||
                'YogaSense is taking longer than expected to access local storage. If another YogaSense tab is open, please close it and retry.'}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-primary-500/25"
              onClick={() => {
                setLoadTimedOut(false);
                retry();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-3 hover:text-text"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Continue to Login
            </Button>
          </div>
        </Surface>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary">
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center animate-pulse shadow-1">
          <span className="font-display font-bold text-accent-fg text-2xl">Y</span>
        </div>
        <p className="mt-4 text-sm font-medium text-text-2 animate-pulse">
          Restoring your YogaSense AI session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

