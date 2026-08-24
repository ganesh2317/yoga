import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const { fetchUserSessions } = useSessionStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchUserSessions(user.id, user.dailyGoalMinutes);
    }
  }, [user, fetchUserSessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-darkest text-text-primary">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-green to-accent-emerald flex items-center justify-center animate-pulse shadow-green-glow">
          <span className="font-display font-extrabold text-bg-darkest text-2xl">Y</span>
        </div>
        <p className="mt-4 text-sm font-medium text-text-secondary animate-pulse">
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
