import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAppControl } from '../context/AppControlContext';
import { MilestoneGoal } from '../types';
import { Target, Calendar, Clock, Plus, Trash2, CheckCircle2, ChevronRight, X, Sparkles, AlertCircle, Crown, Lock } from 'lucide-react';
import { toDateKey } from '../utils/dateUtils';

export const MilestoneCountdownWidget: React.FC = () => {
  const { milestones, addMilestone, deleteMilestone, toggleMilestoneCompleted } = useStudy();
  const { isPro, globalConfig, openUpgradeModal } = useAppControl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetDailyHours, setTargetDailyHours] = useState(4);
  const [category, setCategory] = useState('Academic');
  const [notes, setNotes] = useState('');

  const isAtFreeMilestoneLimit = !isPro && milestones.length >= globalConfig.freeMaxMilestones;

  const handleOpenAddMilestone = () => {
    if (isAtFreeMilestoneLimit) {
      openUpgradeModal('Unlimited Exam Milestones');
      return;
    }
    setIsModalOpen(true);
  };

  const calculateDaysRemaining = (dateStr: string): number => {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAtFreeMilestoneLimit) {
      setIsModalOpen(false);
      openUpgradeModal('Unlimited Exam Milestones');
      return;
    }
    if (!title.trim() || !targetDate) return;
    addMilestone({
      title: title.trim(),
      targetDate,
      targetDailyHours: Number(targetDailyHours) || 3,
      category,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setTargetDate('');
    setNotes('');
    setIsModalOpen(false);
  };

  // Sort: active upcoming first
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });

  if (!isPro) {
    return (
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs w-full">
        <div className="w-12 h-12 rounded-2xl bg-[var(--app-accent)] flex items-center justify-center text-white mx-auto shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--app-accent)] block">
            Pro Feature · 30-Day Free Trial Ended
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Exam Countdowns &amp; Milestones Locked
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Upgrade to FocusTrack Pro (or unlock 24h free access via a short ad) to track unlimited exam deadlines, countdowns, and daily goal targets.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openUpgradeModal('Exam Countdowns & Milestones')}
          className="px-5 py-2.5 rounded-xl bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Crown className="w-4 h-4" />
          <span>Unlock Goals &amp; Milestones</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Target Deadlines
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-[var(--app-accent)]">
              {!isPro
                ? `Free: ${milestones.length}/${globalConfig.freeMaxMilestones} goals`
                : 'Exam & Goal Countdown'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            Upcoming Milestones & Targets
          </h3>
        </div>

        <button
          type="button"
          onClick={handleOpenAddMilestone}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--app-accent-soft)] hover:opacity-90 border border-[var(--app-accent)]/30 text-[var(--app-accent)] font-bold text-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          {isAtFreeMilestoneLimit ? (
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>{isAtFreeMilestoneLimit ? 'Unlock More Goals' : 'Add Exam / Goal'}</span>
        </button>
      </div>

      {/* Milestones Cards Grid */}
      {sortedMilestones.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-[#26293a] rounded-2xl">
          <Target className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">No target exams or goals added yet.</p>
          <button
            type="button"
            onClick={handleOpenAddMilestone}
            className="mt-2 text-xs font-bold text-[var(--app-accent)] hover:underline cursor-pointer"
          >
            + Add your first exam or goal target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedMilestones.map((m) => {
            const daysLeft = calculateDaysRemaining(m.targetDate);
            const isPassed = daysLeft < 0;
            const isToday = daysLeft === 0;

            return (
              <div
                key={m.id}
                className={`border rounded-2xl p-4 transition-all flex flex-col justify-between relative group ${
                  m.completed
                    ? 'bg-slate-50 dark:bg-[#171925]/60 border-slate-200 dark:border-[#222434] opacity-75'
                    : daysLeft <= 7 && !isPassed
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-xs'
                    : 'bg-slate-50/80 dark:bg-[#181a26] border-slate-200 dark:border-[#26293b] hover:border-[var(--app-accent)]/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      {m.category || 'Target'}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteMilestone(m.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4
                    className={`font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 ${
                      m.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {m.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Target: {m.targetDate}</span>
                  </div>

                  {m.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic line-clamp-1">
                      "{m.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Countdown & Action */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1">
                    {m.completed ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : isToday ? (
                      <span className="text-sm font-black text-amber-500 animate-pulse">
                        Exam Day Today! 🎯
                      </span>
                    ) : isPassed ? (
                      <span className="text-xs font-semibold text-slate-400">Date Passed</span>
                    ) : (
                      <>
                        <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 leading-none">
                          {daysLeft}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {daysLeft === 1 ? 'day left' : 'days left'}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {m.targetDailyHours ? (
                      <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline" title="Target study hours per day">
                        {m.targetDailyHours}h/day
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleMilestoneCompleted(m.id)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                        m.completed
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {m.completed ? 'Done ✓' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base">Add Exam or Target Goal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam / Target Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester Final Exam, IELTS Exam, BUET Admission"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Study Target
                  </label>
                  <select
                    value={targetDailyHours}
                    onChange={(e) => setTargetDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value={2}>2 Hours / day</option>
                    <option value={3}>3 Hours / day</option>
                    <option value={4}>4 Hours / day</option>
                    <option value={5}>5 Hours / day</option>
                    <option value={6}>6+ Hours / day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Academic, Admission, Language, Certification"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Strategy / Motivation Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete chapter question banks & 5 mock tests"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
