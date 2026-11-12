import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask, FolderDefinition } from '../types';
import { useLongPress } from '../hooks/useLongPress';
import { FolderSettingsModal } from './FolderSettingsModal';
import {
  ArrowLeft,
  Folder,
  Sparkles,
  Clock,
  Check,
  Plus,
} from 'lucide-react';

interface AddTaskScreenProps {
  defaultFolderId?: string;
  editingTask?: DailyTask | null;
  onCancel: () => void;
  onSaved: () => void;
}

const TIME_PRESETS = [
  { minutes: 15, label: '15m' },
  { minutes: 30, label: '30m' },
  { minutes: 45, label: '45m' },
  { minutes: 60, label: '1h' },
  { minutes: 90, label: '1.5h' },
  { minutes: 120, label: '2h' },
];

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({
  defaultFolderId,
  editingTask,
  onCancel,
  onSaved,
}) => {
  const { folders, addTask, updateTask } = useStudy();

  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    editingTask?.folderId || defaultFolderId || (folders[0]?.id ?? 'general')
  );
  const [taskTitle, setTaskTitle] = useState<string>(editingTask?.subjectName || '');
  const [hours, setHours] = useState<string>(() =>
    editingTask ? String(Math.floor(editingTask.targetMinutes / 60)) : '0'
  );
  const [minutes, setMinutes] = useState<string>(() =>
    editingTask ? String(editingTask.targetMinutes % 60) : '45'
  );
  const [settingsFolderId, setSettingsFolderId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingTask) {
      setSelectedFolderId(editingTask.folderId || 'general');
      setTaskTitle(editingTask.subjectName);
      setHours(String(Math.floor(editingTask.targetMinutes / 60)));
      setMinutes(String(editingTask.targetMinutes % 60));
    } else {
      setSelectedFolderId(defaultFolderId || (folders[0]?.id ?? 'general'));
      setTaskTitle('');
      setHours('0');
      setMinutes('45');
    }
  }, [editingTask, defaultFolderId, folders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  const currentFolder =
    selectedFolderId !== 'general'
      ? folders.find((f) => String(f.id) === String(selectedFolderId))
      : undefined;

  const totalSelectedMinutes =
    (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);

  const handleSelectPreset = (totalMins: number) => {
    setHours(String(Math.floor(totalMins / 60)));
    setMinutes(String(totalMins % 60));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const finalMinutes = Math.max(5, totalSelectedMinutes || 30);

    if (editingTask) {
      updateTask(editingTask.id, {
        folderId: selectedFolderId,
        subjectName: taskTitle.trim(),
        targetMinutes: finalMinutes,
      });
    } else {
      addTask({
        folderId: selectedFolderId,
        subjectName: taskTitle.trim(),
        topics: '',
        targetMinutes: finalMinutes,
      });
    }

    onSaved();
  };

  return (
    <div className="space-y-4 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Native Mobile Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#242636] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {editingTask ? 'Edit Task' : 'Create Study Task'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose a folder or quick task, name it &amp; set time
            </p>
          </div>
        </div>
      </div>

      {/* Main Clean Form Card */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Folder Selection (Your Folders + Outside Folder option) */}
        <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#ff4757]" />
              Choose Folder
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Hold a folder for settings
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {folders.map((folder) => (
              <AddTaskFolderCard
                key={folder.id}
                folder={folder}
                isSelected={String(selectedFolderId) === String(folder.id)}
                onSelect={() => setSelectedFolderId(folder.id)}
                onHoldSettings={() => setSettingsFolderId(folder.id)}
              />
            ))}

            {/* Explicit Option: Outside Any Folder (Quick / General Task) */}
            <button
              type="button"
              onClick={() => setSelectedFolderId('general')}
              className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                selectedFolderId === 'general'
                  ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500 ring-1 ring-indigo-500/40 shadow-2xs'
                  : 'bg-slate-50 dark:bg-[#181a25] border-dashed border-slate-300 dark:border-[#2d3147] hover:border-indigo-400'
              }`}
            >
              <span className="w-3 h-3 rounded-md shrink-0 bg-indigo-500" />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold truncate ${
                    selectedFolderId === 'general'
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  No Folder
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Quick standalone task
                </p>
              </div>
              {selectedFolderId === 'general' && (
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          </div>
        </section>

        {/* 2. Task Name (+ optional 1-tap subject suggestions when inside a folder) */}
        <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 shadow-xs space-y-3">
          <label
            htmlFor="new-task-title"
            className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ff4757]" />
            <span>Task Name</span>
          </label>

          {currentFolder && currentFolder.subjects && currentFolder.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentFolder.subjects.map((subject) => {
                const active = taskTitle.trim().toLowerCase() === subject.toLowerCase();
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setTaskTitle(subject)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#ff4757] text-white border-[#ff4757] shadow-2xs'
                        : 'bg-slate-100 dark:bg-[#1c1e2c] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2a2d40] hover:border-slate-400'
                    }`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          )}

          <input
            id="new-task-title"
            ref={inputRef}
            type="text"
            required
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder={
              selectedFolderId === 'general'
                ? 'e.g. Read 20 pages, Practice Vocabulary...'
                : `e.g. ${currentFolder?.subjects?.[0] || 'Chapter 3 Revision'}...`
            }
            className="w-full bg-slate-50 dark:bg-[#181a25] border border-slate-200 dark:border-[#282b3e] rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
          />
        </section>

        {/* 3. Target Time Option */}
        <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Study Time
            </span>
            <span className="text-xs font-mono font-bold text-[#ff4757]">
              {Math.floor((totalSelectedMinutes || 0) / 60)}h {(totalSelectedMinutes || 0) % 60}m
            </span>
          </div>

          {/* 1-tap Presets */}
          <div className="grid grid-cols-6 gap-1.5">
            {TIME_PRESETS.map((preset) => {
              const isSelected = totalSelectedMinutes === preset.minutes;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.minutes)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#ff4757] text-white border-[#ff4757] shadow-xs'
                      : 'bg-slate-50 dark:bg-[#181a25] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#282b3e] hover:border-slate-400'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Hours & Minutes */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#181a25] border border-slate-200 dark:border-[#282b3e] rounded-xl px-3 py-2">
              <input
                type="number"
                min="0"
                max="12"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden"
                aria-label="Hours"
              />
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">hrs</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#181a25] border border-slate-200 dark:border-[#282b3e] rounded-xl px-3 py-2">
              <input
                type="number"
                min="0"
                max="55"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden"
                aria-label="Minutes"
              />
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">mins</span>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#272a3d] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-[#1e2130] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!taskTitle.trim()}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#ff4757] via-[#f43f5e] to-[#e11d48] hover:brightness-105 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{editingTask ? 'Save Changes' : 'Add Task'}</span>
          </button>
        </div>
      </form>

      <FolderSettingsModal
        folderId={settingsFolderId}
        onClose={() => setSettingsFolderId(null)}
      />
    </div>
  );
};

const AddTaskFolderCard: React.FC<{
  folder: FolderDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onHoldSettings: () => void;
}> = ({ folder, isSelected, onSelect, onHoldSettings }) => {
  const longPressHandlers = useLongPress({
    delay: 450,
    onLongPress: onHoldSettings,
    onClick: onSelect,
  });

  return (
    <button
      type="button"
      {...longPressHandlers}
      className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-[0.98] ${
        isSelected
          ? 'bg-[#ff4757]/8 dark:bg-[#ff4757]/12 border-[#ff4757] ring-1 ring-[#ff4757]/40 shadow-2xs'
          : 'bg-slate-50 dark:bg-[#181a25] border-slate-200 dark:border-[#26293a] hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <span
        className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
        style={{ backgroundColor: folder.color }}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-bold truncate ${
            isSelected
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {folder.name}
        </p>
        <p className="text-[10px] text-slate-400 truncate">
          {folder.subjects?.length || 0} subjects
        </p>
      </div>
      {isSelected && (
        <span className="w-4 h-4 rounded-full bg-[#ff4757] text-white flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      )}
    </button>
  );
};
