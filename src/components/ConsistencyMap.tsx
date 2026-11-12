import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { toDateKey, formatFriendlyDate, formatDuration } from '../utils/dateUtils';
import {
  Flame,
  Calendar,
  X,
  Clock,
  Moon,
  Sparkles,
} from 'lucide-react';

interface DayActivityModalProps {
  dateStr: string;
  onClose: () => void;
}

const DayActivityModal: React.FC<DayActivityModalProps> = ({ dateStr, onClose }) => {
  const { dateRecords, salahRecords, totalActualMinutes, tasks, folders } = useStudy();

  const isToday = dateStr === toDateKey(new Date());
  const record = dateRecords[dateStr];
  const salah = salahRecords[dateStr];

  const dayMinutes = isToday
    ? Math.max(record?.totalActualMinutes || 0, totalActualMinutes)
    : record?.totalActualMinutes || 0;

  const dayTasks = isToday
    ? tasks.filter((t) => t.actualMinutes > 0 || t.completed)
    : record?.tasks || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white dark:bg-[#161722] border border-slate-200 dark:border-[#262838] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto text-slate-900 dark:text-white"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#25283a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {formatFriendlyDate(dateStr)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isToday ? "Today's Study & Salah Log" : 'Daily Activity Breakdown'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Time Highlight */}
        <div className="my-3.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
              Total Focus Time
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatDuration(dayMinutes)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Activities
            </span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
        </div>

        {/* 5-Time Salah Prayers Status */}
        <div className="mb-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#1b1d2a] border border-slate-200 dark:border-[#272a3d]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-emerald-500" />
              Daily Salah
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {((salah?.fajr ? 1 : 0) + (salah?.dhuhr ? 1 : 0) + (salah?.asr ? 1 : 0) + (salah?.maghrib ? 1 : 0) + (salah?.isha ? 1 : 0))}/5 Completed
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              { name: 'Fajr', done: !!salah?.fajr },
              { name: 'Dhuhr', done: !!salah?.dhuhr },
              { name: 'Asr', done: !!salah?.asr },
              { name: 'Maghrib', done: !!salah?.maghrib },
              { name: 'Isha', done: !!salah?.isha },
            ].map((p) => (
              <div
                key={p.name}
                className={`py-1 px-1 rounded-xl text-[10px] font-bold border transition-colors ${
                  p.done
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-[#222536] border-slate-200 dark:border-slate-700/60 text-slate-400'
                }`}
              >
                <div>{p.name}</div>
                <div className="mt-0.5 text-[11px]">{p.done ? '✓' : '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Subject & Topic Activities
          </h4>

          {dayTasks.length === 0 ? (
            <div className="text-center py-5 px-4 bg-slate-50 dark:bg-[#1b1d2a] rounded-2xl border border-slate-200 dark:border-[#272a3d] text-slate-500 dark:text-slate-400 text-xs">
              No specific task records found for this day.
            </div>
          ) : (
            dayTasks.map((t, idx) => {
              const folder = folders.find((f) => String(f.id) === String(t.folderId));
              return (
                <div
                  key={t.id || idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1c1e2c] border border-slate-200 dark:border-[#2b2e42] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: folder?.color || '#ff4757' }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.subjectName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {t.topics}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatDuration(t.actualMinutes)}
                    </div>
                    {t.targetMinutes > 0 && (
                      <div className="text-[10px] text-slate-400">
                        of {t.targetMinutes}m
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-[#ff4757] hover:bg-[#ff3344] text-white text-xs font-bold transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const ConsistencyMap: React.FC = () => {
  const {
    dateRecords,
    salahRecords,
    totalActualMinutes,
    todaySalahCount,
    streakDays,
  } = useStudy();

  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ dateStr: string; studyMins: number; salahCount: number } | null>(null);

  // Build 18 weeks (7 rows Sun..Sat x 18 columns) ending on the current week.
  // Fits 100% cleanly inside mobile (no horizontal scroll/slide) and stays crisp on desktop.
  const NUM_WEEKS = 18;

  const { weeks, monthLabels, totalActivityMinutes, activeDaysCount, allSalahDaysCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateKey(today);

    // Find Sunday of the current week (0 = Sun, 6 = Sat)
    const currentWeekSunday = new Date(today);
    currentWeekSunday.setDate(today.getDate() - today.getDay());

    // Start Sunday = (NUM_WEEKS - 1) weeks before currentWeekSunday
    const startSunday = new Date(currentWeekSunday);
    startSunday.setDate(currentWeekSunday.getDate() - (NUM_WEEKS - 1) * 7);

    interface RawCell {
      date: Date;
      dateStr: string;
      studyMins: number;
      salahCount: number;
      allSalah: boolean;
      isToday: boolean;
      isFuture: boolean;
    }

    const rawCells: RawCell[] = [];
    const totalGridDays = NUM_WEEKS * 7;

    for (let i = 0; i < totalGridDays; i++) {
      const d = new Date(startSunday);
      d.setDate(startSunday.getDate() + i);
      const dateStr = toDateKey(d);
      const isFuture = d.getTime() > today.getTime();
      const isCurrentDay = dateStr === todayStr;

      let studyMins = 0;
      let sCount = 0;

      if (!isFuture) {
        const recordedMins = dateRecords[dateStr]?.totalActualMinutes || 0;
        studyMins = isCurrentDay ? Math.max(recordedMins, totalActualMinutes) : recordedMins;

        const sRec = salahRecords[dateStr];
        if (sRec) {
          if (sRec.fajr) sCount++;
          if (sRec.dhuhr) sCount++;
          if (sRec.asr) sCount++;
          if (sRec.maghrib) sCount++;
          if (sRec.isha) sCount++;
        } else if (isCurrentDay) {
          sCount = todaySalahCount;
        }
      }

      rawCells.push({
        date: d,
        dateStr,
        studyMins,
        salahCount: sCount,
        allSalah: !isFuture && sCount === 5,
        isToday: isCurrentDay,
        isFuture,
      });
    }

    // Pure activity-based green intensity scaling (not diluted by uncompleted planned targets):
    // Days with more study time glow noticeably brighter green; peak day is Level 4.
    const activeStudyValues = rawCells
      .filter((c) => !c.isFuture && c.studyMins > 0)
      .map((c) => c.studyMins);
    const maxMins = activeStudyValues.length > 0 ? Math.max(...activeStudyValues) : 0;
    const minActiveMins = activeStudyValues.length > 0 ? Math.min(...activeStudyValues) : 0;

    const cellsWithLevel = rawCells.map((c) => {
      if (c.isFuture || c.studyMins <= 0) {
        return { ...c, level: 0 };
      }

      let level = 1;
      if (maxMins > minActiveMins) {
        // Relative scaling across active days so highest-work days hit brightest green (Level 4)
        const ratio = c.studyMins / maxMins;
        if (c.studyMins === maxMins || ratio > 0.72) level = 4;
        else if (ratio > 0.45) level = 3;
        else if (ratio > 0.2) level = 2;
        else level = 1;
      } else {
        // Only 1 active day or all active days have identical minutes: scale by absolute duration
        if (c.studyMins >= 120) level = 4;
        else if (c.studyMins >= 60) level = 3;
        else if (c.studyMins >= 25) level = 2;
        else level = 1;
      }

      return { ...c, level };
    });

    // Group into week columns (18 columns, 7 rows Sun..Sat each)
    const weekColumns: Array<typeof cellsWithLevel> = [];
    for (let w = 0; w < NUM_WEEKS; w++) {
      weekColumns.push(cellsWithLevel.slice(w * 7, (w + 1) * 7));
    }

    // Compute clean month labels aligned to the start of each month
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: Array<{ weekIndex: number; label: string }> = [];
    let lastMonth = -1;
    weekColumns.forEach((col, wIdx) => {
      const firstValidDay = col.find((d) => !d.isFuture) || col[0];
      const monthIdx = firstValidDay.date.getMonth();
      if (monthIdx !== lastMonth) {
        // Prevent label collision if month changes immediately after column 0
        const prev = labels[labels.length - 1];
        if (!prev || wIdx - prev.weekIndex >= 2) {
          labels.push({ weekIndex: wIdx, label: monthsShort[monthIdx] });
        } else {
          // Replace too-close edge label from week 0 with the incoming full month
          labels[labels.length - 1] = { weekIndex: wIdx, label: monthsShort[monthIdx] };
        }
        lastMonth = monthIdx;
      }
    });

    const pastOrToday = cellsWithLevel.filter((d) => !d.isFuture);
    const totalMins = pastOrToday.reduce((sum, d) => sum + d.studyMins, 0);
    const activeDays = pastOrToday.filter((d) => d.studyMins > 0).length;
    const allSalahDays = pastOrToday.filter((d) => d.allSalah).length;

    return {
      weeks: weekColumns,
      monthLabels: labels,
      totalActivityMinutes: totalMins,
      activeDaysCount: activeDays,
      allSalahDaysCount: allSalahDays,
    };
  }, [dateRecords, salahRecords, totalActualMinutes, todaySalahCount]);

  // Exact 5-level green scale matching classic contribution heatmap contrast in Light & Dark mode
  const getCellClasses = (level: number, isToday: boolean, isFuture: boolean) => {
    if (isFuture) {
      return 'invisible pointer-events-none';
    }

    let base = '';
    switch (level) {
      case 0:
        base =
          'bg-[#ebedf0] dark:bg-[#161b22] border-slate-200/80 dark:border-[#21262d] hover:border-slate-400 dark:hover:border-slate-500';
        break;
      case 1:
        base =
          'bg-[#9be9a8] dark:bg-[#0e4429] border-[#82d992] dark:border-[#145534] hover:brightness-110';
        break;
      case 2:
        base =
          'bg-[#40c463] dark:bg-[#006d32] border-[#30b052] dark:border-[#00853e] hover:brightness-110';
        break;
      case 3:
        base =
          'bg-[#30a14e] dark:bg-[#26a641] border-[#258a3f] dark:border-[#32c450] hover:brightness-110';
        break;
      case 4:
        base =
          'bg-[#216e39] dark:bg-[#39d353] border-[#18562b] dark:border-[#56e56e] hover:brightness-110';
        break;
      default:
        base = 'bg-[#ebedf0] dark:bg-[#161b22] border-slate-200/80 dark:border-[#21262d]';
    }

    if (isToday) {
      return `${base} ring-1 ring-[#ff4757] ring-offset-1 ring-offset-white dark:ring-offset-[#13141d]`;
    }
    return base;
  };

  return (
    <div className="w-full bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 shadow-xs text-slate-900 dark:text-white">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Consistency Map
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {activeDaysCount} active {activeDaysCount === 1 ? 'day' : 'days'}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Daily Activity Heatmap
          </h3>
        </div>

        {/* Compact Streak Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold tabular-nums">
            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{streakDays}d</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tabular-nums">
            <Moon className="w-3 h-3 fill-emerald-500 text-emerald-500" />
            <span>{allSalahDaysCount}d 5/5</span>
          </div>
        </div>
      </div>

      {/* Zero-scroll Week-Column Matrix (compact on both mobile & desktop) */}
      <div className="w-full max-w-[360px] mx-auto select-none">
        {/* Month Header Row */}
        <div className="flex items-end mb-1">
          <div className="w-6 shrink-0" />
          <div className="flex-1 flex gap-[3px] text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
            {weeks.map((_, wIdx) => {
              const found = monthLabels.find((m) => m.weekIndex === wIdx);
              return (
                <div key={wIdx} className="flex-1 min-w-0 relative h-3.5">
                  {found && (
                    <span className="absolute left-0 top-0 whitespace-nowrap">
                      {found.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekday Labels (Mon, Wed, Fri) + 18 Week Columns x 7 Rows */}
        <div className="flex items-stretch gap-1">
          {/* Left Weekday Axis (7 rows: Sun..Sat, displaying Mon, Wed, Fri) */}
          <div className="w-6 shrink-0 flex flex-col justify-between py-[1px] text-[9px] font-medium text-slate-400 dark:text-slate-500 leading-none">
            <span className="h-[11px] sm:h-[13px]" />
            <span className="flex items-center h-[11px] sm:h-[13px]">Mon</span>
            <span className="h-[11px] sm:h-[13px]" />
            <span className="flex items-center h-[11px] sm:h-[13px]">Wed</span>
            <span className="h-[11px] sm:h-[13px]" />
            <span className="flex items-center h-[11px] sm:h-[13px]">Fri</span>
            <span className="h-[11px] sm:h-[13px]" />
          </div>

          {/* Grid of 18 Week Columns */}
          <div className="flex-1 flex gap-[3px]">
            {weeks.map((weekCol, wIdx) => (
              <div key={wIdx} className="flex-1 flex flex-col gap-[3px]">
                {weekCol.map((day) => (
                  <button
                    key={day.dateStr}
                    type="button"
                    disabled={day.isFuture}
                    onClick={() => !day.isFuture && setSelectedDateModal(day.dateStr)}
                    onMouseEnter={() =>
                      !day.isFuture &&
                      setHoveredDay({
                        dateStr: day.dateStr,
                        studyMins: day.studyMins,
                        salahCount: day.salahCount,
                      })
                    }
                    onMouseLeave={() => setHoveredDay(null)}
                    onFocus={() =>
                      !day.isFuture &&
                      setHoveredDay({
                        dateStr: day.dateStr,
                        studyMins: day.studyMins,
                        salahCount: day.salahCount,
                      })
                    }
                    onBlur={() => setHoveredDay(null)}
                    className={`w-full aspect-square rounded-[2px] sm:rounded-[3px] border transition-transform cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${getCellClasses(
                      day.level,
                      day.isToday,
                      day.isFuture
                    )}`}
                    title={
                      day.isFuture
                        ? ''
                        : `${formatFriendlyDate(day.dateStr)}: ${
                            day.studyMins > 0 ? formatDuration(day.studyMins) : 'No study logged'
                          } (${day.salahCount}/5 Salah)`
                    }
                    aria-label={
                      day.isFuture
                        ? undefined
                        : `${formatFriendlyDate(day.dateStr)}, ${formatDuration(day.studyMins)}`
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Live hover preview or tap instruction */}
        <div className="mt-2 h-4 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          {hoveredDay ? (
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
              <strong className="text-emerald-600 dark:text-emerald-400">
                {hoveredDay.studyMins > 0 ? formatDuration(hoveredDay.studyMins) : '0m'}
              </strong>{' '}
              on {formatFriendlyDate(hoveredDay.dateStr)} · {hoveredDay.salahCount}/5 Salah
            </span>
          ) : (
            <span>Tap any square to inspect that day&apos;s activities</span>
          )}
        </div>
      </div>

      {/* Footer: Total Activities Time + Intensity Legend */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#202231] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Total Activities Time:</span>
          <strong className="text-slate-900 dark:text-white font-bold text-xs tabular-nums">
            {formatDuration(totalActivityMinutes)}
          </strong>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22] border border-slate-200/80 dark:border-[#21262d]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429] border border-[#82d992] dark:border-[#145534]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#40c463] dark:bg-[#006d32] border border-[#30b052] dark:border-[#00853e]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#30a14e] dark:bg-[#26a641] border border-[#258a3f] dark:border-[#32c450]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#216e39] dark:bg-[#39d353] border border-[#18562b] dark:border-[#56e56e]" />
          <span>More</span>
        </div>
      </div>

      {selectedDateModal && (
        <DayActivityModal
          dateStr={selectedDateModal}
          onClose={() => setSelectedDateModal(null)}
        />
      )}
    </div>
  );
};
