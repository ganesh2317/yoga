import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const { canPrompt, canShowIOSPrompt, isInstalled, promptInstall, dismiss } = usePWAInstall();

  if (isInstalled || (!canPrompt && !canShowIOSPrompt)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-surface-1 to-surface-2 p-4 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 overflow-hidden shadow-inner">
              <img src="/pwa-192x192.png" alt="YogaSense" className="w-9 h-9 object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-text-primary truncate flex items-center gap-1.5">
                Install YogaSense AI
              </h4>
              <p className="text-xs text-text-2 line-clamp-1">
                {canShowIOSPrompt
                  ? 'Add to Home Screen for the full app experience.'
                  : 'Fast launch and full-screen immersive practice.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canPrompt && (
              <button
                type="button"
                onClick={promptInstall}
                className="px-3.5 py-1.5 bg-accent hover:bg-accent/90 text-accent-fg text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {canShowIOSPrompt && (
              <div className="px-2.5 py-1 bg-surface-2 border border-border text-[11px] font-medium text-text-2 rounded-lg flex items-center gap-1">
                <Share className="w-3 h-3 text-accent" />
                <span>Share &gt; Add to Home</span>
              </div>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="p-1.5 text-text-3 hover:text-text-primary rounded-lg transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
