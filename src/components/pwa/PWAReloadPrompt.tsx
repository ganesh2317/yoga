import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates periodically (e.g., every 60 mins)
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(needRefresh || offlineReady) && (
        <motion.aside
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 pointer-events-auto"
          aria-live="polite"
        >
          <div className="bg-surface-2/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3 text-text-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                {needRefresh ? <Sparkles className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {needRefresh ? 'Update Available' : 'Ready to work offline'}
                </div>
                <div className="text-xs text-text-2">
                  {needRefresh
                    ? 'A new version is ready. Refresh when you finish.'
                    : 'App shell cached for instant offline launch.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {needRefresh && (
                <button
                  type="button"
                  onClick={() => updateServiceWorker(true)}
                  className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-accent-fg text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="p-1.5 text-text-3 hover:text-text-primary rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
