import React from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask } from '../types';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { formatDuration } from '../utils/dateUtils';
import {
  X,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  Tag,
  FileText,
} from 'lucide-react';

interface TaskDetailsModalProps {
  task: DailyTask | null;
  isOpen: boolean;
  onClose: () => void;
  onEditTask?: (task: DailyTask) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onEditTask,
}) => {
  const {
    folders,
    toggleTaskComplete,
    addStudyTimeToTask,
    deleteTask,
    stopwatch,
    startStopwatch,
    pauseStopwatch,
  } = useStudy();

  if (!isOpen || !task) return null;

  // Safe folder resolution
  const folder =
    task.folderId === 'general'
      ? {
          name: 'General',
          color: '#6366F1',
          badgeClass:
            'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
        }
      : folders.find((f) => String(f.id) === String(task.folderId)) ||
        PRIMARY_FOLDERS[task.folderId] || {
          name: 'General',
          color: '#6366F1',
          badgeClass:
            'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
        };

  // Safe task ID matching (string vs number safe)
  const isStopwatchActive =
    stopwatch.isRunning && String(stopwatch.taskId) === String(task.id);

  const percent =
    task.targetMinutes > 0
      ? Math.min(100, Math.round((task.actualMinutes / task.targetMinutes) * 100))
      : 0;

  const handleToggleComplete = () => {
    toggleTaskComplete(task.id);
  };

  const handleStartOrPause = () => {
    if (isStopwatchActive) {
      pauseStopwatch();
    } else {
      startStopwatch(task.id, task.folderId);
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleEdit = () => {
    onClose();
    if (onEditTask) {
      onEditTask(task);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#242636] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative my-8 animate-in fade-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTopWidth: '4px',
          borderTopColor: folder.color,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category Pill & Status Badge */}
        <div className="flex items-center gap-2 mb-3 pr-8 flex-wrap">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5"
            style={{
              color: folder.color,
              borderColor: `${folder.color}55`,
              backgroundColor: `${folder.color}18`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span>{folder.name}</span>
          </span>

          {task.completed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock className="w-3 h-3" />
              <span>In Progress ({percent}%)</span>
            </span>
          )}
        </div>

        {/* Subject Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
          {task.subjectName}
        </h2>

        {/* Progress & Time Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Study Time Completed
              </span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {formatDuration(task.actualMinutes)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Planned Goal
              </span>
              <div className="text-lg font-bold font-mono text-slate-600 dark:text-slate-400">
                {formatDuration(task.targetMinutes)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percent}%`,
                backgroundColor: folder.color,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>{percent}% completed</span>
            <span>
              {task.actualMinutes >= task.targetMinutes
                ? 'Target achieved!'
                : `${formatDuration(task.targetMinutes - task.actualMinutes)} remaining`}
            </span>
          </div>
        </div>

        {/* Topics & Study Goals */}
        <div className="space-y-3 text-xs mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Target Topics / Goals:</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {task.topics || 'Routine study session'}
            </p>
          </div>

          {task.notes && (
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Notes & Instructions:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap italic leading-relaxed">
                {task.notes}
              </p>
            </div>
          )}
        </div>

        {/* Interactive Stopwatch & Quick Time Add */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={handleStartOrPause}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isStopwatchActive
                  ? 'bg-amber-500 text-white shadow-md animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {isStopwatchActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Stopwatch</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live Stopwatch</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleComplete}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
                task.completed
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {task.completed ? (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  <span>Mark Incomplete</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Manual Add Time Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Add:</span>
            <button
              onClick={() => addStudyTimeToTask(task.id, 15)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              +15m
            </button>
            <button
              onClick={() => addStudyTimeToTask(task.id, 30)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              +30m
            </button>
            <button
              onClick={() => addStudyTimeToTask(task.id, 60)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              +1h
            </button>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={handleEdit}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Edit Task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
