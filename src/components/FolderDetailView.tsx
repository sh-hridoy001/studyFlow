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
  Folder,
  FolderPlus,
  ChevronRight,
  X,
} from 'lucide-react';
import { FOLDER_COLOR_PRESETS } from '../utils/folderConstants';
import { SubjectWorkspaceModal } from './SubjectWorkspaceModal';
import { FolderManageModal } from './FolderManageModal';

interface FolderDetailViewProps {
  folderId: string;
  onBack: () => void;
  onOpenFolder?: (folderId: string) => void;
  onOpenAddTask: (folderId?: string) => void;
  onEditTask: (task: any) => void;
  onViewTask: (task: any) => void;
}

export const FolderDetailView: React.FC<FolderDetailViewProps> = ({
  folderId,
  onBack,
  onOpenFolder,
  onOpenAddTask,
  onEditTask,
  onViewTask,
}) => {
  const {
    folders,
    tasks,
    folderStats,
    addFolder,
    addSubjectToFolder,
    addChapterToSubject,
    toggleChapterCompleted,
    deleteChapterFromSubject,
    addStudyTimeToTask,
    stopwatch,
    startFolderTimer,
    pauseStopwatch,
    stopAndSaveStopwatch,
  } = useStudy();

  const folder = folders.find((f) => String(f.id) === String(folderId));
  const parentFolder = folder?.parentId
    ? folders.find((f) => String(f.id) === String(folder.parentId))
    : undefined;
  const childFolders = folder
    ? folders.filter((f) => String(f.parentId || '') === String(folder.id))
    : [];

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [workspaceSubject, setWorkspaceSubject] = useState<string | null>(null);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [isAddingSubFolder, setIsAddingSubFolder] = useState(false);
  const [newSubFolderName, setNewSubFolderName] = useState('');
  const [newSubFolderColor, setNewSubFolderColor] = useState(
    folder?.color || FOLDER_COLOR_PRESETS[0]?.color || '#4F46E5'
  );
  const [selectedTimerSubject, setSelectedTimerSubject] = useState<string>('');
  const [chapterDraftBySubject, setChapterDraftBySubject] = useState<Record<string, string>>({});

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

  const handleAddChapterInline = (e: React.FormEvent, subjectName: string) => {
    e.preventDefault();
    const draft = (chapterDraftBySubject[subjectName] || '').trim();
    if (!draft) return;
    addChapterToSubject(folder.id, subjectName, { title: draft });
    setChapterDraftBySubject((prev) => ({ ...prev, [subjectName]: '' }));
  };

  const handleQuickAddMinutes = (mins: number) => {
    if (folderTasks.length > 0) {
      addStudyTimeToTask(folderTasks[0].id, mins);
    } else {
      addStudyTimeToTask('', mins);
    }
  };

  const handleAddSubFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubFolderName.trim()) return;
    addFolder({
      name: newSubFolderName.trim(),
      color: newSubFolderColor,
      subjects: [],
      parentId: folder.id,
    });
    setNewSubFolderName('');
    setIsAddingSubFolder(false);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Mobile App-style Navigation Header */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (parentFolder && onOpenFolder) {
                  onOpenFolder(parentFolder.id);
                } else {
                  onBack();
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{parentFolder ? parentFolder.name : 'All Folders'}</span>
            </button>
            {parentFolder && (
              <button
                type="button"
                onClick={onBack}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                / Root
              </button>
            )}
          </div>

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
                {childFolders.length > 0 && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    · {childFolders.length} Sub-Folders
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  · {folder.subjects.length} Subjects
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
              <span className="text-lg font-mono tabular-nums font-black text-slate-900 dark:text-white">
                {formatDuration(stats.actualMinutes)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target</span>
              <span className="text-lg font-mono tabular-nums font-semibold text-slate-500">
                {formatDuration(stats.targetMinutes)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Progress</span>
              <span className="text-lg font-mono tabular-nums font-black text-indigo-600 dark:text-indigo-400">
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

      {/* 2. Folder Study Timer Section */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#24273b] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: folder.color }}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">
                Built-in Study Timer
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Study Timer for {folder.name}
              </h3>
            </div>
          </div>

          {/* Subject Selector for Timer */}
          {folder.subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Subject:</span>
              <select
                value={selectedTimerSubject}
                onChange={(e) => setSelectedTimerSubject(e.target.value)}
                className="bg-slate-100 dark:bg-[#1a1d2b] border border-slate-200 dark:border-[#2b2f45] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#222538] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isTimerActiveForFolder ? (
              <>
                <div className="font-mono text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums px-3 py-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-inner">
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
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              +15m
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddMinutes(30)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              +30m
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddMinutes(60)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              +1h
            </button>
          </div>
        </div>
      </div>

      {/* 2.5 Nested Sub-Folders inside this Folder */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#ff4757]" />
              <span>Sub-Folders ({childFolders.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organize modules or nested folders inside {folder.name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewSubFolderColor(folder.color || '#4F46E5');
              setIsAddingSubFolder((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              isAddingSubFolder
                ? 'bg-slate-200 dark:bg-[#232638] text-slate-700 dark:text-slate-200'
                : 'bg-[#ff4757] hover:bg-[#ff3344] text-white shadow-2xs'
            }`}
          >
            {isAddingSubFolder ? <X className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
            <span>{isAddingSubFolder ? 'Cancel' : 'New Sub-Folder'}</span>
          </button>
        </div>

        {isAddingSubFolder && (
          <form
            onSubmit={handleAddSubFolder}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-dashed border-[#ff4757]/50 space-y-2.5 animate-in fade-in duration-150"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                autoFocus
                value={newSubFolderName}
                onChange={(e) => setNewSubFolderName(e.target.value)}
                placeholder={`Sub-folder name inside ${folder.name}...`}
                className="flex-1 bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff4757]"
              />
              <button
                type="submit"
                disabled={!newSubFolderName.trim()}
                className="px-4 py-2 rounded-xl bg-[#ff4757] hover:bg-[#ff3344] disabled:opacity-50 text-white text-xs font-bold cursor-pointer shrink-0"
              >
                Create Sub-Folder
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Color:</span>
              {FOLDER_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => setNewSubFolderColor(preset.color)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-white cursor-pointer ${
                    newSubFolderColor === preset.color
                      ? 'scale-110 ring-2 ring-offset-1 ring-slate-900 dark:ring-white'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                >
                  {newSubFolderColor === preset.color && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </form>
        )}

        {childFolders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {childFolders.map((sub) => {
              const nestedCount = folders.filter(
                (f) => String(f.parentId || '') === String(sub.id)
              ).length;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onOpenFolder?.(sub.id)}
                  className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#181a26] hover:bg-slate-100 dark:hover:bg-[#1f2233] border border-slate-200 dark:border-[#26293b] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: sub.color }}
                    >
                      <Folder className="w-4 h-4 fill-white/20" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#ff4757] transition-colors">
                        {sub.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {nestedCount > 0 ? `${nestedCount} folders · ` : ''}
                        {sub.subjects?.length || 0} subjects
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ff4757] shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sub-Folders / Subjects & Inline Chapters with Complete Checkmarks */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subjects &amp; Chapters ({folder.subjects.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add chapters inside any subject and click the checkmark to mark each chapter complete
            </p>
          </div>
        </div>

        {/* Add Subject inline input */}
        <form onSubmit={handleAddSubject} className="flex gap-2 mb-5">
          <input
            type="text"
            value={newSubjectInput}
            onChange={(e) => setNewSubjectInput(e.target.value)}
            placeholder={`Add a new subject to ${folder.name}...`}
            className="flex-1 bg-slate-50 dark:bg-[#191b27] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newSubjectInput.trim()}
            className="flex items-center gap-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-xs cursor-pointer shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </form>

        {/* Subject Cards with Inline Chapter List & Checkmark Completion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {folder.subjects.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No subjects in this folder yet. Type above to add your first subject!
            </div>
          ) : (
            folder.subjects.map((subjectName) => {
              const sf = folder.subjectFolders?.find(
                (item) => item.name.toLowerCase() === subjectName.toLowerCase()
              );
              const chapters = sf?.chapters || [];
              const completedChaptersCount = chapters.filter((ch) => ch.completed).length;
              const chapterProgressPct =
                chapters.length > 0 ? Math.round((completedChaptersCount / chapters.length) * 100) : 0;
              const chapterDraft = chapterDraftBySubject[subjectName] || '';

              return (
                <div
                  key={subjectName}
                  className="bg-slate-50/70 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b] rounded-2xl p-4 transition-all shadow-2xs flex flex-col justify-between gap-3"
                >
                  {/* Subject Header & Chapter Progress */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: folder.color }}
                        />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {subjectName}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {completedChaptersCount}/{chapters.length} chs done
                      </span>
                    </div>

                    {chapters.length > 0 && (
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${chapterProgressPct}%`,
                            backgroundColor: chapterProgressPct === 100 ? '#10B981' : folder.color,
                          }}
                        />
                      </div>
                    )}

                    {/* Chapters List with Instant Complete Checkmark */}
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                      {chapters.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-2">
                          No chapters added yet. Add one below:
                        </p>
                      ) : (
                        chapters.map((chap, idx) => (
                          <div
                            key={chap.id}
                            className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border transition-colors ${
                              chap.completed
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50'
                                : 'bg-white dark:bg-[#12131c] border-slate-200/90 dark:border-[#25283a]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setWorkspaceSubject(subjectName)}
                              className="min-w-0 flex-1 text-left flex items-center gap-2 cursor-pointer"
                              title="Open notes & formulas for this chapter"
                            >
                              <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                                {String(idx + 1).padStart(2, '0')}.
                              </span>
                              <span
                                className={`text-xs font-semibold truncate ${
                                  chap.completed
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {chap.title}
                              </span>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleChapterCompleted(folder.id, subjectName, chap.id)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                  chap.completed
                                    ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                                    : 'bg-slate-100 dark:bg-[#1e2130] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#2e3248] hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                                }`}
                                title={chap.completed ? 'Completed — click to undo' : 'Mark chapter complete'}
                                aria-label={chap.completed ? `Unmark ${chap.title} complete` : `Mark ${chap.title} complete`}
                              >
                                <Check className={`w-3.5 h-3.5 ${chap.completed ? 'stroke-[3]' : ''}`} />
                                <span>{chap.completed ? 'Done' : 'Complete'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteChapterFromSubject(folder.id, subjectName, chap.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                                title="Delete chapter"
                                aria-label={`Delete ${chap.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Inline Add Chapter Form right inside Subject Card */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-[#25283a]">
                    <form
                      onSubmit={(e) => handleAddChapterInline(e, subjectName)}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={chapterDraft}
                        onChange={(e) =>
                          setChapterDraftBySubject((prev) => ({
                            ...prev,
                            [subjectName]: e.target.value,
                          }))
                        }
                        placeholder="Add chapter name..."
                        className="flex-1 min-w-0 bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2b2e42] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!chapterDraft.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </form>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setWorkspaceSubject(subjectName)}
                        className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Notes &amp; Formulas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startFolderTimer(folder.id, subjectName)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[11px] transition-colors cursor-pointer whitespace-nowrap"
                        title="Start timer for this subject"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start Timer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Today's Tasks under this Folder */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Today&apos;s Tasks for {folder.name} ({folderTasks.length})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Specific targets planned for this folder today
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddTask(folder.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4757] hover:bg-[#ff3344] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="space-y-2">
          {folderTasks.length === 0 ? (
            <div className="text-center py-7 bg-slate-50 dark:bg-[#181a25] rounded-xl border border-dashed border-slate-200 dark:border-[#272a3d] text-xs text-slate-400">
              No tasks scheduled for {folder.name} today.
              <button
                type="button"
                onClick={() => onOpenAddTask(folder.id)}
                className="text-[#ff4757] font-bold ml-1 hover:underline cursor-pointer"
              >
                + Plan a Task
              </button>
            </div>
          ) : (
            folderTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-50 dark:bg-[#181a25] border border-slate-200 dark:border-[#26293b] rounded-xl flex items-center justify-between gap-3 text-xs"
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
                    {task.topics && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {task.topics}
                      </p>
                    )}
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
                    className="px-2.5 py-1 bg-white dark:bg-[#222536] border border-slate-200 dark:border-[#2e3248] text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] cursor-pointer"
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
