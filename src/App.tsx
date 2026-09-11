import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TrackingErrorBoundary } from './components/TrackingErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
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

const getTabIndex = (path: string): number => {
  if (path.startsWith('/home')) return 0;
  if (path.startsWith('/library')) return 1;
  if (path.startsWith('/free-track')) return 2;
  if (path.startsWith('/journey')) return 3;
  if (path.startsWith('/profile')) return 4;
  return -1;
};

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const AnimatedAppRoutes: React.FC = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const prevPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    const prevIdx = getTabIndex(prevPathRef.current);
    const currIdx = getTabIndex(location.pathname);

    if (prevIdx !== -1 && currIdx !== -1 && prevIdx !== currIdx) {
      setDirection(currIdx > prevIdx ? 1 : -1);
    } else {
      setDirection(0);
    }
    prevPathRef.current = location.pathname;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const pageVariants = {
    initial: (dir: number) => {
      if (shouldReduceMotion) return { opacity: 0 };
      if (dir === 1) return { opacity: 0, x: 16 };
      if (dir === -1) return { opacity: 0, x: -16 };
      return { opacity: 0, y: 8 };
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.08 : 0.18,
        ease: easeSmooth,
      },
    },
    exit: (dir: number) => {
      if (shouldReduceMotion) return { opacity: 0, transition: { duration: 0.06 } };
      if (dir === 1) {
        return {
          opacity: 0,
          x: -16,
          transition: { duration: 0.12, ease: easeSmooth },
        };
      }
      if (dir === -1) {
        return {
          opacity: 0,
          x: 16,
          transition: { duration: 0.12, ease: easeSmooth },
        };
      }
      return {
        opacity: 0,
        y: -6,
        transition: { duration: 0.12, ease: easeSmooth },
      };
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full flex-1"
      >
        <Routes location={location}>
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
      </motion.div>
    </AnimatePresence>
  );
};

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
      <ToastContainer />
      <main className="w-full min-h-screen flex flex-col overflow-x-hidden">{children}</main>
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
          <AnimatedAppRoutes />
        </MainLayout>
      </div>
    </BrowserRouter>
  );
}
export default App;
