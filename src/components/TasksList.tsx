import React from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask, PrimaryFolderId } from '../types';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { formatDuration } from '../utils/dateUtils';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Clock,
} from 'lucide-react';

interface TasksListProps {
  onOpenAddTask: (folderId?: PrimaryFolderId) => void;
  onEditTask: (task: DailyTask) => void;
}

export const TasksList: React.FC<TasksListProps> = ({ onOpenAddTask, onEditTask }) => {
  const {
    tasks,
    selectedFolderFilter,
    toggleTaskComplete,
    deleteTask,
    addStudyTimeToTask,
    stopwatch,
    startStopwatch,
    pauseStopwatch,
  } = useStudy();

  const filteredTasks = tasks.filter((t) => {
    if (selectedFolderFilter === 'all') return true;
    return t.folderId === selectedFolderFilter;
  });

  return (
    <section className="space-y-4">
      {/* Title & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Today's Target Tasks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Check off completed topics, track study hours with the interactive stopwatch, or log time manually
          </p>
        </div>

        <button
          onClick={() => onOpenAddTask(selectedFolderFilter === 'all' ? undefined : selectedFolderFilter)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No morning tasks in this category
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Plan your daily subject goals and target study hours to stay organized throughout the day.
          </p>
          <button
            onClick={() => onOpenAddTask(selectedFolderFilter === 'all' ? undefined : selectedFolderFilter)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            + Add First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const folder = PRIMARY_FOLDERS[task.folderId];
            const isStopwatchActive = stopwatch.isRunning && stopwatch.taskId === task.id;
            const taskPct = task.targetMinutes > 0 ? Math.min(100, Math.round((task.actualMinutes / task.targetMinutes) * 100)) : 0;

            return (
              <div
                key={task.id}
                className={`group bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  task.completed
                    ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 opacity-80'
                    : isStopwatchActive
                    ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left: Checkbox + Subject & Topics */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Interactive Checkbox */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                    title={task.completed ? 'Mark Incomplete' : 'Mark Completed'}
                    aria-label="Toggle Complete"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-indigo-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-base font-bold transition-all ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.subjectName}
                      </span>

                      {/* Folder Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${folder.badgeClass}`}
                      >
                        {folder.name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {task.topics || 'No specific topics listed'}
                    </p>

                    {task.notes && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        Note: {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Progress & Interactive Time Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 sm:gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Time Progress Display */}
                  <div className="min-w-[130px]">
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatDuration(task.actualMinutes)}
                      </span>
                      <span className="text-slate-400 font-mono">
                        / {formatDuration(task.targetMinutes)}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${taskPct}%`,
                          backgroundColor: folder.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Interactive Stopwatch Trigger */}
                  <button
                    onClick={() => {
                      if (isStopwatchActive) {
                        pauseStopwatch();
                      } else {
                        startStopwatch(task.id, task.folderId);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap border ${
                      isStopwatchActive
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                    title={isStopwatchActive ? 'Pause active stopwatch' : 'Start interactive stopwatch for this subject'}
                  >
                    {isStopwatchActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Tracking...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-indigo-600 dark:text-indigo-400" />
                        <span>Track</span>
                      </>
                    )}
                  </button>

                  {/* Manual Quick Add Buttons (+15m, +30m) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => addStudyTimeToTask(task.id, 15)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] rounded-lg transition-colors"
                      title="Add 15 minutes manually"
                    >
                      +15m
                    </button>
                    <button
                      onClick={() => addStudyTimeToTask(task.id, 30)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] rounded-lg transition-colors"
                      title="Add 30 minutes manually"
                    >
                      +30m
                    </button>
                    <button
                      onClick={() => addStudyTimeToTask(task.id, 60)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] rounded-lg transition-colors"
                      title="Add 1 hour manually"
                    >
                      +1h
                    </button>
                  </div>

                  {/* Edit and Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete task "${task.subjectName}"?`)) {
                          deleteTask(task.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
