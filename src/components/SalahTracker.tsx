import React from 'react';
import { useStudy } from '../context/StudyContext';
import { SalahPrayerName } from '../types';
import {
  formatFullDate,
  toDateKey,
  parseDateKey,
  isToday,
} from '../utils/dateUtils';
import {
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  Award,
} from 'lucide-react';

export const SalahTracker: React.FC = () => {
  const {
    salahRecords,
    selectedSalahDate,
    setSelectedSalahDate,
    toggleSalahPrayer,
    updateSalahNotes,
    salahStreakDays,
  } = useStudy();

  const record = salahRecords[selectedSalahDate] || {
    date: selectedSalahDate,
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };

  const prayers: {
    key: SalahPrayerName;
    name: string;
    arabicName: string;
    timing: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      key: 'fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      timing: 'Dawn (Before Sunrise)',
      icon: Sunrise,
      color: '#6366F1', // Indigo
    },
    {
      key: 'dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      timing: 'Midday (After Zenith)',
      icon: Sun,
      color: '#F59E0B', // Amber
    },
    {
      key: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      timing: 'Late Afternoon',
      icon: CloudSun,
      color: '#EA580C', // Orange
    },
    {
      key: 'maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      timing: 'Sunset',
      icon: Sunset,
      color: '#EC4899', // Pink
    },
    {
      key: 'isha',
      name: 'Isha',
      arabicName: 'العشاء',
      timing: 'Nightfall',
      icon: Moon,
      color: '#8B5CF6', // Purple
    },
  ];

  const completedCount =
    (record.fajr ? 1 : 0) +
    (record.dhuhr ? 1 : 0) +
    (record.asr ? 1 : 0) +
    (record.maghrib ? 1 : 0) +
    (record.isha ? 1 : 0);

  const percent = Math.round((completedCount / 5) * 100);

  const stepDate = (delta: number) => {
    const d = parseDateKey(selectedSalahDate);
    d.setDate(d.getDate() + delta);
    setSelectedSalahDate(toDateKey(d));
  };

  const jumpToToday = () => {
    setSelectedSalahDate(toDateKey(new Date()));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Overview Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle accent backdrop */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Daily Salah Tracker</span>
              <span aria-hidden="true">·</span>
              <span>5 Obligatory Daily Prayers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {formatFullDate(selectedSalahDate)}
            </h1>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => stepDate(-1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {!isToday(selectedSalahDate) && (
              <button
                onClick={jumpToToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                Today
              </button>
            )}

            <button
              onClick={() => stepDate(1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="pl-1 border-l border-slate-200 dark:border-slate-800">
              <input
                type="date"
                value={selectedSalahDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedSalahDate(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Big Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end mb-6">
          <div className="sm:col-span-7">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Daily Prayer Completion
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                {completedCount}{' '}
                <span className="text-2xl sm:text-3xl font-sans text-slate-400 font-normal">/ 5</span>
              </span>
              {completedCount === 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>All 5 Completed! Masha'Allah</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {5 - completedCount} prayer{5 - completedCount === 1 ? '' : 's'} remaining
                </span>
              )}
            </div>
          </div>

          <div className="sm:col-span-5 flex items-center justify-start sm:justify-end gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {salahStreakDays} {salahStreakDays === 1 ? 'day' : 'days'}
                </div>
                <div className="text-[11px] text-slate-400">Full Prayer Streak</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {percent}%
                </div>
                <div className="text-[11px] text-slate-400">Daily Target</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Segmented Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex gap-1 p-0.5 shadow-inner">
          {prayers.map((p) => {
            const isDone = record[p.key];
            return (
              <div
                key={p.key}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  isDone ? 'bg-emerald-500 shadow-xs' : 'bg-transparent'
                }`}
                title={`${p.name}: ${isDone ? 'Completed' : 'Pending'}`}
              />
            );
          })}
        </div>
      </section>

      {/* 5 Daily Prayer Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {prayers.map((prayer) => {
          const isDone = record[prayer.key];
          const IconComponent = prayer.icon;

          return (
            <div
              key={prayer.key}
              onClick={() => toggleSalahPrayer(selectedSalahDate, prayer.key)}
              className={`cursor-pointer group relative bg-white dark:bg-slate-900 border rounded-3xl p-5 transition-all duration-200 select-none shadow-xs hover:shadow-md flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={{
                borderTopWidth: '4px',
                borderTopColor: isDone ? '#10B981' : prayer.color,
              }}
            >
              <div>
                {/* Top Prayer Icon and Arabic Header */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: isDone ? '#10B981' : prayer.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {prayer.arabicName}
                  </span>
                </div>

                {/* Prayer Title & Timing */}
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                  {prayer.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {prayer.timing}
                </p>
              </div>

              {/* Completion Button & Visual Checkmark */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span
                  className={`text-xs font-bold transition-colors ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                >
                  {isDone ? 'Completed' : 'Mark Done'}
                </span>

                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs scale-105'
                      : 'border-2 border-slate-300 dark:border-slate-700 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Optional Daily Reflection / Du'a Notes */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Daily Dhikr & Prayer Reflection (Optional)
        </label>
        <textarea
          rows={2}
          value={record.notes || ''}
          onChange={(e) => updateSalahNotes(selectedSalahDate, e.target.value)}
          placeholder="e.g. Read Surah Al-Kahf, offered Sunnah prayers, attended Dhuhr in congregation..."
          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
      </section>
    </div>
  );
};
