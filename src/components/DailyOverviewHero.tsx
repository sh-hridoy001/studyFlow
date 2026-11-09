import React from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/dateUtils';
import {
  CheckCircle2,
  TrendingUp,
  Plus,
  RotateCcw,
  Calendar,
} from 'lucide-react';

interface DailyOverviewHeroProps {
  onOpenAddTask: () => void;
  onOpenResetDay: () => void;
  onOpenSyncCalendar: () => void;
}

export const DailyOverviewHero: React.FC<DailyOverviewHeroProps> = ({
  onOpenAddTask,
  onOpenResetDay,
  onOpenSyncCalendar,
}) => {
  const {
    totalTargetMinutes,
    totalActualMinutes,
    overallPercent,
    completedTasksCount,
    totalTasksCount,
    folderStats,
    folders,
  } = useStudy();

  const formattedActual = formatDuration(totalActualMinutes);
  const formattedTarget = formatDuration(totalTargetMinutes);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs relative overflow-hidden w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex-wrap">
            <span>Daily Routine & Time Tracker</span>
            <span aria-hidden="true">·</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            Today's Study Progress
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={onOpenSyncCalendar}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
            title="Export completed study sessions to Google Calendar"
          >
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Sync Today's Log to </span>
            <span>Calendar</span>
          </button>

          <button
            onClick={onOpenResetDay}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            title="Start New Day or reset today's study progress"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Start New Day</span>
            <span className="sm:hidden">Reset Day</span>
          </button>
        </div>
      </div>

      {/* Big Numbers & Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-end mb-6">
        <div className="md:col-span-7">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Total Actual Study Time Completed Today
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl sm:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
              {formattedActual}
            </span>
            <span className="text-sm sm:text-lg font-mono text-slate-500 dark:text-slate-400">
              / {formattedTarget} target
            </span>
          </div>
        </div>

        <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-5 sm:gap-6 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {completedTasksCount} of {totalTasksCount}
              </div>
              <div className="text-[11px] text-slate-400">Tasks Checked</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {overallPercent}%
              </div>
              <div className="text-[11px] text-slate-400">Routine Met</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Segmented Color-Coded Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 sm:h-3.5 rounded-full overflow-hidden flex shadow-inner">
          {folders.map((folder) => {
            const stats = folderStats[folder.id];
            if (!stats || stats.actualMinutes === 0) return null;
            const widthPct =
              totalTargetMinutes > 0
                ? Math.min(100, (stats.actualMinutes / totalTargetMinutes) * 100)
                : 0;

            return (
              <div
                key={folder.id}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: folder.color,
                }}
                title={`${folder.name}: ${formatDuration(stats.actualMinutes)} (${Math.round(widthPct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {folders.map((folder) => {
              const stats = folderStats[folder.id];
              return (
                <div key={folder.id} className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {folder.name}
                  </span>
                  <span className="font-mono text-slate-400">
                    ({formatDuration(stats?.actualMinutes || 0)})
                  </span>
                </div>
              );
            })}
          </div>

          <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 ml-auto">
            {overallPercent}% overall completion
          </span>
        </div>
      </div>
    </div>
  );
};
