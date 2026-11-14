import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Play, Pause, Square, Check, Plus, Timer, BookOpen } from 'lucide-react';

export const ActiveStopwatchBar: React.FC = () => {
  const {
    folders,
    tasks,
    stopwatch,
    pauseStopwatch,
    toggleStopwatch,
    stopAndSaveStopwatch,
    resetStopwatch,
  } = useStudy();

  // Show if timer is running OR has accumulated seconds
  if (!stopwatch.isRunning && stopwatch.secondsElapsed === 0) {
    return null;
  }

  // Find linked task if any
  const currentTask = stopwatch.taskId
    ? tasks.find((t) => String(t.id) === String(stopwatch.taskId))
    : null;

  // Find folder from all dynamic folders (safe for custom folders & general tasks)
  const currentFolderId = stopwatch.folderId || currentTask?.folderId;
  const folder =
    currentFolderId === 'general'
      ? { name: 'General', color: '#6366F1' }
      : folders.find((f) => String(f.id) === String(currentFolderId)) || {
          name: 'General',
          color: '#6366F1',
        };

  const subjectTitle =
    currentTask?.subjectName ||
    stopwatch.subjectName ||
    `${folder.name} Study Session`;

  const hours = Math.floor(stopwatch.secondsElapsed / 3600);
  const minutes = Math.floor((stopwatch.secondsElapsed % 3600) / 60);
  const seconds = stopwatch.secondsElapsed % 60;
  const formattedStopwatch = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      role="region"
      aria-label="Active Study Timer"
      className="sticky top-[57px] z-30 w-full bg-white/95 dark:bg-[#12131c]/95 text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#242636] backdrop-blur-md shadow-sm transition-all animate-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-2 flex items-center justify-between gap-2.5">
        {/* Left: Active Subject & Folder Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${
              stopwatch.isRunning ? 'animate-pulse' : 'opacity-80'
            }`}
            style={{ backgroundColor: folder.color }}
          >
            <Timer className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span style={{ color: folder.color }}>{folder.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">
                {stopwatch.isRunning ? 'Running' : 'Paused'}
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate leading-tight mt-0.5">
              {subjectTitle}
            </h4>
          </div>
        </div>

        {/* Right: Counter & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <div className="font-mono text-sm sm:text-base font-extrabold tracking-tight tabular-nums px-2.5 py-1 bg-slate-100 dark:bg-[#191b28] border border-slate-200 dark:border-[#2a2d40] rounded-xl text-[var(--app-accent)]">
            {formattedStopwatch}
          </div>

          <button
            type="button"
            onClick={() => toggleStopwatch()}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              stopwatch.isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white'
            }`}
            title={stopwatch.isRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {stopwatch.isRunning ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={stopAndSaveStopwatch}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Save study time"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
