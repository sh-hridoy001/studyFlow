import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { AlertTriangle, X, Loader2, RotateCcw } from 'lucide-react';

interface ResetAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetAllDataModal: React.FC<ResetAllDataModalProps> = ({ isOpen, onClose }) => {
  const { resetAllUserData } = useStudy();
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setError(null);
    try {
      await resetAllUserData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reset data. Please check your connection.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Danger Zone
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Reset All Data?
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Are you sure you want to reset all data back to zero? This will permanently wipe all
          daily tasks, logged study hours, prayer records, and custom folders in your Firestore
          account, restoring the app to clean defaults.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Yes, Reset Everything</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
