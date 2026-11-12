import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { FolderDefinition } from '../types';
import { FOLDER_COLOR_PRESETS } from '../utils/folderConstants';
import { useLongPress } from '../hooks/useLongPress';
import { FolderSettingsModal } from './FolderSettingsModal';
import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  BookOpen,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { formatDuration } from '../utils/dateUtils';

interface FoldersScreenProps {
  autoFocusCreate?: boolean;
  onBackHome: () => void;
  onOpenFolderDetail: (folderId: string) => void;
}

interface FolderGridCardProps {
  folder: FolderDefinition;
  stats: { actualMinutes: number };
  isRenaming: boolean;
  renameValue: string;
  setRenameValue: (v: string) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  canDelete: boolean;
  onOpen: () => void;
  onLongPressSettings: () => void;
  onStartRename: (e: React.MouseEvent, folder: FolderDefinition) => void;
  onConfirmRename: (e: React.FormEvent, folderId: string) => void;
  onRequestDelete: (e: React.MouseEvent, folderId: string) => void;
  onConfirmDelete: (e: React.MouseEvent, folderId: string) => void;
}

const FolderGridCard: React.FC<FolderGridCardProps> = ({
  folder,
  stats,
  isRenaming,
  renameValue,
  setRenameValue,
  confirmDeleteId,
  setConfirmDeleteId,
  canDelete,
  onOpen,
  onLongPressSettings,
  onStartRename,
  onConfirmRename,
  onRequestDelete,
  onConfirmDelete,
}) => {
  const subjectCount = folder.subjects?.length || 0;
  const longPressHandlers = useLongPress({
    delay: 450,
    onLongPress: onLongPressSettings,
    onClick: () => {
      if (!isRenaming) onOpen();
    },
  });

  return (
    <div
      {...longPressHandlers}
      className="group relative bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden select-none active:scale-[0.98]"
    >
      {/* Genuine Folder Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: folder.color }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: folder.color }}
          >
            <Folder className="w-5 h-5 fill-white/25" />
          </div>

          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <form
                onSubmit={(e) => onConfirmRename(e, folder.id)}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-100 dark:bg-[#1c1e2c] border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="p-1 rounded-lg bg-emerald-500 text-white"
                  title="Save name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#ff4757] transition-colors">
                  {folder.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {folder.subtitle || 'Hold for settings'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Inline Quick Actions & Settings Button */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {confirmDeleteId === folder.id ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 rounded-lg px-1.5 py-0.5"
            >
              <button
                type="button"
                onClick={(e) => onConfirmDelete(e, folder.id)}
                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(null);
                }}
                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                aria-label="Cancel delete"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => onStartRename(e, folder)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f2233] transition-colors cursor-pointer"
                title="Rename folder"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => onRequestDelete(e, folder.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete folder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLongPressSettings();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f2233] transition-colors cursor-pointer"
                title="Folder settings"
                aria-label={`Settings for ${folder.name}`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Folder Footer Meta */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1f2232] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            {subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" />
            {formatDuration(stats.actualMinutes)}
          </span>
        </div>

        <span className="flex items-center gap-0.5 font-semibold text-slate-600 dark:text-slate-300 group-hover:text-[#ff4757]">
          Open <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export const FoldersScreen: React.FC<FoldersScreenProps> = ({
  autoFocusCreate = false,
  onBackHome,
  onOpenFolderDetail,
}) => {
  const {
    folders,
    folderStats,
    addFolder,
    updateFolder,
    deleteFolder,
  } = useStudy();

  const [isCreating, setIsCreating] = useState<boolean>(autoFocusCreate);
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newColor, setNewColor] = useState(FOLDER_COLOR_PRESETS[0]?.color || '#4F46E5');

  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [settingsFolderId, setSettingsFolderId] = useState<string | null>(null);
  const createInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocusCreate) {
      setIsCreating(true);
    }
  }, [autoFocusCreate]);

  useEffect(() => {
    if (isCreating && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addFolder({
      name: newName.trim(),
      subtitle: newSubtitle.trim() || 'Study folder',
      color: newColor,
      subjects: [],
    });
    setNewName('');
    setNewSubtitle('');
    setIsCreating(false);
  };

  const handleStartRename = (e: React.MouseEvent, folder: FolderDefinition) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setRenamingFolderId(folder.id);
    setRenameValue(folder.name);
  };

  const handleConfirmRename = (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    if (renameValue.trim()) {
      updateFolder(folderId, { name: renameValue.trim() });
    }
    setRenamingFolderId(null);
  };

  const handleRequestDelete = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (folders.length <= 1) return;
    setConfirmDeleteId(folderId);
  };

  const handleConfirmDelete = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (folders.length <= 1) return;
    deleteFolder(folderId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Top Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackHome}
            className="p-2 rounded-xl bg-white dark:bg-[#191b27] border border-slate-200 dark:border-[#272a3d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Study Folders
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tap to open · Hold any folder for settings
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            isCreating
              ? 'bg-slate-200 dark:bg-[#232638] text-slate-700 dark:text-slate-200'
              : 'bg-[#ff4757] hover:bg-[#ff3344] text-white shadow-sm'
          }`}
        >
          {isCreating ? <X className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
          <span>{isCreating ? 'Cancel' : 'New Folder'}</span>
        </button>
      </div>

      {/* Inline Genuine Folder Creator Card (No Popup Modal!) */}
      {isCreating && (
        <form
          onSubmit={handleCreateFolder}
          className="bg-white dark:bg-[#151722] border-2 border-dashed border-[#ff4757]/50 rounded-2xl p-4 shadow-sm space-y-3 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: newColor }}
            >
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Create New Folder
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Type a folder name and choose its color tag
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              ref={createInputRef}
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Folder Name (e.g. Semester 5, Coding)"
              className="w-full bg-slate-50 dark:bg-[#1c1e2c] border border-slate-200 dark:border-[#2c3045] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
            />
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="Subtitle (optional)"
              className="w-full bg-slate-50 dark:bg-[#1c1e2c] border border-slate-200 dark:border-[#2c3045] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {FOLDER_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => setNewColor(preset.color)}
                  className={`w-6 h-6 rounded-lg transition-transform flex items-center justify-center text-white cursor-pointer ${
                    newColor === preset.color
                      ? 'scale-110 ring-2 ring-offset-1 ring-slate-900 dark:ring-white'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                >
                  {newColor === preset.color && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-xl bg-[#ff4757] hover:bg-[#ff3344] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Folder</span>
            </button>
          </div>
        </form>
      )}

      {/* Genuine File-Manager Style Folder Grid (Long-press opens settings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {folders.map((folder) => {
          const stats = folderStats[folder.id] || {
            actualMinutes: 0,
            targetMinutes: 0,
            totalTasks: 0,
            completedTasks: 0,
          };

          return (
            <FolderGridCard
              key={folder.id}
              folder={folder}
              stats={stats}
              isRenaming={renamingFolderId === folder.id}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              canDelete={folders.length > 1}
              onOpen={() => onOpenFolderDetail(folder.id)}
              onLongPressSettings={() => setSettingsFolderId(folder.id)}
              onStartRename={handleStartRename}
              onConfirmRename={handleConfirmRename}
              onRequestDelete={handleRequestDelete}
              onConfirmDelete={handleConfirmDelete}
            />
          );
        })}
      </div>

      {/* Long-Press Folder Settings Sheet */}
      <FolderSettingsModal
        folderId={settingsFolderId}
        onClose={() => setSettingsFolderId(null)}
        onOpenFolder={onOpenFolderDetail}
      />
    </div>
  );
};
