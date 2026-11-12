import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { toDateKey, formatFriendlyDate, formatDuration } from '../utils/dateUtils';
import {
  Flame,
  Star,
  Calendar,
  X,
  CheckCircle2,
  Clock,
  BookOpen,
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

  // If today, include live tasks and live today actual minutes
  const dayMinutes = isToday
    ? Math.max(record?.totalActualMinutes || 0, totalActualMinutes)
    : record?.totalActualMinutes || 0;

  // Tasks for this date
  const dayTasks = isToday
    ? tasks.filter((t) => t.actualMinutes > 0 || t.completed)
    : record?.tasks || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-[#161722] border border-[#262838] rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#25283a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {formatFriendlyDate(dateStr)}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isToday ? "Today's Study & Salah Log" : 'Historical Activity Breakdown'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Time Highlight */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/50 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
              Total Focus Time
            </span>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {formatDuration(dayMinutes)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Activities Logged
            </span>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
        </div>

        {/* 5-Time Salah Prayers Status */}
        <div className="mb-4 p-3.5 rounded-2xl bg-[#1b1d2a] border border-[#272a3d]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              Daily Salah Prayers
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">
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
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-colors ${
                  p.done
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-[#222536] border-slate-700/60 text-slate-500'
                }`}
              >
                <div>{p.name}</div>
                <div className="mt-0.5 text-xs">{p.done ? '✓' : '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Subject & Topic Activities
          </h4>

          {dayTasks.length === 0 ? (
            <div className="text-center py-6 px-4 bg-[#1b1d2a] rounded-2xl border border-[#272a3d] text-slate-400 text-xs">
              No specific task records found for this day.
            </div>
          ) : (
            dayTasks.map((t, idx) => {
              const folder = folders.find((f) => String(f.id) === String(t.folderId));
              return (
                <div
                  key={t.id || idx}
                  className="p-3 rounded-2xl bg-[#1c1e2c] border border-[#2b2e42] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: folder?.color || '#ff4757' }}
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {t.subjectName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {t.topics}
                    </p>
                    {t.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                        Note: {t.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-400">
                      {formatDuration(t.actualMinutes)}
                    </div>
                    {t.targetMinutes > 0 && (
                      <div className="text-[10px] text-slate-500">
                        of {t.targetMinutes}m target
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl bg-[#ff4757] hover:bg-[#ff3344] text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const GitHubConsistencyHeatmap: React.FC = () => {
  const { dateRecords, salahRecords, totalActualMinutes, todaySalahCount } = useStudy();

  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

  // Generate 28 days (4 weeks x 7 days) ending today: fits perfectly on mobile screens with ZERO horizontal scrolling!
  const { matrixDays, totalActivityMinutes, activeDaysCount, currentStreak, allSalahDaysCount } =
    useMemo(() => {
      const today = new Date();
      const days: Array<{
        date: Date;
        dateStr: string;
        studyMins: number;
        salahCount: number;
        allSalah: boolean;
        isToday: boolean;
        level: number; // 0, 1, 2, 3, 4
      }> = [];

      // 28 days back
      for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = toDateKey(d);
        const isCurrentDay = i === 0;

        // Study minutes
        const recordedMins = dateRecords[dateStr]?.totalActualMinutes || 0;
        const studyMins = isCurrentDay ? Math.max(recordedMins, totalActualMinutes) : recordedMins;

        // Salah count
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

        // GitHub color level calculation (Higher study = deeper green)
        let level = 0;
        if (studyMins > 0) {
          if (studyMins <= 30) level = 1;
          else if (studyMins <= 60) level = 2;
          else if (studyMins <= 120) level = 3;
          else level = 4;
        }

        days.push({
          date: d,
          dateStr,
          studyMins,
          salahCount: sCount,
          allSalah: sCount === 5,
          isToday: isCurrentDay,
          level,
        });
      }

      // Calculate streak
      let streak = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].studyMins > 0) {
          streak++;
        } else if (i === days.length - 1) {
          continue; // If today has 0 so far, keep checking yesterday
        } else {
          break;
        }
      }

      const totalMins = days.reduce((sum, d) => sum + d.studyMins, 0);
      const activeDays = days.filter((d) => d.studyMins > 0).length;
      const allSalahDays = days.filter((d) => d.allSalah).length;

      return {
        matrixDays: days,
        totalActivityMinutes: totalMins,
        activeDaysCount: activeDays,
        currentStreak: streak,
        allSalahDaysCount: allSalahDays,
      };
    }, [dateRecords, salahRecords, totalActualMinutes, todaySalahCount]);

  // Color classes for GitHub levels
  const getCellClasses = (level: number, isToday: boolean) => {
    let base = '';
    switch (level) {
      case 0:
        base = 'bg-[#181a25] border-[#252838] hover:border-slate-500';
        break;
      case 1:
        base = 'bg-[#0e4429] border-[#185d38] hover:border-emerald-400';
        break;
      case 2:
        base = 'bg-[#006d32] border-[#0e8341] hover:border-emerald-300';
        break;
      case 3:
        base = 'bg-[#26a641] border-[#31bf4e] hover:border-emerald-200';
        break;
      case 4:
        base = 'bg-[#39d353] border-[#57e76e] shadow-xs hover:brightness-110';
        break;
      default:
        base = 'bg-[#181a25] border-[#252838]';
    }

    if (isToday) {
      return `${base} ring-2 ring-[#ff4757] ring-offset-1 ring-offset-[#13141d]`;
    }
    return base;
  };

  return (
    <div className="w-full bg-[#13141d] dark:bg-[#101118] border border-[#222434] rounded-[28px] p-4 sm:p-5 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              GitHub Consistency Matrix
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-slate-400">Past 4 Weeks</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
            Activity Heatmap
          </h3>
        </div>

        {/* Compact Streak Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{currentStreak}d Streak</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <Moon className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            <span>{allSalahDaysCount}d 5/5</span>
          </div>
        </div>
      </div>

      {/* Compact 100% Mobile-Fit Grid (NO horizontal scrolling / sliding required!) */}
      <div className="w-full">
        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-[10px] font-bold text-slate-500 text-center mb-1">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* 28-day cells grid (4 rows x 7 cols) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full">
          {matrixDays.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDateModal(d.dateStr)}
              className={`relative aspect-square w-full rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center p-0.5 group active:scale-95 ${getCellClasses(
                d.level,
                d.isToday
              )}`}
              title={`${formatFriendlyDate(d.dateStr)}: ${formatDuration(d.studyMins)} (${d.salahCount}/5 Salah) - Tap to view activities`}
            >
              {/* Day number */}
              <span
                className={`text-[10px] font-bold leading-none ${
                  d.level >= 3 ? 'text-black font-extrabold' : 'text-slate-300'
                }`}
              >
                {d.date.getDate()}
              </span>

              {/* Tiny star for 5/5 Salah */}
              {d.allSalah && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-xs absolute top-1 right-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* GitHub-style Legend & Total Activities Time Banner (No overflow, sleek layout) */}
      <div className="mt-3.5 pt-3 border-t border-[#202231] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {/* Total Activities Time */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Total Activity:</span>
          <strong className="text-white font-extrabold text-xs">
            {formatDuration(totalActivityMinutes)}
          </strong>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{activeDaysCount} active days</span>
        </div>

        {/* Legend: Less to More */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#181a25] border border-[#252838]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#0e4429] border border-[#185d38]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#006d32] border border-[#0e8341]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#26a641] border border-[#31bf4e]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#39d353] border border-[#57e76e]" />
          <span>More</span>
        </div>
      </div>

      {/* Modal for detailed day activities */}
      {selectedDateModal && (
        <DayActivityModal
          dateStr={selectedDateModal}
          onClose={() => setSelectedDateModal(null)}
        />
      )}
    </div>
  );
};
