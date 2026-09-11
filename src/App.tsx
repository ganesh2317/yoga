import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TrackingErrorBoundary } from './components/TrackingErrorBoundary';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { JourneyScreen } from './screens/JourneyScreen';
import { FreeTrackScreen } from './screens/FreeTrackScreen';
import { LiveDetectScreen } from './screens/LiveDetectScreen';
import { ScoreScreen } from './screens/ScoreScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FlowListScreen } from './screens/FlowListScreen';
import { FlowSessionScreen } from './screens/FlowSessionScreen';
import { initTheme } from './lib/theme';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideBottomNav =
    ['/login', '/register'].includes(location.pathname) ||
    location.pathname === '/live' ||
    location.pathname.startsWith('/live/') ||
    location.pathname.startsWith('/flow/') ||
    location.pathname === '/free-track';

  return (
    <>
      <main className="w-full">{children}</main>
      {!hideBottomNav && <BottomNav />}
    </>
  );
};

export function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text-primary">
        <MainLayout>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <LibraryScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/journey"
              element={
                <ProtectedRoute>
                  <JourneyScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/free-track"
              element={
                <ProtectedRoute>
                  <TrackingErrorBoundary>
                    <FreeTrackScreen />
                  </TrackingErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/live/:poseId"
              element={
                <ProtectedRoute>
                  <TrackingErrorBoundary>
                    <LiveDetectScreen />
                  </TrackingErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/score"
              element={
                <ProtectedRoute>
                  <ScoreScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/score/:sessionId"
              element={
                <ProtectedRoute>
                  <ScoreScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/feedback/:sessionId"
              element={
                <ProtectedRoute>
                  <FeedbackScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/flows"
              element={
                <ProtectedRoute>
                  <FlowListScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/flow/:flowId"
              element={
                <ProtectedRoute>
                  <TrackingErrorBoundary>
                    <FlowSessionScreen />
                  </TrackingErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </MainLayout>
      </div>
    </BrowserRouter>
  );
}
export default App;
