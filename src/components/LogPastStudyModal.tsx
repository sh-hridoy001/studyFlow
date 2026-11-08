import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { PrimaryFolderId } from '../types';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { formatFullDate } from '../utils/dateUtils';
import { X, Clock, Calendar } from 'lucide-react';

interface LogPastStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDateKey?: string;
}

export const LogPastStudyModal: React.FC<LogPastStudyModalProps> = ({
  isOpen,
  onClose,
  targetDateKey,
}) => {
  const { addPastStudyEntry } = useStudy();

  const [date, setDate] = useState(targetDateKey || new Date().toISOString().slice(0, 10));
  const [folderId, setFolderId] = useState<PrimaryFolderId>('academic');
  const [subjectName, setSubjectName] = useState('');
  const [topics, setTopics] = useState('');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (targetDateKey) {
      setDate(targetDateKey);
    }
  }, [targetDateKey, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !date) return;

    const totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
    if (totalMinutes <= 0) return;

    addPastStudyEntry({
      date,
      folderId,
      subjectName: subjectName.trim(),
      topics: topics.trim(),
      durationMinutes: totalMinutes,
      completed,
      notes: notes.trim() || undefined,
    });

    onClose();
    setSubjectName('');
    setTopics('');
    setNotes('');
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
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Log Past Study Record
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Record study duration and completed tasks for a specific date
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Record Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Folder Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category Folder
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['academic', 'admission', 'english'] as PrimaryFolderId[]).map((fKey) => {
                const folder = PRIMARY_FOLDERS[fKey];
                const isSelected = folderId === fKey;
                return (
                  <button
                    key={fKey}
                    type="button"
                    onClick={() => setFolderId(fKey)}
                    className={`p-2 rounded-xl text-center border font-bold transition-all text-xs ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {fKey === 'academic' ? 'Academic' : fKey === 'admission' ? 'Admission' : 'English'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject / Test Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Linear Algebra, GRE Vocabulary, IELTS Listening"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Topics or Chapters Covered
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 5 Orthogonality & Gram-Schmidt derivations"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Study Time Completed
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

          {/* Completed Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="font-medium">Mark this task as completed</span>
          </label>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Scored 28/30 on practice test"
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
              Add to History
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
