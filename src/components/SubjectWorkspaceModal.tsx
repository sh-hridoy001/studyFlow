import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { FolderDefinition, SubjectFolder, ChapterNote } from '../types';
import {
  X,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
  CalendarPlus,
  Lightbulb,
  Play,
  Timer,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubjectWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  subjectName: string;
}

export const SubjectWorkspaceModal: React.FC<SubjectWorkspaceModalProps> = ({
  isOpen,
  onClose,
  folderId,
  subjectName,
}) => {
  const {
    folders,
    addChapterToSubject,
    updateChapterInSubject,
    deleteChapterFromSubject,
    toggleChapterCompleted,
    addTask,
    tasks,
    startFolderTimer,
  } = useStudy();

  const currentFolder = folders.find((f) => String(f.id) === String(folderId));
  const subjectFolder: SubjectFolder | undefined = currentFolder?.subjectFolders?.find(
    (sf) => sf.name.toLowerCase() === subjectName.toLowerCase()
  ) || {
    id: `subj-temp-${subjectName}`,
    name: subjectName,
    chapters: [],
  };

  const chapters = subjectFolder.chapters || [];
  const completedCount = chapters.filter((c) => c.completed).length;
  const progressPct = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;

  // New chapter form state
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNotes, setChapterNotes] = useState('');
  const [chapterFormulas, setChapterFormulas] = useState('');
  const [justAddedTaskId, setJustAddedTaskId] = useState<string | null>(null);
  const [confirmDeleteChapId, setConfirmDeleteChapId] = useState<string | null>(null);

  if (!isOpen || !currentFolder) return null;

  const handleStartAdd = () => {
    setEditingChapterId(null);
    setChapterTitle('');
    setChapterNotes('');
    setChapterFormulas('');
    setIsAddingChapter(true);
  };

  const handleStartEdit = (chap: ChapterNote) => {
    setEditingChapterId(chap.id);
    setChapterTitle(chap.title);
    setChapterNotes(chap.notes || '');
    setChapterFormulas(chap.importantPoints || '');
    setIsAddingChapter(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;

    if (editingChapterId) {
      updateChapterInSubject(folderId, subjectName, editingChapterId, {
        title: chapterTitle.trim(),
        notes: chapterNotes.trim(),
        importantPoints: chapterFormulas.trim(),
      });
    } else {
      addChapterToSubject(folderId, subjectName, {
        title: chapterTitle.trim(),
        notes: chapterNotes.trim(),
        importantPoints: chapterFormulas.trim(),
      });
    }

    setIsAddingChapter(false);
    setEditingChapterId(null);
    setChapterTitle('');
    setChapterNotes('');
    setChapterFormulas('');
  };

  const handleDeleteChapter = (chapId: string) => {
    deleteChapterFromSubject(folderId, subjectName, chapId);
    setConfirmDeleteChapId(null);
  };

  // 1-Click: Add this chapter as a daily study task for today!
  const handleAddToTodayRoutine = (chap: ChapterNote) => {
    addTask({
      folderId: currentFolder.id,
      subjectName: subjectName,
      topics: `${chap.title}`,
      targetMinutes: 60, // default 1 hour
      notes: chap.importantPoints ? `Focus: ${chap.importantPoints.slice(0, 100)}` : undefined,
    });

    setJustAddedTaskId(chap.id);
    setTimeout(() => setJustAddedTaskId(null), 2500);

    try {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    } catch {}
  };

  // Check if a task for this subject/chapter is already on today's list
  const isAlreadyInTodayTasks = (chapTitle: string) => {
    return tasks.some(
      (t) =>
        t.subjectName.toLowerCase() === subjectName.toLowerCase() &&
        t.topics.toLowerCase().includes(chapTitle.toLowerCase())
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-4 pr-10 shrink-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ backgroundColor: currentFolder.color }}
          >
            <BookOpen className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold"
                style={{ color: currentFolder.color }}
              >
                {currentFolder.name}
              </span>
              <span className="text-xs text-slate-400">/ Subject Workspace</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {subjectName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organize chapters, formulas, key notes, and study topics
            </p>
          </div>
        </div>

        {/* Progress & Quick Actions Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {completedCount} of {chapters.length}
                </span>{' '}
                <span className="text-slate-500">Chapters Completed</span>
              </div>
              <span className="text-xs font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                ({progressPct}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  startFolderTimer(folderId, subjectName);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="Start study timer for this subject"
              >
                <Play className="w-3.5 h-3.5 fill-current text-indigo-600" />
                <span>Start Timer</span>
              </button>

              <button
                type="button"
                onClick={handleStartAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chapter</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor: currentFolder.color,
              }}
            />
          </div>
        </div>

        {/* Add / Edit Chapter Form */}
        {isAddingChapter && (
          <form
            onSubmit={handleSaveChapter}
            className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-4 mb-4 space-y-3 shrink-0 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                {editingChapterId ? 'Edit Chapter & Notes' : 'New Chapter & Notes'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingChapter(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chapter / Topic Name *
              </label>
              <input
                type="text"
                required
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="e.g. Chapter 1: Vectors & Kinematics"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                Chapter Notes &amp; Concepts (Optional)
              </label>
              <textarea
                rows={3}
                value={chapterNotes}
                onChange={(e) => setChapterNotes(e.target.value)}
                placeholder="Write summary notes, key concepts, book references, or lecture reminders..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                Important Formulas &amp; Key Points (High-Yield for Revision)
              </label>
              <textarea
                rows={2}
                value={chapterFormulas}
                onChange={(e) => setChapterFormulas(e.target.value)}
                placeholder="Formulas, shortcuts, rules to memorize (e.g. F = ma, v = u + at)..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingChapter(false)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {editingChapterId ? 'Update Chapter' : 'Save Chapter & Notes'}
              </button>
            </div>
          </form>
        )}

        {/* Chapters & Notes Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[160px]">
          {chapters.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-2.5">
                <Bookmark className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No chapters added yet for {subjectName}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Click &quot;+ Add Chapter&quot; above to organize topics, write formulas, and track completion.
              </p>
              <button
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Chapter</span>
              </button>
            </div>
          ) : (
            chapters.map((chap, idx) => {
              const alreadyInTasks = isAlreadyInTodayTasks(chap.title);
              const wasJustAdded = justAddedTaskId === chap.id;

              return (
                <div
                  key={chap.id}
                  className={`border rounded-2xl p-4 transition-all ${
                    chap.completed
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-800/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Chapter Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleChapterCompleted(folderId, subjectName, chap.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          chap.completed
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                        }`}
                        title={chap.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                        aria-label={chap.completed ? `Mark ${chap.title} incomplete` : `Mark ${chap.title} complete`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono tabular-nums font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <h4
                            className={`font-bold text-sm leading-snug ${
                              chap.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {chap.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Explicit Complete Checkmark + Add to Today + Edit/Delete */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap pl-8 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => toggleChapterCompleted(folderId, subjectName, chap.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          chap.completed
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        }`}
                        title={chap.completed ? 'Click to undo completion' : 'Mark chapter complete'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{chap.completed ? 'Completed' : 'Complete'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToTodayRoutine(chap)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          wasJustAdded
                            ? 'bg-emerald-500 text-white'
                            : alreadyInTasks
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
                            : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800'
                        }`}
                        title="Add this chapter to today's study routine plan"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>{wasJustAdded ? 'Added! ✓' : alreadyInTasks ? 'In Tasks' : '+ Today'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(chap)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit chapter & notes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteChapId === chap.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(chap.id)}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteChapId(null)}
                            className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteChapId(chap.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes Body */}
                  {chap.notes && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-7">
                      {chap.notes}
                    </div>
                  )}

                  {/* Important Points & Formulas Callout */}
                  {chap.importantPoints && (
                    <div className="mt-2.5 ml-7 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Important Formulas & Key Points</span>
                      </div>
                      <p className="font-mono text-slate-800 dark:text-amber-100/90 whitespace-pre-line text-[11px] leading-relaxed">
                        {chap.importantPoints}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Click "+ Today" to instantly schedule a chapter for today's routine.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
