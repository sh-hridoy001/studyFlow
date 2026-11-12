import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask } from '../types';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Clock,
  MoreVertical,
  Plus,
  BookOpen,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';
import { formatDuration } from '../utils/dateUtils';

interface MobileTaskCardListProps {
  onOpenAddTask: () => void;
  onEditTask: (task: DailyTask) => void;
  onViewTask: (task: DailyTask) => void;
}

export const MobileTaskCardList: React.FC<MobileTaskCardListProps> = ({
  onOpenAddTask,
  onEditTask,
  onViewTask,
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
  } = useStudy();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="w-full bg-[#151620] dark:bg-[#12131b] border border-[#232533] rounded-[32px] p-5 sm:p-6 shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Today's Tasks
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/30">
              {completedTasksCount}/{totalTasksCount} Done
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tap play to focus on a task, or checkmark when completed.
          </p>
        </div>

        {/* Small Add Task button */}
        <button
          onClick={onOpenAddTask}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#ff4757]/15 hover:bg-[#ff4757]/25 border border-[#ff4757]/40 text-[#ff4757] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          title="Add new task"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Filter Tabs (All / Active / Completed) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1b1c27] border border-[#282b3c] rounded-2xl mb-4 max-w-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#292c3e] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({totalTasksCount})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-[#292c3e] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active ({totalTasksCount - completedTasksCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#292c3e] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Done ({completedTasksCount})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-[#1b1d29] border border-dashed border-[#292c3d]">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-slate-300 font-bold">No tasks in this view</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {filter === 'completed'
                ? 'Check off tasks as you finish them!'
                : 'Click "+ Add Today\'s Task" at the top to set your goals.'}
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
                className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isStopwatchRunningThis
                    ? 'bg-[#1e1a24] border-[#ff4757]/50 shadow-md ring-1 ring-[#ff4757]/30'
                    : task.completed
                    ? 'bg-[#181924]/60 border-[#222434] opacity-75'
                    : 'bg-[#191a25] hover:bg-[#1d1f2c] border-[#262838]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Completion Checkbox & Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${
                        task.completed
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                      aria-label="Toggle completed"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Task Info (Click to View) */}
                    <div
                      onClick={() => onViewTask(task)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      {/* Subject & Folder Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: folder?.color || '#ff4757' }}
                        />
                        <span className="text-xs font-bold text-slate-300 truncate">
                          {task.subjectName}
                        </span>
                        {folder && (
                          <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded-md bg-[#242738]">
                            {folder.name}
                          </span>
                        )}
                      </div>

                      {/* Topic Title */}
                      <p
                        className={`text-sm font-semibold mt-1 truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.topics}
                      </p>

                      {/* Time Progress Bar */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#27293a] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              task.completed
                                ? 'bg-emerald-500'
                                : isStopwatchRunningThis
                                ? 'bg-[#ff4757]'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0">
                          {task.actualMinutes}/{task.targetMinutes}m ({progress}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Instant Play / Pause Timer */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <button
                      onClick={() => {
                        if (isStopwatchRunningThis) {
                          pauseStopwatch();
                        } else {
                          startStopwatch(task.id, task.folderId);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                        isStopwatchRunningThis
                          ? 'bg-[#ff4757] border-[#ff4757] text-white shadow-md animate-pulse'
                          : 'bg-[#222434] hover:bg-[#2b2d42] border-[#2e3146] text-slate-300 hover:text-white'
                      }`}
                      title={isStopwatchRunningThis ? 'Pause Timer' : 'Start Focus Timer'}
                      aria-label="Play or Pause"
                    >
                      {isStopwatchRunningThis ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white translate-x-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onViewTask(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#222434] transition-colors cursor-pointer"
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
    </div>
  );
};
