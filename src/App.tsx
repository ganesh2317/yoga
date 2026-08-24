import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { FreeTrackScreen } from './screens/FreeTrackScreen';
import { LiveDetectScreen } from './screens/LiveDetectScreen';
import { ScoreScreen } from './screens/ScoreScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideBottomNav =
    ['/login', '/register'].includes(location.pathname) ||
    location.pathname === '/live' ||
    location.pathname.startsWith('/live/');

  return (
    <>
      <main>{children}</main>
      {!hideBottomNav && <BottomNav />}
    </>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen font-sans bg-bg-darkest text-text-primary overflow-x-hidden">
        <BackgroundBlobs />

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
              path="/live"
              element={
                <ProtectedRoute>
                  <FreeTrackScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/live/:poseId"
              element={
                <ProtectedRoute>
                  <LiveDetectScreen />
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
