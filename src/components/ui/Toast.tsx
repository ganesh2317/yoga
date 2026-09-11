import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'warning' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

let toastIdCounter = 0;
let addToastExternal: ((message: string, variant?: ToastVariant) => void) | null = null;

/**
 * Show a toast notification from anywhere in the app.
 */
export function showToast(message: string, variant: ToastVariant = 'info'): void {
  addToastExternal?.(message, variant);
}

const icons: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-good/30 text-good',
  warning: 'border-slight/30 text-slight',
  error: 'border-poor/30 text-poor',
  info: 'border-accent/30 text-accent',
};

/**
 * ToastContainer — renders at the top of the app to display toast notifications.
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    addToastExternal = (message: string, variant: ToastVariant = 'info') => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    return () => { addToastExternal = null; };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                flex items-center gap-2.5 px-4 py-3
                bg-bg-elev border rounded-card shadow-2
                text-label
                ${variantStyles[toast.variant]}
              `}
              role="alert"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-text text-label">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
