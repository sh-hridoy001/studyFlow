import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/dateUtils';
import {
  ArrowLeft,
  GraduationCap,
  Target,
  Languages,
  BookOpen,
  Plus,
  Play,
  Pause,
  Timer,
  CheckCircle2,
  Trash2,
  Settings2,
  CalendarPlus,
  Edit3,
  Flame,
  Check,
} from 'lucide-react';
import { SubjectWorkspaceModal } from './SubjectWorkspaceModal';
import { FolderManageModal } from './FolderManageModal';

interface FolderDetailViewProps {
  folderId: string;
  onBack: () => void;
  onOpenAddTask: (folderId?: string) => void;
  onEditTask: (task: any) => void;
  onViewTask: (task: any) => void;
}

export const FolderDetailView: React.FC<FolderDetailViewProps> = ({
  folderId,
  onBack,
  onOpenAddTask,
  onEditTask,
  onViewTask,
}) => {
  const {
    folders,
    tasks,
    folderStats,
    addSubjectToFolder,
    deleteSubjectFromFolder,
    addStudyTimeToTask,
    stopwatch,
    startFolderTimer,
    pauseStopwatch,
    stopAndSaveStopwatch,
  } = useStudy();

  const folder = folders.find((f) => String(f.id) === String(folderId));

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [workspaceSubject, setWorkspaceSubject] = useState<string | null>(null);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [selectedTimerSubject, setSelectedTimerSubject] = useState<string>('');

  if (!folder) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Folder not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          ← Back to All Folders
        </button>
      </div>
    );
  }

  const stats = folderStats[folder.id] || {
    targetMinutes: 0,
    actualMinutes: 0,
    percent: 0,
    totalTasks: 0,
    completedTasks: 0,
  };

  const folderTasks = tasks.filter((t) => String(t.folderId) === String(folder.id));

  // Check if stopwatch is currently running for this folder
  const isTimerActiveForFolder =
    String(stopwatch.folderId) === String(folder.id) &&
    (stopwatch.isRunning || stopwatch.secondsElapsed > 0);

  const hours = Math.floor(stopwatch.secondsElapsed / 3600);
  const minutes = Math.floor((stopwatch.secondsElapsed % 3600) / 60);
  const seconds = stopwatch.secondsElapsed % 60;
  const formattedStopwatch = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleStartTimer = () => {
    startFolderTimer(folder.id, selectedTimerSubject || folder.subjects[0] || undefined);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    addSubjectToFolder(folder.id, newSubjectInput.trim());
    setNewSubjectInput('');
  };

  const handleQuickAddMinutes = (mins: number) => {
    // Credit to first task of folder or create new task
    if (folderTasks.length > 0) {
      addStudyTimeToTask(folderTasks[0].id, mins);
    } else {
      addStudyTimeToTask('', mins);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Mobile App-style Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Folders</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Folder settings & rename"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Folder Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: folder.color }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {folder.name}
                </h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                  style={{
                    color: folder.color,
                    borderColor: `${folder.color}50`,
                    backgroundColor: `${folder.color}15`,
                  }}
                >
                  {folder.subjects.length} Subjects
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {folder.subtitle || 'Study workspace'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Today Studied</span>
              <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                {formatDuration(stats.actualMinutes)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target</span>
              <span className="text-lg font-mono font-semibold text-slate-500">
                {formatDuration(stats.targetMinutes)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Progress</span>
              <span className="text-lg font-mono font-black text-indigo-600 dark:text-indigo-400">
                {stats.percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${stats.percent}%`,
              backgroundColor: folder.color,
            }}
          />
        </div>
      </div>

      {/* 2. Folder Study Timer Section (প্রতিটি ফোল্ডারে টাইমার সিস্টেম) */}
      <div className="bg-gradient-to-br from-indigo-900/20 via-slate-900/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 ${
                isTimerActiveForFolder && stopwatch.isRunning ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: folder.color }}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Built-in Study Timer
              </span>
              <h3 className="text-base font-bold text-white">
                Study Timer for {folder.name}
              </h3>
            </div>
          </div>

          {/* Subject Selector for Timer */}
          {folder.subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Subject:</span>
              <select
                value={selectedTimerSubject}
                onChange={(e) => setSelectedTimerSubject(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General {folder.name}</option>
                {folder.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Timer Controls Row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isTimerActiveForFolder ? (
              <>
                <div className="font-mono text-xl sm:text-2xl font-black text-indigo-400 tabular-nums px-3 py-1 bg-slate-950/80 border border-slate-700/60 rounded-xl shadow-inner">
                  {formattedStopwatch}
                </div>

                <button
                  type="button"
                  onClick={stopwatch.isRunning ? pauseStopwatch : handleStartTimer}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    stopwatch.isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {stopwatch.isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={stopAndSaveStopwatch}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Study Timer</span>
              </button>
            )}
          </div>

          {/* Quick Add Minutes Buttons */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Quick Log:</span>
            <button
              type="button"
              onClick={() => handleQuickAddMinutes(15)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              +15m
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddMinutes(30)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              +30m
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddMinutes(60)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              +1h
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sub-Folders / Subjects Workspaces */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subjects & Workspaces ({folder.subjects.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any subject to open its chapters, theory notes, and formula sheet
            </p>
          </div>
        </div>

        {/* Add Subject inline input */}
        <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSubjectInput}
            onChange={(e) => setNewSubjectInput(e.target.value)}
            placeholder={`Add a new subject to ${folder.name}...`}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newSubjectInput.trim()}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-xs cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </form>

        {/* Grid of Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {folder.subjects.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No subjects in this folder yet. Type above to add your first subject!
            </div>
          ) : (
            folder.subjects.map((subjectName) => {
              const sf = folder.subjectFolders?.find(
                (item) => item.name.toLowerCase() === subjectName.toLowerCase()
              );
              const chapterCount = sf?.chapters?.length || 0;

              return (
                <div
                  key={subjectName}
                  className="group bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-4 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: folder.color }}
                        />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {subjectName}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shrink-0">
                        {chapterCount} {chapterCount === 1 ? 'ch' : 'chs'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                      {sf?.description || 'Chapters, notes & revision points'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setWorkspaceSubject(subjectName)}
                      className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Notes & Chs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startFolderTimer(folder.id, subjectName)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[11px] transition-colors cursor-pointer"
                      title="Start timer for this subject"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Timer</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Today's Tasks under this Folder */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Tasks for {folder.name} ({folderTasks.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specific targets planned for this folder today
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddTask(folder.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Task</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {folderTasks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No tasks scheduled for {folder.name} today.
              <button
                type="button"
                onClick={() => onOpenAddTask(folder.id)}
                className="text-indigo-600 dark:text-indigo-400 font-bold ml-1 hover:underline cursor-pointer"
              >
                + Plan a Task
              </button>
            </div>
          ) : (
            folderTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => onViewTask(task)}
                >
                  <div className="min-w-0">
                    <h4
                      className={`font-bold text-slate-900 dark:text-white truncate ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.subjectName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {task.topics || 'Routine study session'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatDuration(task.actualMinutes)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      / {formatDuration(task.targetMinutes)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onViewTask(task)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Subject Workspace Modal */}
      {workspaceSubject && (
        <SubjectWorkspaceModal
          isOpen={!!workspaceSubject}
          folderId={folder.id}
          subjectName={workspaceSubject}
          onClose={() => setWorkspaceSubject(null)}
        />
      )}

      {/* Folder Settings / Rename Modal */}
      <FolderManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        initialFolderId={folder.id}
      />
    </div>
  );
};
