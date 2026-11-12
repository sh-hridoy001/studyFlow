import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
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
  Award,
  GraduationCap,
  Target,
  Languages,
  Eye,
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
    selectedHistoryDate,
    setSelectedHistoryDate,
    deletePastTaskRecord,
    weeklySummary,
    monthlySummary,
    allTimeTotalMinutes,
    streakDays,
    folders,
  } = useStudy();

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

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Weekly & Monthly Summary Cards */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-[#ff4757]" />
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
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                summaryView === 'week'
                  ? 'bg-white dark:bg-[#26293b] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSummaryView('month')}
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
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
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {formatDuration(currentSummary.totalActualMinutes)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
              Goal: {formatDuration(currentSummary.totalTargetMinutes)}
            </span>
          </div>

          {/* KPI 2 */}
          <div className="bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b] rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Active Days
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {currentSummary.activeDaysCount}{' '}
              <span className="text-xs font-sans text-slate-500">days</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
              Avg: {(currentSummary.totalActualMinutes / Math.max(1, currentSummary.activeDaysCount) / 60).toFixed(1)}h/d
            </span>
          </div>

          {/* KPI 3 */}
          <div className="bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b] rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Habit Streak
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
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
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
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
            <span className="font-mono">{currentSummary.percent}% of target achieved</span>
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

          {/* Category Badges */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs pt-1">
            {folders.map((folder) => {
              const minutes = currentSummary.folderBreakdown[folder.id] || 0;
              const pct =
                currentSummary.totalActualMinutes > 0
                  ? Math.round((minutes / currentSummary.totalActualMinutes) * 100)
                  : 0;

              return (
                <div key={folder.id} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {folder.name}:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatDuration(minutes)}
                  </span>
                  <span className="text-slate-400 font-mono">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Interactive Calendar & Day Explorer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Picker (Left Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          {/* Calendar Header with Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {formatMonthYear(calendarMonth)}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={jumpToToday}
                className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              const record = dateRecords[cell.dateKey];
              const isSelected = selectedHistoryDate === cell.dateKey;
              const hasActivity = record && record.totalActualMinutes > 0;
              const isCurrentDay = isToday(cell.dateKey);

              return (
                <button
                  key={cell.dateKey}
                  onClick={() => setSelectedHistoryDate(cell.dateKey)}
                  className={`min-h-[52px] p-1.5 rounded-xl text-left flex flex-col justify-between transition-all relative border ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60'
                      : isCurrentDay
                      ? 'border-indigo-300 dark:border-indigo-800 bg-slate-50/80 dark:bg-slate-800/40'
                      : hasActivity
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : 'border-transparent text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${!cell.inCurrentMonth ? 'opacity-35' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : isCurrentDay
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Small category dots if active */}
                    {hasActivity && (
                      <div className="flex items-center gap-0.5">
                        {folders.map((folder) => {
                          const fMins = record.folderBreakdown?.[folder.id]?.actualMinutes || 0;
                          if (fMins === 0) return null;
                          return (
                            <span
                              key={folder.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: folder.color }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Study hours label on cell */}
                  {hasActivity ? (
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 truncate">
                      {formatDuration(record.totalActualMinutes)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-300 dark:text-slate-700">—</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Date Input Jump */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Jump to date:</span>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedHistoryDate(e.target.value);
                  setCalendarMonth(parseDateKey(e.target.value));
                }
              }}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-mono font-medium focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Selected Date Details (Right Column) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          {/* Header with Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>Selected Record</span>
                {isToday(selectedHistoryDate) && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                    Today
                  </span>
                )}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatFullDate(selectedHistoryDate)}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => stepDate(-1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => stepDate(1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenLogPastModal(selectedHistoryDate)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs ml-1"
                title="Log completed study hours for this date"
              >
                <Plus className="w-4 h-4" />
                <span>Log Hours</span>
              </button>

              {onOpenSyncCalendar && (
                <button
                  onClick={() => onOpenSyncCalendar(selectedHistoryDate)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-colors"
                  title="Sync this day's study sessions to Google Calendar"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Sync to Calendar</span>
                </button>
              )}
            </div>
          </div>

          {!selectedRecord || selectedRecord.totalActualMinutes === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No study records logged for this day
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Did you study offline or complete tasks on this date? You can record completed hours anytime.
              </p>
              <button
                onClick={() => onOpenLogPastModal(selectedHistoryDate)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                + Log Study Hours
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Day Total Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Actual Study Time Completed
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                    {formatDuration(selectedRecord.totalActualMinutes)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Planned Target
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                    {formatDuration(selectedRecord.totalTargetMinutes)}
                  </div>
                </div>
              </div>

              {/* Categories Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {folders.map((folder) => {
                  const fData = selectedRecord.folderBreakdown?.[folder.id] || {
                    actualMinutes: 0,
                    targetMinutes: 0,
                    tasksCount: 0,
                    completedTasksCount: 0,
                  };
                  const pct =
                    fData.targetMinutes > 0
                      ? Math.min(100, Math.round((fData.actualMinutes / fData.targetMinutes) * 100))
                      : 0;

                  return (
                    <div
                      key={folder.id}
                      className="bg-white dark:bg-slate-900 border rounded-2xl p-4 space-y-2 border-slate-200 dark:border-slate-800"
                      style={{
                        borderTopWidth: '3px',
                        borderTopColor: folder.color,
                      }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {folder.name}
                        </span>
                        <span className="font-mono text-slate-400 text-[10px] shrink-0 ml-1">
                          {fData.completedTasksCount}/{fData.tasksCount} tasks
                        </span>
                      </div>

                      <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                        {formatDuration(fData.actualMinutes)}
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: folder.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tasks List for Selected Day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Tasks & Subjects Studied ({selectedRecord.tasks.length})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {selectedRecord.tasks.map((task) => {
                    const folder =
                      folders.find((f) => f.id === task.folderId) ||
                      PRIMARY_FOLDERS[task.folderId] || {
                        name: 'Study',
                        color: '#4F46E5',
                        badgeClass:
                          'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
                      };
                    return (
                      <div
                        key={String(task.id)}
                        className={`p-3.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl flex items-center justify-between gap-3 text-xs ${
                          task.completed
                            ? 'border-slate-200 dark:border-slate-800'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div
                          className="flex items-start gap-2.5 min-w-0 flex-1 cursor-pointer"
                          onClick={() => setViewingPastTask(task as unknown as DailyTask)}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              task.completed
                                ? 'text-emerald-500 fill-emerald-50 dark:fill-emerald-950'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                                  task.completed
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {task.subjectName}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${folder.badgeClass}`}
                              >
                                {folder.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {task.topics || 'Routine study session'}
                            </p>
                            {task.notes && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">
                                Note: {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <div className="text-right font-mono">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {formatDuration(task.actualMinutes)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              target: {formatDuration(task.targetMinutes)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setViewingPastTask(task as unknown as DailyTask)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                            title="View task details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove "${task.subjectName}" from this day's log?`)) {
                                deletePastTaskRecord(selectedHistoryDate, String(task.id));
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Remove log entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
