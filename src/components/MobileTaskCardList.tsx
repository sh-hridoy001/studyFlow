import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask } from '../types';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Plus,
  BookOpen,
  ChevronRight,
  Check,
} from 'lucide-react';

interface MobileTaskCardListProps {
  onOpenAddTask: () => void;
  onEditTask: (task: DailyTask) => void;
  onViewTask: (task: DailyTask) => void;
  homeMode?: boolean;
}

export const MobileTaskCardList: React.FC<MobileTaskCardListProps> = ({
  onOpenAddTask,
  onViewTask,
  homeMode = false,
}) => {
  const {
    tasks,
    folders,
    stopwatch,
    toggleTaskComplete,
    startStopwatch,
    pauseStopwatch,
    completedTasksCount,
    totalTasksCount,
    setActiveTab,
  } = useStudy();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  // In homeMode: completed tasks are automatically removed from the Home list!
  const filteredTasks = homeMode
    ? tasks.filter((t) => !t.completed)
    : tasks.filter((t) => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      });

  return (
    <div className="w-full bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 shadow-xs text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {homeMode ? "Today's Active Tasks" : "Today's Tasks"}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--app-accent-soft)] text-[var(--app-accent)] border border-[var(--app-accent)]/30">
              {completedTasksCount}/{totalTasksCount} Done
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {homeMode
              ? 'Check off a task to complete & clear it from Home.'
              : 'Tap play to focus, or check off finished tasks.'}
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--app-accent-soft)] hover:opacity-90 border border-[var(--app-accent)]/30 text-[var(--app-accent)] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
          title="Add new task"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Filter Tabs (Shown in dedicated Tasks tab; hidden on Home screen) */}
      {!homeMode && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1b1c27] border border-slate-200 dark:border-[#282b3c] rounded-xl mb-3 max-w-xs">
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-white dark:bg-[#292c3e] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active ({totalTasksCount - completedTasksCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white dark:bg-[#292c3e] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Done ({completedTasksCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-[#292c3e] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({totalTasksCount})
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl bg-slate-50 dark:bg-[#191b26] border border-dashed border-slate-200 dark:border-[#292c3d]">
            <BookOpen className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-60" />
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
              {homeMode && completedTasksCount > 0
                ? 'All scheduled tasks completed!'
                : 'No active tasks'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {homeMode && completedTasksCount > 0
                ? 'Great work today! Add another task or review completed ones in Tasks.'
                : 'Tap "+ Add Today\'s Target Task" above to plan your study.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const folder = folders.find((f) => String(f.id) === String(task.folderId));
            const isStopwatchRunningThis =
              stopwatch.isRunning && String(stopwatch.taskId) === String(task.id);
            const progress =
              task.targetMinutes > 0
                ? Math.min(100, Math.round((task.actualMinutes / task.targetMinutes) * 100))
                : 0;

            return (
              <div
                key={task.id}
                className={`group relative p-3 rounded-xl border transition-all ${
                  isStopwatchRunningThis
                    ? 'bg-[var(--app-accent-soft)] border-[var(--app-accent)]/50 shadow-xs ring-1 ring-[var(--app-accent)]/30'
                    : task.completed
                    ? 'bg-slate-50 dark:bg-[#181924]/60 border-slate-200 dark:border-[#222434] opacity-75'
                    : 'bg-slate-50/70 dark:bg-[#191a25] hover:bg-slate-100/80 dark:hover:bg-[#1d1f2c] border-slate-200 dark:border-[#262838]'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  {/* Left: Completion Checkbox & Details */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${
                        task.completed
                          ? 'text-emerald-500 hover:text-emerald-400'
                          : 'text-slate-400 hover:text-emerald-500'
                      }`}
                      title={task.completed ? 'Mark incomplete' : 'Mark completed (removes from Home)'}
                      aria-label="Toggle completed"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div
                      onClick={() => onViewTask(task)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: folder?.color || '#6366F1' }}
                        />
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.subjectName}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">·</span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                          {folder ? folder.name : 'General'}
                        </span>
                      </div>

                      {task.topics && task.topics.trim().length > 0 && (
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {task.topics}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-[#27293a] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              task.completed
                                ? 'bg-emerald-500'
                                : isStopwatchRunningThis
                                ? 'bg-[var(--app-accent)]'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0">
                          {task.actualMinutes}/{task.targetMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={() => {
                        if (isStopwatchRunningThis) {
                          pauseStopwatch();
                        } else {
                          startStopwatch(task.id, task.folderId);
                        }
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                        isStopwatchRunningThis
                          ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-white shadow-sm animate-pulse'
                          : 'bg-white dark:bg-[#222434] hover:bg-slate-100 dark:hover:bg-[#2b2d42] border-slate-200 dark:border-[#2e3146] text-slate-700 dark:text-slate-300'
                      }`}
                      title={isStopwatchRunningThis ? 'Pause Timer' : 'Start Focus Timer'}
                      aria-label="Play or Pause"
                    >
                      {isStopwatchRunningThis ? (
                        <Pause className="w-3.5 h-3.5 fill-white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onViewTask(task)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#222434] transition-colors cursor-pointer"
                      title="View Details"
                      aria-label="View task details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subtle Link in Home Mode if any tasks were completed today */}
      {homeMode && completedTasksCount > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#202231] flex items-center justify-between text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {completedTasksCount} task{completedTasksCount > 1 ? 's' : ''} completed today
          </span>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-slate-500 dark:text-slate-400 hover:text-[var(--app-accent)] font-semibold cursor-pointer"
          >
            View in Tasks →
          </button>
        </div>
      )}
    </div>
  );
};
