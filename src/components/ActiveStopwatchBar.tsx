import React from 'react';
import { useStudy } from '../context/StudyContext';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { Play, Pause, Square, Clock } from 'lucide-react';

export const ActiveStopwatchBar: React.FC = () => {
  const { tasks, stopwatch, pauseStopwatch, toggleStopwatch, resetStopwatch } = useStudy();

  if (!stopwatch.taskId) return null;

  const currentTask = tasks.find((t) => t.id === stopwatch.taskId);
  if (!currentTask) return null;

  const folder = PRIMARY_FOLDERS[currentTask.folderId];

  const hours = Math.floor(stopwatch.secondsElapsed / 3600);
  const minutes = Math.floor((stopwatch.secondsElapsed % 3600) / 60);
  const seconds = stopwatch.secondsElapsed % 60;
  const formattedStopwatch = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <aside aria-label="Active Study Stopwatch" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-40 bg-slate-900 dark:bg-slate-800 text-white border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: folder.color }}
          />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">
              Tracking: {folder.name}
            </span>
            <h4 className="font-bold text-sm text-white truncate">
              {currentTask.subjectName}
            </h4>
          </div>
        </div>

        {/* Big Tabular Counter */}
        <div className="font-mono text-xl font-extrabold tracking-tight tabular-nums text-indigo-400 shrink-0">
          {formattedStopwatch}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
        <div className="text-[11px] text-slate-400 truncate">
          {currentTask.topics || 'Routine study session'}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => toggleStopwatch()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            title={stopwatch.isRunning ? 'Pause' : 'Resume'}
          >
            {stopwatch.isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          <button
            onClick={resetStopwatch}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Stop & Reset"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </aside>
  );
};
