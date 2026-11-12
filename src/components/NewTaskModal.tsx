import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask } from '../types';
import { X, Calendar, Plus } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string;
  editingTask?: DailyTask | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultFolderId,
  editingTask,
}) => {
  const { addTask, updateTask, folders } = useStudy();

  const [folderId, setFolderId] = useState<string>(
    defaultFolderId || (folders[0]?.id || 'academic')
  );
  const [subjectName, setSubjectName] = useState('');
  const [topics, setTopics] = useState('');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTask) {
      setFolderId(editingTask.folderId);
      setSubjectName(editingTask.subjectName);
      setTopics(editingTask.topics);
      setHours(Math.floor(editingTask.targetMinutes / 60).toString());
      setMinutes((editingTask.targetMinutes % 60).toString());
      setNotes(editingTask.notes || '');
    } else {
      setFolderId(defaultFolderId || (folders[0]?.id || 'academic'));
      setSubjectName('');
      setTopics('');
      setHours('1');
      setMinutes('30');
      setNotes('');
    }
  }, [editingTask, defaultFolderId, isOpen, folders]);

  if (!isOpen) return null;

  const currentFolder = folders.find((f) => f.id === folderId) || folders[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const totalTarget = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);

    if (editingTask) {
      updateTask(editingTask.id, {
        folderId,
        subjectName: subjectName.trim(),
        topics: topics.trim(),
        targetMinutes: Math.max(10, totalTarget),
        notes: notes.trim() || undefined,
      });
    } else {
      addTask({
        folderId,
        subjectName: subjectName.trim(),
        topics: topics.trim(),
        targetMinutes: Math.max(10, totalTarget),
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative my-8 animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTask ? 'Edit Study Task' : 'Daily Morning Planning'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Add target subject and study goals under your chosen category folder
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Folder Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Folder
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {folders.map((folder) => {
                const isSelected = folderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setFolderId(folder.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {folder.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Subject Name + Quick Suggested Chips from Folder's Sub-folders */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Subject / Sub-Folder Name *
              </label>
            </div>

            {/* Quick chips if current folder has subjects configured */}
            {currentFolder && (currentFolder.subjects || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentFolder.subjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubjectName(s)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      subjectName === s
                        ? 'bg-indigo-600 text-white border-transparent font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              required
              placeholder="e.g. Operating Systems, GRE Quantitative, IELTS Speaking"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* 3. Daily Topics + Quick Pick Chapters */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Today's Specific Topics or Target
              </label>
            </div>

            {/* Quick suggested chapters from this subject folder */}
            {(() => {
              const sf = currentFolder?.subjectFolders?.find(
                (item) => item.name.toLowerCase() === subjectName.toLowerCase()
              );
              if (!sf || !sf.chapters || sf.chapters.length === 0) return null;

              return (
                <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider w-full mb-0.5">
                    Select Chapter / Note:
                  </span>
                  {sf.chapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setTopics(ch.title);
                        if (ch.importantPoints && !notes) {
                          setNotes(`Key Focus: ${ch.importantPoints.slice(0, 120)}`);
                        }
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all text-left truncate max-w-[200px] ${
                        topics === ch.title
                          ? 'bg-indigo-600 text-white border-transparent font-bold'
                          : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                      }`}
                      title={ch.title}
                    >
                      {ch.title}
                    </button>
                  ))}
                </div>
              );
            })()}

            <input
              type="text"
              placeholder="e.g. Chapter 4 Virtual Memory & Page Tables practice set"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* 4. Target Hours & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Target Study Time for Today
              </label>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Quick Presets
              </span>
            </div>

            {/* Quick 1-tap duration preset pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                { h: '0', m: '25', label: '25m Pomodoro' },
                { h: '0', m: '45', label: '45m Lecture' },
                { h: '1', m: '0', label: '1h Focus' },
                { h: '1', m: '30', label: '1.5h Standard' },
                { h: '2', m: '0', label: '2h Intensive' },
              ].map((p) => {
                const isSelected = hours === p.h && minutes === p.m;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setHours(p.h);
                      setMinutes(p.m);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff4757] text-white border-[#ff4757] shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold"
                />
                <span className="text-slate-500 dark:text-slate-400">hours</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold"
                />
                <span className="text-slate-500 dark:text-slate-400">mins</span>
              </div>
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lab submission deadline tomorrow at 5 PM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-normal"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-xs"
            >
              {editingTask ? 'Save Changes' : 'Add to Today\'s Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
