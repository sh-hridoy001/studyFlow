import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { FOLDER_COLOR_PRESETS } from '../utils/folderConstants';
import { formatDuration } from '../utils/dateUtils';
import {
  X,
  Folder,
  Play,
  FolderOpen,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  BookOpen,
  Palette,
} from 'lucide-react';

interface FolderSettingsModalProps {
  folderId: string | null;
  onClose: () => void;
  onOpenFolder?: (folderId: string) => void;
}

export const FolderSettingsModal: React.FC<FolderSettingsModalProps> = ({
  folderId,
  onClose,
  onOpenFolder,
}) => {
  const {
    folders,
    folderStats,
    updateFolder,
    deleteFolder,
    addSubjectToFolder,
    deleteSubjectFromFolder,
    startFolderTimer,
    setActiveTab,
  } = useStudy();

  const folder = folderId ? folders.find((f) => String(f.id) === String(folderId)) : null;

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [color, setColor] = useState('#ff4757');
  const [newSubject, setNewSubject] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setSubtitle(folder.subtitle || '');
      setColor(folder.color || '#ff4757');
      setNewSubject('');
      setSavedNotice(false);
      setConfirmDelete(false);
    }
  }, [folder]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (folderId) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [folderId, onClose]);

  if (!folderId || !folder) return null;

  const stats = folderStats[folder.id] || {
    actualMinutes: 0,
    targetMinutes: 0,
    totalTasks: 0,
    completedTasks: 0,
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateFolder(folder.id, {
      name: name.trim(),
      subtitle: subtitle.trim() || 'Study workspace',
      color,
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    addSubjectToFolder(folder.id, newSubject.trim());
    setNewSubject('');
  };

  const handleDeleteFolder = () => {
    if (folders.length <= 1) return;
    deleteFolder(folder.id);
    onClose();
  };

  const handleStartTimer = () => {
    startFolderTimer(folder.id);
    setActiveTab('routine');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#242738] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[88vh] overflow-y-auto text-slate-900 dark:text-white animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-label={`Settings for ${folder.name}`}
      >
        {/* Mobile bottom-sheet grab handle */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-[#222536]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: color }}
            >
              <Folder className="w-5 h-5 fill-white/20" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {folder.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {folder.subjects?.length || 0} subjects · Today {formatDuration(stats.actualMinutes)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close folder settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions: Open Folder & Start Timer */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {onOpenFolder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFolder(folder.id);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#1c1e2b] hover:bg-slate-200 dark:hover:bg-[#242738] border border-slate-200 dark:border-[#2a2d42] text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Open Folder</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleStartTimer}
            className={`py-2.5 px-3 rounded-xl bg-[#ff4757] hover:bg-[#ff3344] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              !onOpenFolder ? 'col-span-2' : ''
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Timer</span>
          </button>
        </div>

        {/* Edit Folder Details & Color */}
        <form onSubmit={handleSaveDetails} className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#25283a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#ff4757]" />
              Edit Folder Settings
            </span>
            {savedNotice && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Folder Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Folder name"
                className="w-full bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Semester 5, Board Exam"
                className="w-full bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Folder Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {FOLDER_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => {
                      setColor(preset.color);
                      updateFolder(folder.id, { color: preset.color });
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-transform cursor-pointer ${
                      color === preset.color
                        ? 'scale-110 ring-2 ring-offset-1 ring-slate-900 dark:ring-white'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {color === preset.color && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
          >
            Save Name &amp; Details
          </button>
        </form>

        {/* Manage Subjects inside Folder */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#25283a] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              Subjects ({folder.subjects?.length || 0})
            </span>
          </div>

          {folder.subjects && folder.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {folder.subjects.map((subj) => (
                <div
                  key={subj}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <span>{subj}</span>
                  <button
                    type="button"
                    onClick={() => deleteSubjectFromFolder(folder.id, subj)}
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title={`Remove ${subj}`}
                    aria-label={`Remove ${subj}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              No subjects added yet. Add one below so you can select it directly on the timer.
            </p>
          )}

          <form onSubmit={handleAddSubject} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add subject (e.g. Physics, Math)..."
              className="flex-1 bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newSubject.trim()}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Delete Folder Danger Zone */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#222536]">
          {folders.length <= 1 ? (
            <p className="text-[11px] text-slate-400 text-center">
              At least 1 study folder is required. Create another folder before deleting this one.
            </p>
          ) : confirmDelete ? (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Delete folder <strong>{folder.name}</strong>? Past study logs remain safe, but the folder and its subject list will be removed.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl bg-white dark:bg-[#1a1c28] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFolder}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/25 hover:bg-rose-100 dark:hover:bg-rose-950/45 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Folder</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
