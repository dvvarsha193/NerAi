import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useOfflineStore } from '../../store/useOfflineStore';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useOfflineStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed top-20 right-6 z-50 max-w-md w-full pointer-events-auto"
        >
          <div
            className={`p-4 rounded-2xl shadow-xl border bg-white ${
              toastMessage.type === 'success'
                ? 'border-emerald-200 text-slate-800'
                : toastMessage.type === 'warning'
                ? 'border-amber-200 text-slate-800'
                : 'border-blue-200 text-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />}
                {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">{toastMessage.title}</div>
                <div className="text-xs mt-0.5 text-slate-500 leading-relaxed">{toastMessage.desc}</div>
              </div>

              <button
                onClick={clearToast}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
