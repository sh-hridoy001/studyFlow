import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { RotateCcw, X, Archive, CheckCircle2 } from 'lucide-react';

interface StartNewDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartNewDayModal: React.FC<StartNewDayModalProps> = ({ isOpen, onClose }) => {
  const { startNewDay, totalActualMinutes, completedTasksCount, totalTasksCount } = useStudy();
  const [archiveFirst, setArchiveFirst] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    startNewDay(archiveFirst);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <RotateCcw className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Start a Fresh Day?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
          This will reset today's tracked study hours back to 0 and uncheck your tasks so you can begin a new morning routine. All your subjects, topics, targets, and folders remain safely preserved in LocalStorage.
        </p>

        {/* Current status summary */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1 mb-5">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Today's tracked study hours:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {Math.floor(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Tasks completed:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {completedTasksCount} of {totalTasksCount}
            </span>
          </div>
        </div>

        {/* Archive checkbox */}
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer mb-6 select-none">
          <input
            type="checkbox"
            checked={archiveFirst}
            onChange={(e) => setArchiveFirst(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            <span>Save today's record to archive history</span>
          </span>
        </label>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
          >
            Start New Day
          </button>
        </div>
      </div>
    </div>
  );
};
