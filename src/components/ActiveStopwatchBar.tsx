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

  // Find folder from all dynamic folders (safe for custom folders like "Programming")
  const currentFolderId = stopwatch.folderId || currentTask?.folderId;
  const folder =
    folders.find((f) => String(f.id) === String(currentFolderId)) || {
      name: 'Study Folder',
      color: '#4F46E5',
    };

  const subjectTitle =
    currentTask?.subjectName ||
    stopwatch.subjectName ||
    `${folder.name} Study Session`;

  const topicSubtitle = currentTask?.topics || 'Folder study session in progress';

  const hours = Math.floor(stopwatch.secondsElapsed / 3600);
  const minutes = Math.floor((stopwatch.secondsElapsed % 3600) / 60);
  const seconds = stopwatch.secondsElapsed % 60;
  const formattedStopwatch = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      role="region"
      aria-label="Active Study Timer"
      className="sticky top-16 z-30 w-full bg-slate-900/95 dark:bg-slate-900/95 text-white border-b border-indigo-500/30 backdrop-blur-md shadow-lg transition-all animate-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Subject & Folder Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                stopwatch.isRunning ? 'animate-pulse' : 'opacity-80'
              }`}
              style={{ backgroundColor: folder.color }}
            >
              <Timer className="w-4 h-4" />
            </div>
            {stopwatch.isRunning && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 animate-ping"
                style={{ backgroundColor: folder.color }}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border"
                style={{
                  color: folder.color,
                  borderColor: `${folder.color}50`,
                  backgroundColor: `${folder.color}20`,
                }}
              >
                {folder.name}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {stopwatch.isRunning ? '• Live Study Timer' : '• Paused'}
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight mt-0.5">
              {subjectTitle}
            </h4>
          </div>
        </div>

        {/* Right: Big Counter & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {/* Digital Timer Display */}
          <div className="font-mono text-lg sm:text-2xl font-black tracking-tight tabular-nums px-2.5 sm:px-3 py-1 bg-slate-950/70 border border-slate-700/60 rounded-xl text-indigo-400 shadow-inner">
            {formattedStopwatch}
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={() => toggleStopwatch()}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              stopwatch.isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title={stopwatch.isRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {stopwatch.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>

          {/* Stop & Save Button (100% saves time immediately) */}
          <button
            type="button"
            onClick={stopAndSaveStopwatch}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Stop timer and save study time"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Save Time</span>
          </button>

          {/* Cancel / Reset */}
          <button
            type="button"
            onClick={() => {
              if (
                stopwatch.secondsElapsed < 15 ||
                confirm('Stop and save study time for this session?')
              ) {
                stopAndSaveStopwatch();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close / Finish"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
