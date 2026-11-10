import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { toDateKey, formatFriendlyDate, formatDuration } from '../utils/dateUtils';
import { Flame, Star, Calendar, ChevronRight, CheckCircle2, Moon, Award } from 'lucide-react';

export const ConsistencyHeatmap: React.FC = () => {
  const { dateRecords, salahRecords, totalActualMinutes, todaySalahCount, setSelectedHistoryDate, setActiveTab } =
    useStudy();

  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    studyMins: number;
    salahCount: number;
    allSalah: boolean;
  } | null>(null);

  // Generate 35 days (5 weeks) ending today
  const { matrixDays, streakDays, totalPeriodMinutes, perfectSalahDaysCount } = useMemo(() => {
    const today = new Date();
    const days: Array<{
      date: Date;
      dateStr: string;
      studyMins: number;
      salahCount: number;
      allSalah: boolean;
      isToday: boolean;
    }> = [];

    // 35 days back
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = toDateKey(d);
      const isCurrentDay = i === 0;

      // Calculate study minutes
      const recordedMins = dateRecords[dateStr]?.totalActualMinutes || 0;
      const studyMins = isCurrentDay ? Math.max(recordedMins, totalActualMinutes) : recordedMins;

      // Calculate Salah count
      const sRec = salahRecords[dateStr];
      let sCount = 0;
      if (sRec) {
        if (sRec.fajr) sCount++;
        if (sRec.dhuhr) sCount++;
        if (sRec.asr) sCount++;
        if (sRec.maghrib) sCount++;
        if (sRec.isha) sCount++;
      } else if (isCurrentDay) {
        sCount = todaySalahCount;
      }

      days.push({
        date: d,
        dateStr,
        studyMins,
        salahCount: sCount,
        allSalah: sCount === 5,
        isToday: isCurrentDay,
      });
    }

    // Calculate current study streak
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].studyMins > 0) {
        currentStreak++;
      } else if (i === days.length - 1) {
        // If today has 0 so far, don't break streak if yesterday had study
        continue;
      } else {
        break;
      }
    }

    const totalMins = days.reduce((sum, d) => sum + d.studyMins, 0);
    const perfectSalah = days.filter((d) => d.allSalah).length;

    return {
      matrixDays: days,
      streakDays: currentStreak,
      totalPeriodMinutes: totalMins,
      perfectSalahDaysCount: perfectSalah,
    };
  }, [dateRecords, salahRecords, totalActualMinutes, todaySalahCount]);

  const getHeatmapColor = (studyMins: number) => {
    if (studyMins === 0) {
      return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-400';
    }
    if (studyMins < 60) {
      return 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400';
    }
    if (studyMins < 150) {
      return 'bg-emerald-300 dark:bg-emerald-700 border-emerald-400 dark:border-emerald-600 hover:border-emerald-300';
    }
    if (studyMins < 240) {
      return 'bg-emerald-500 text-white border-emerald-600 dark:border-emerald-400 shadow-2xs';
    }
    return 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-700 dark:border-emerald-300 shadow-xs ring-1 ring-emerald-400/50';
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedHistoryDate(dateStr);
    setActiveTab('history');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs w-full overflow-hidden">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Consistency Matrix
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Past 35 Days
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            Study & Salah Consistency Grid
          </h3>
        </div>

        {/* Badges / Highlights */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
            <Moon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>{perfectSalahDaysCount} Days 5/5 Salah</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-2xs">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatDuration(totalPeriodMinutes)} Total</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid (7 columns x 5 rows) */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="min-w-[340px]">
          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 gap-1.5 text-[10px] font-bold text-slate-400 text-center mb-1.5">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* 35 Heatmap Tiles */}
          <div className="grid grid-cols-7 gap-1.5">
            {matrixDays.map((d) => {
              const colorClass = getHeatmapColor(d.studyMins);
              const dayNum = d.date.getDate();

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => handleDayClick(d.dateStr)}
                  onMouseEnter={() =>
                    setHoveredDay({
                      dateStr: d.dateStr,
                      studyMins: d.studyMins,
                      salahCount: d.salahCount,
                      allSalah: d.allSalah,
                    })
                  }
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`relative aspect-square rounded-xl border flex flex-col items-center justify-between p-1 transition-all cursor-pointer group ${colorClass} ${
                    d.isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                  }`}
                  title={`${d.dateStr}: ${formatDuration(d.studyMins)} • ${d.salahCount}/5 Salah`}
                >
                  {/* Day Number */}
                  <span
                    className={`text-[10px] font-mono leading-none ${
                      d.studyMins >= 150 ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* 5/5 Salah Star Pip */}
                  {d.allSalah && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs" title="5/5 Salah Completed" />
                  )}

                  {/* Tiny Studied indicator or today marker */}
                  {d.isToday && (
                    <span className="text-[8px] font-extrabold uppercase text-indigo-400 leading-none">
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap Legend & Hover Detail Info Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        {/* Hovered Date Details */}
        <div className="min-h-[20px] text-slate-600 dark:text-slate-300 font-medium">
          {hoveredDay ? (
            <span className="inline-flex items-center gap-2">
              <strong className="text-slate-900 dark:text-white">
                {formatFriendlyDate(hoveredDay.dateStr)}:
              </strong>
              <span>{formatDuration(hoveredDay.studyMins)} studied</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Moon className="w-3 h-3" />
                {hoveredDay.salahCount}/5 Salah
              </span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">
              Hover or tap any date to see breakdown, or click to open history details.
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0 self-end sm:self-auto">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-800" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          <span>4h+</span>
          <span className="ml-2 inline-flex items-center gap-1 text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span>5/5 Salah</span>
          </span>
        </div>
      </div>
    </div>
  );
};
