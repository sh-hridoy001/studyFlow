import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAppControl } from '../context/AppControlContext';
import { PrimaryFolderId, DateStudyRecord, DailyTask } from '../types';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import {
  formatDuration,
  formatFullDate,
  formatMonthYear,
  toDateKey,
  parseDateKey,
  isToday,
} from '../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  Eye,
  Moon,
  BookOpen,
  Sparkles,
  Lock,
  Crown,
} from 'lucide-react';
import { TaskDetailsModal } from './TaskDetailsModal';

interface StudyHistoryProps {
  onOpenLogPastModal: (dateKey: string) => void;
  onOpenSyncCalendar?: (dateKey: string) => void;
}

export const StudyHistory: React.FC<StudyHistoryProps> = ({
  onOpenLogPastModal,
  onOpenSyncCalendar,
}) => {
  const {
    dateRecords,
    salahRecords,
    selectedHistoryDate,
    setSelectedHistoryDate,
    deletePastTaskRecord,
    weeklySummary,
    monthlySummary,
    allTimeTotalMinutes,
    streakDays,
    folders,
    accentColor,
  } = useStudy();
  const { isPro, openUpgradeModal } = useAppControl();

  const accent = accentColor || '#ff4757';
  const [viewingPastTask, setViewingPastTask] = useState<DailyTask | null>(null);

  // Summary period selector: 'week' | 'month' | 'all'
  const [summaryView, setSummaryView] = useState<'week' | 'month'>('week');

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    return parseDateKey(selectedHistoryDate);
  });

  const selectedRecord: DateStudyRecord | undefined = dateRecords[selectedHistoryDate];

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: { dateKey: string; dayNumber: number; inCurrentMonth: boolean }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateKey: toDateKey(prevDate),
        dayNumber: d,
        inCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      days.push({
        dateKey: toDateKey(currentDate),
        dayNumber: d,
        inCurrentMonth: true,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateKey: toDateKey(nextDate),
        dayNumber: i,
        inCurrentMonth: false,
      });
    }

    return days;
  }, [calendarMonth]);

  const changeMonth = (delta: number) => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCalendarMonth(today);
    setSelectedHistoryDate(toDateKey(today));
  };

  const stepDate = (delta: number) => {
    const d = parseDateKey(selectedHistoryDate);
    d.setDate(d.getDate() + delta);
    const newKey = toDateKey(d);
    setSelectedHistoryDate(newKey);
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const currentSummary = summaryView === 'week' ? weeklySummary : monthlySummary;

  const [confirmDeleteTaskKey, setConfirmDeleteTaskKey] = useState<string | null>(null);

  if (!isPro) {
    return (
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md"
          style={{ backgroundColor: accent }}
        >
          <Lock className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <span
            className="text-[11px] font-extrabold uppercase tracking-wider block"
            style={{ color: accent }}
          >
            Pro Feature · 30-Day Free Trial Ended
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            All Study History &amp; Analytics Locked
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your Study Timer and 5-Time Salah Tracker stay free forever. Upgrade to FocusTrack Pro
            to unlock past daily logs, calendar explorer, weekly/monthly breakdowns, and custom themes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openUpgradeModal('All Study History & Analytics')}
          className="px-5 py-2.5 rounded-xl text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-md cursor-pointer hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          <Crown className="w-4 h-4" />
          <span>Unlock Full History &amp; Analytics</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Weekly & Monthly Summary Cards */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              <span>Aggregate Study Analytics</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {summaryView === 'week' ? 'This Week’s Study Summary' : 'This Month’s Study Summary'}
            </h2>
          </div>

          {/* Toggle between Weekly and Monthly */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#191b27] border border-slate-200 dark:border-[#26293a] rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setSummaryView('week')}
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                summaryView === 'week'
                  ? 'bg-white dark:bg-[#26293b] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSummaryView('month')}
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                summaryView === 'month'
                  ? 'bg-white dark:bg-[#26293b] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* 4-KPI Overview Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {/* KPI 1 */}
          <div className="bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b] rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              {summaryView === 'week' ? 'This Week' : 'This Month'}
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatDuration(currentSummary.totalActualMinutes)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5 block">
              Goal: {formatDuration(currentSummary.totalTargetMinutes)}
            </span>
          </div>

          {/* KPI 2 */}
          <div className="bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b] rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Active Days
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {currentSummary.activeDaysCount}{' '}
              <span className="text-xs font-sans text-slate-500">days</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5 block">
              Avg: {(currentSummary.totalActualMinutes / Math.max(1, currentSummary.activeDaysCount) / 60).toFixed(1)}h/d
            </span>
          </div>

          {/* KPI 3 */}
          <div className="bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b] rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Habit Streak
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{streakDays}</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
              {streakDays > 0 ? 'Consecutive days' : 'Start today!'}
            </span>
          </div>

          {/* KPI 4 */}
          <div className="bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b] rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              All-Time
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatDuration(allTimeTotalMinutes)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Total logged
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Category Time Distribution</span>
            <span className="font-mono tabular-nums">{currentSummary.percent}% of target achieved</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            {folders.map((folder) => {
              const minutes = currentSummary.folderBreakdown[folder.id] || 0;
              if (minutes === 0) return null;
              const widthPct =
                currentSummary.totalActualMinutes > 0
                  ? (minutes / currentSummary.totalActualMinutes) * 100
                  : 0;

              return (
                <div
                  key={folder.id}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: folder.color,
                  }}
                  title={`${folder.name}: ${formatDuration(minutes)}`}
                />
              );
            })}
          </div>

          {/* Category Labels (Only folders with logged study minutes) */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1.5">
            {folders
              .filter((folder) => (currentSummary.folderBreakdown[folder.id] || 0) > 0)
              .map((folder) => {
                const minutes = currentSummary.folderBreakdown[folder.id] || 0;
                const pct =
                  currentSummary.totalActualMinutes > 0
                    ? Math.round((minutes / currentSummary.totalActualMinutes) * 100)
                    : 0;

                return (
                  <div
                    key={folder.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#191b27] border border-slate-200/80 dark:border-[#262a3d]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {folder.name}
                    </span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatDuration(minutes)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      ({pct}%)
                    </span>
                  </div>
                );
              })}
            {currentSummary.totalActualMinutes === 0 && (
              <span className="text-xs text-slate-400">
                No study sessions recorded in this period yet.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Interactive Calendar & Day Explorer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Calendar Picker (Left Column) */}
        <div className="lg:col-span-5 min-w-0 w-full overflow-hidden bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Calendar Header with Month Navigation */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap truncate">
                {formatMonthYear(calendarMonth)}
              </h3>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={jumpToToday}
                className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((cell) => {
              const record = dateRecords[cell.dateKey];
              const isSelected = selectedHistoryDate === cell.dateKey;
              const hasActivity = Boolean(record && record.totalActualMinutes > 0);
              const isCurrentDay = isToday(cell.dateKey);
              const activeFolders = hasActivity
                ? folders.filter((f) => (record.folderBreakdown?.[f.id]?.actualMinutes || 0) > 0)
                : [];

              return (
                <button
                  type="button"
                  key={cell.dateKey}
                  onClick={() => setSelectedHistoryDate(cell.dateKey)}
                  className={`min-w-0 w-full overflow-hidden min-h-[52px] sm:min-h-[58px] p-1 sm:p-1.5 rounded-xl text-left flex flex-col justify-between transition-all relative border cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60'
                      : isCurrentDay
                      ? 'border-indigo-300 dark:border-indigo-700 bg-slate-50/80 dark:bg-slate-800/40'
                      : hasActivity
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171925] hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : 'border-transparent text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${!cell.inCurrentMonth ? 'opacity-35' : ''}`}
                >
                  <div className="flex items-center justify-between gap-0.5 w-full min-w-0">
                    <span
                      className={`text-[11px] sm:text-xs font-mono font-semibold tabular-nums leading-none shrink-0 ${
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : isCurrentDay
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Compact folder dots clipped cleanly within cell bounds */}
                    {activeFolders.length > 0 && (
                      <div className="flex items-center gap-0.5 shrink-0 max-w-[22px] overflow-hidden justify-end">
                        {activeFolders.slice(0, 3).map((folder) => (
                          <span
                            key={folder.id}
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: folder.color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Study hours label cleanly contained inside cell */}
                  {hasActivity ? (
                    <span className="block w-full text-[9px] sm:text-[10px] font-mono font-bold tabular-nums leading-tight text-slate-600 dark:text-slate-300 truncate">
                      {formatDuration(record.totalActualMinutes)}
                    </span>
                  ) : (
                    <span className="text-[9px] leading-none text-slate-300 dark:text-slate-700">—</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Date Input Jump */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Jump to date:</span>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedHistoryDate(e.target.value);
                  setCalendarMonth(parseDateKey(e.target.value));
                }
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono font-medium focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Selected Date Details (Right Column) */}
        <div className="lg:col-span-7 min-w-0 w-full overflow-hidden bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-4 sm:p-6 shadow-xs space-y-5">
          {/* Header with Navigation Controls */}
          <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Selected Record</span>
                {isToday(selectedHistoryDate) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      Today
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {formatFullDate(selectedHistoryDate)}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => stepDate(-1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => stepDate(1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenLogPastModal(selectedHistoryDate)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                title="Log completed study hours for this date"
              >
                <Plus className="w-4 h-4" />
                <span>Log Hours</span>
              </button>

              {onOpenSyncCalendar && (
                <button
                  type="button"
                  onClick={() => onOpenSyncCalendar(selectedHistoryDate)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Sync this day's study sessions to Google Calendar"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Sync Calendar</span>
                </button>
              )}
            </div>
          </div>

          {(() => {
            const studiedFolders = selectedRecord
              ? folders.filter(
                  (f) => (selectedRecord.folderBreakdown?.[f.id]?.actualMinutes || 0) > 0
                )
              : [];
            const studiedItems = selectedRecord
              ? selectedRecord.tasks.filter((t) => t.actualMinutes > 0 || t.completed)
              : [];

            const daySalah = salahRecords[selectedHistoryDate];
            const prayedNames = [
              { key: 'fajr', label: 'Fajr', done: Boolean(daySalah?.fajr) },
              { key: 'dhuhr', label: 'Dhuhr', done: Boolean(daySalah?.dhuhr) },
              { key: 'asr', label: 'Asr', done: Boolean(daySalah?.asr) },
              { key: 'maghrib', label: 'Maghrib', done: Boolean(daySalah?.maghrib) },
              { key: 'isha', label: 'Isha', done: Boolean(daySalah?.isha) },
            ].filter((p) => p.done);

            const hasStudy =
              Boolean(selectedRecord && selectedRecord.totalActualMinutes > 0) ||
              studiedItems.length > 0;

            if (!hasStudy && prayedNames.length === 0) {
              return (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-[#161823]">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No completed study or Salah logged on this date
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Only subjects and prayers you actually studied or completed appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenLogPastModal(selectedHistoryDate)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    + Log Study Hours
                  </button>
                </div>
              );
            }

            const totalDayMins = selectedRecord?.totalActualMinutes || 0;

            return (
              <div className="space-y-5">
                {/* Attractive Day Total Hero Banner */}
                {hasStudy && (
                  <div
                    className="p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-wrap items-center justify-between gap-4"
                    style={{
                      background: `linear-gradient(135deg, ${accent}14 0%, rgba(16,185,129,0.08) 100%)`,
                      borderColor: `${accent}30`,
                    }}
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
                        Total Focus Studied
                      </span>
                      <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                        {formatDuration(totalDayMins)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="px-3 py-2 rounded-xl bg-white/80 dark:bg-[#13141d]/80 border border-slate-200/80 dark:border-[#2a2e44] text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Studied
                        </span>
                        <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                          {studiedItems.length} {studiedItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      {studiedFolders.length > 0 && (
                        <div className="px-3 py-2 rounded-xl bg-white/80 dark:bg-[#13141d]/80 border border-slate-200/80 dark:border-[#2a2e44] text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Folders
                          </span>
                          <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                            {studiedFolders.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Salah Completed That Day (Only prayed Salah shown cleanly) */}
                {prayedNames.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-700/40 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                          Salah Completed ({prayedNames.length}/5)
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                          Prayers recorded on this date
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {prayedNames.map((p) => (
                        <span
                          key={p.key}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Studied Folders Breakdown (Only folders with actualMinutes > 0) */}
                {studiedFolders.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Folders Studied
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {studiedFolders.map((folder) => {
                        const fData = selectedRecord!.folderBreakdown[folder.id];
                        const sharePct =
                          totalDayMins > 0
                            ? Math.round((fData.actualMinutes / totalDayMins) * 100)
                            : 0;

                        return (
                          <div
                            key={folder.id}
                            className="min-w-0 bg-slate-50/80 dark:bg-[#171925] border border-slate-200 dark:border-[#26293b] rounded-2xl p-3.5 space-y-2 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: folder.color }}
                                />
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                                  {folder.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                                {sharePct}%
                              </span>
                            </div>

                            <div className="text-lg sm:text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white whitespace-nowrap">
                              {formatDuration(fData.actualMinutes)}
                            </div>

                            <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(8, sharePct)}%`,
                                  backgroundColor: folder.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Studied & Completed Items Only (Unstarted 0m tasks hidden) */}
                {studiedItems.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" style={{ color: accent }} />
                        <span>What You Studied ({studiedItems.length})</span>
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {studiedItems.map((task) => {
                        const taskKey = `${selectedHistoryDate}:${String(task.id)}`;
                        const folder =
                          folders.find((f) => f.id === task.folderId) ||
                          PRIMARY_FOLDERS[task.folderId] || {
                            name: 'Study',
                            color: '#4F46E5',
                          };
                        const sharePct =
                          totalDayMins > 0 && task.actualMinutes > 0
                            ? Math.round((task.actualMinutes / totalDayMins) * 100)
                            : 0;

                        return (
                          <div
                            key={String(task.id)}
                            className="relative overflow-hidden p-3.5 bg-slate-50/90 dark:bg-[#171925] border border-slate-200 dark:border-[#26293b] hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl flex items-center justify-between gap-3 text-xs min-w-0 transition-colors"
                          >
                            {/* Left folder color accent bar */}
                            <span
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ backgroundColor: folder.color }}
                            />

                            <div
                              className="flex items-start gap-2.5 min-w-0 flex-1 pl-1.5 cursor-pointer"
                              onClick={() => setViewingPastTask(task as unknown as DailyTask)}
                            >
                              <div
                                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: `${folder.color}18`,
                                  color: folder.color,
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-slate-900 dark:text-white truncate">
                                    {task.subjectName}
                                  </span>
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                                    style={{
                                      color: folder.color,
                                      borderColor: `${folder.color}35`,
                                      backgroundColor: `${folder.color}10`,
                                    }}
                                  >
                                    {folder.name}
                                  </span>
                                </div>

                                {task.topics && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                                    {task.topics}
                                  </p>
                                )}
                                {task.notes && (
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 truncate">
                                    Note: {task.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                              <div className="text-right font-mono tabular-nums">
                                <div className="px-2 py-0.5 rounded-lg bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 font-extrabold whitespace-nowrap">
                                  {task.actualMinutes > 0
                                    ? formatDuration(task.actualMinutes)
                                    : 'Done'}
                                </div>
                                {sharePct > 0 && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                                    {sharePct}% of day
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => setViewingPastTask(task as unknown as DailyTask)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                                title="View study details"
                                aria-label="View study details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {confirmDeleteTaskKey === taskKey ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deletePastTaskRecord(selectedHistoryDate, String(task.id));
                                      setConfirmDeleteTaskKey(null);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteTaskKey(null)}
                                    className="px-1.5 py-1 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteTaskKey(taskKey)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="Remove log entry"
                                  aria-label="Remove log entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Task Details Modal for past records */}
      <TaskDetailsModal
        isOpen={!!viewingPastTask}
        task={viewingPastTask}
        onClose={() => setViewingPastTask(null)}
      />
    </div>
  );
};
