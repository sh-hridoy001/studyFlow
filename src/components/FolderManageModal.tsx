import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { FolderDefinition } from '../types';
import { FOLDER_COLOR_PRESETS } from '../utils/folderConstants';
import { X, Plus, Trash2, Edit3, FolderPlus, Check, Sparkles } from 'lucide-react';

interface FolderManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditingFolderId?: string;
}

export const FolderManageModal: React.FC<FolderManageModalProps> = ({
  isOpen,
  onClose,
  initialEditingFolderId,
}) => {
  const {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    addSubjectToFolder,
    deleteSubjectFromFolder,
  } = useStudy();

  // Mode: 'list' | 'add' | 'edit'
  const [activeFolderId, setActiveFolderId] = useState<string | null>(initialEditingFolderId || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [folderName, setFolderName] = useState('');
  const [folderSubtitle, setFolderSubtitle] = useState('');
  const [folderColor, setFolderColor] = useState('#4F46E5');
  const [newSubjectInput, setNewSubjectInput] = useState('');

  React.useEffect(() => {
    if (initialEditingFolderId) {
      const f = folders.find((item) => item.id === initialEditingFolderId);
      if (f) {
        setActiveFolderId(f.id);
        setFolderName(f.name);
        setFolderSubtitle(f.subtitle || '');
        setFolderColor(f.color || '#4F46E5');
        setIsCreatingNew(false);
      }
    } else {
      setIsCreatingNew(false);
      setActiveFolderId(null);
    }
  }, [initialEditingFolderId, isOpen, folders]);

  if (!isOpen) return null;

  const currentFolder = folders.find((f) => f.id === activeFolderId);

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setActiveFolderId(null);
    setFolderName('');
    setFolderSubtitle('');
    setFolderColor('#4F46E5');
    setNewSubjectInput('');
  };

  const handleSelectFolderToEdit = (f: FolderDefinition) => {
    setIsCreatingNew(false);
    setActiveFolderId(f.id);
    setFolderName(f.name);
    setFolderSubtitle(f.subtitle || '');
    setFolderColor(f.color || '#4F46E5');
    setNewSubjectInput('');
  };

  const handleSaveNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const created = addFolder({
      name: folderName.trim(),
      subtitle: folderSubtitle.trim() || 'Custom study folder',
      color: folderColor,
      subjects: [],
    });

    setActiveFolderId(created.id);
    setIsCreatingNew(false);
  };

  const handleUpdateFolderMeta = () => {
    if (!activeFolderId || !folderName.trim()) return;
    updateFolder(activeFolderId, {
      name: folderName.trim(),
      subtitle: folderSubtitle.trim(),
      color: folderColor,
    });
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolderId || !newSubjectInput.trim()) return;
    addSubjectToFolder(activeFolderId, newSubjectInput.trim());
    setNewSubjectInput('');
  };

  const handleDeleteFolder = (id: string, name: string) => {
    if (folders.length <= 1) {
      alert('You must have at least one study folder.');
      return;
    }
    if (confirm(`Are you sure you want to delete the folder "${name}"? Tasks assigned to this folder will remain but may be unassigned.`)) {
      deleteFolder(id);
      setActiveFolderId(null);
      setIsCreatingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Folder & Subject Manager
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
              Manage Study Folders & Subjects
            </h2>
          </div>
        </div>

        {/* Folder Selector Tabs or + Add Folder Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 border-b border-slate-100 dark:border-slate-800">
          {folders.map((f) => {
            const isSelected = activeFolderId === f.id && !isCreatingNew;
            return (
              <button
                key={f.id}
                onClick={() => handleSelectFolderToEdit(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                <span>{f.name}</span>
              </button>
            );
          })}

          <button
            onClick={handleStartCreate}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              isCreatingNew
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Content Body: Create Mode vs Edit Mode */}
        {isCreatingNew ? (
          <form onSubmit={handleSaveNewFolder} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                required
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. University Semester 4, IELTS Academic..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={folderSubtitle}
                onChange={(e) => setFolderSubtitle(e.target.value)}
                placeholder="e.g. Core lecture courses, lab assignments..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Accent Theme Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {FOLDER_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setFolderColor(preset.color)}
                    className={`w-7 h-7 rounded-xl transition-transform flex items-center justify-center text-white ${
                      folderColor === preset.color ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {folderColor === preset.color && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95"
              >
                Create Folder
              </button>
            </div>
          </form>
        ) : currentFolder ? (
          <div className="space-y-5 text-xs">
            {/* Rename & Color Config */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Folder Details
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(currentFolder.id, currentFolder.name)}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Folder</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onBlur={handleUpdateFolderMeta}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Folder Subtitle
                  </label>
                  <input
                    type="text"
                    value={folderSubtitle}
                    onChange={(e) => setFolderSubtitle(e.target.value)}
                    onBlur={handleUpdateFolderMeta}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Folder Color
                </label>
                <div className="flex items-center gap-2">
                  {FOLDER_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => {
                        setFolderColor(preset.color);
                        updateFolder(currentFolder.id, { color: preset.color });
                      }}
                      className={`w-6 h-6 rounded-lg transition-transform flex items-center justify-center text-white ${
                        currentFolder.color === preset.color ? 'scale-110 ring-2 ring-offset-1 ring-slate-900 dark:ring-white' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: preset.color }}
                    >
                      {currentFolder.color === preset.color && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Sub-Folders / Subjects Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Sub-Folders & Subjects ({currentFolder.subjects?.length || 0})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add subjects that belong under this folder for rapid daily routine planning.
                  </p>
                </div>
              </div>

              {/* Add Subject Input */}
              <form onSubmit={handleAddSubject} className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  placeholder="e.g. Physics Chapter 3, Speaking Mock..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newSubjectInput.trim()}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </form>

              {/* Chips List of Subjects */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pt-1">
                {(currentFolder.subjects || []).length === 0 ? (
                  <div className="text-slate-400 italic text-[11px] py-2">
                    No subjects added yet. Type a subject above to add it.
                  </div>
                ) : (
                  currentFolder.subjects.map((subj) => (
                    <div
                      key={subj}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentFolder.color }} />
                      <span>{subj}</span>
                      <button
                        type="button"
                        onClick={() => deleteSubjectFromFolder(currentFolder.id, subj)}
                        className="text-slate-400 hover:text-rose-500 ml-1 rounded p-0.5 transition-colors"
                        title="Delete subject"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 text-xs mb-3">Select a folder above to manage or create a new one.</p>
            <button
              onClick={handleStartCreate}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
            >
              + Create New Folder
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
