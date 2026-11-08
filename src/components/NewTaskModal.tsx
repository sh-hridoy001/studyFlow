import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { DailyTask, PrimaryFolderId } from '../types';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { X, Calendar } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: PrimaryFolderId;
  editingTask?: DailyTask | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultFolderId,
  editingTask,
}) => {
  const { addTask, updateTask } = useStudy();

  const [folderId, setFolderId] = useState<PrimaryFolderId>(defaultFolderId || 'academic');
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
      setFolderId(defaultFolderId || 'academic');
      setSubjectName('');
      setTopics('');
      setHours('1');
      setMinutes('30');
      setNotes('');
    }
  }, [editingTask, defaultFolderId, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
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
              Select Primary Folder
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['academic', 'admission', 'english'] as PrimaryFolderId[]).map((fKey) => {
                const folder = PRIMARY_FOLDERS[fKey];
                const isSelected = folderId === fKey;
                return (
                  <button
                    key={fKey}
                    type="button"
                    onClick={() => setFolderId(fKey)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span>
                        {fKey === 'academic' ? 'Academic' : fKey === 'admission' ? 'Admission' : 'English'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {folder.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Subject Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject / Test Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Operating Systems, GRE Quantitative, IELTS Speaking"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* 3. Daily Topics */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Today's Specific Topics or Target
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Virtual Memory & Page Tables practice set"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* 4. Target Hours */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Study Time for Today
            </label>
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
                  step="10"
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
