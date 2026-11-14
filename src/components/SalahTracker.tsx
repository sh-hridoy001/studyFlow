import React, { useState, useEffect, useCallback } from 'react';
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
  MapPin,
  Navigation,
  Loader2,
  Edit2,
} from 'lucide-react';

interface SavedLocation {
  city: string;
  lat?: number;
  lng?: number;
  mode: 'gps' | 'city';
}

interface PrayerWindow {
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
}

type PrayerTimingsMap = Record<SalahPrayerName, PrayerWindow>;

const LOCATION_STORAGE_KEY = 'focustrack_salah_location_v1';
const SCHOOL_STORAGE_KEY = 'focustrack_salah_school_v1';

const parseTime24Minutes = (time24?: string): number => {
  if (!time24) return -1;
  const clean = time24.split(' ')[0];
  const parts = clean.split(':');
  if (parts.length < 2) return -1;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
};

const formatTime12h = (time24?: string): string => {
  if (!time24) return '';
  const clean = time24.split(' ')[0]; // strip timezone suffix like "(+06)"
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return clean;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const formatAladhanDate = (dateKey: string): string => {
  const [y, m, d] = dateKey.split('-');
  if (!y || !m || !d) return '';
  return `${d}-${m}-${y}`;
};

export const SalahTracker: React.FC = () => {
  const {
    salahRecords,
    selectedSalahDate,
    setSelectedSalahDate,
    toggleSalahPrayer,
    updateSalahNotes,
    salahStreakDays,
  } = useStudy();

  // Location & Prayer Times State
  const [location, setLocation] = useState<SavedLocation | null>(() => {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  // school: 1 = Hanafi (default), 0 = Shafi / Standard
  const [asrSchool, setAsrSchool] = useState<0 | 1>(() => {
    try {
      const saved = localStorage.getItem(SCHOOL_STORAGE_KEY);
      return saved === '0' ? 0 : 1;
    } catch {
      return 1;
    }
  });
  const [cityInput, setCityInput] = useState<string>(location?.city || '');
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [timings, setTimings] = useState<PrayerTimingsMap | null>(null);
  const [isLoadingTimings, setIsLoadingTimings] = useState<boolean>(false);
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  // Fetch prayer times from Aladhan API (including Start & End window for each Waqt)
  const fetchTimings = useCallback(async (loc: SavedLocation, dateKey: string, school: 0 | 1) => {
    setIsLoadingTimings(true);
    setLocationError(null);
    const aladhanDate = formatAladhanDate(dateKey);

    try {
      let url = '';
      if (loc.mode === 'gps' && loc.lat !== undefined && loc.lng !== undefined) {
        url = `https://api.aladhan.com/v1/timings/${aladhanDate}?latitude=${loc.lat}&longitude=${loc.lng}&method=1&school=${school}`;
      } else if (loc.city.trim()) {
        url = `https://api.aladhan.com/v1/timingsByAddress/${aladhanDate}?address=${encodeURIComponent(
          loc.city.trim()
        )}&method=1&school=${school}`;
      }

      if (!url) {
        setIsLoadingTimings(false);
        return;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Unable to fetch prayer times');
      const json = await res.json();
      const rawTimings = json?.data?.timings;

      if (rawTimings) {
        setTimings({
          fajr: {
            start: formatTime12h(rawTimings.Fajr),
            end: formatTime12h(rawTimings.Sunrise),
            startMinutes: parseTime24Minutes(rawTimings.Fajr),
            endMinutes: parseTime24Minutes(rawTimings.Sunrise),
          },
          dhuhr: {
            start: formatTime12h(rawTimings.Dhuhr),
            end: formatTime12h(rawTimings.Asr),
            startMinutes: parseTime24Minutes(rawTimings.Dhuhr),
            endMinutes: parseTime24Minutes(rawTimings.Asr),
          },
          asr: {
            start: formatTime12h(rawTimings.Asr),
            end: formatTime12h(rawTimings.Maghrib),
            startMinutes: parseTime24Minutes(rawTimings.Asr),
            endMinutes: parseTime24Minutes(rawTimings.Maghrib),
          },
          maghrib: {
            start: formatTime12h(rawTimings.Maghrib),
            end: formatTime12h(rawTimings.Isha),
            startMinutes: parseTime24Minutes(rawTimings.Maghrib),
            endMinutes: parseTime24Minutes(rawTimings.Isha),
          },
          isha: {
            start: formatTime12h(rawTimings.Isha),
            end: formatTime12h(rawTimings.Fajr),
            startMinutes: parseTime24Minutes(rawTimings.Isha),
            endMinutes: parseTime24Minutes(rawTimings.Fajr),
          },
        });
      } else {
        throw new Error('City not found');
      }
    } catch {
      setLocationError('Could not load prayer times for this location. Try another city.');
      setTimings(null);
    } finally {
      setIsLoadingTimings(false);
    }
  }, []);

  // Auto-detect GPS location
  const detectLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Auto-location unavailable. Please enter your city.');
      setIsEditingLocation(true);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let detectedCity = 'My Location';

        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            detectedCity =
              geoJson.city ||
              geoJson.locality ||
              geoJson.principalSubdivision ||
              'My Location';
          }
        } catch {
          // Keep fallback name
        }

        const newLoc: SavedLocation = {
          city: detectedCity,
          lat,
          lng,
          mode: 'gps',
        };
        setLocation(newLoc);
        setCityInput(detectedCity);
        setIsEditingLocation(false);
        setIsLocating(false);
        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
        } catch {}
      },
      () => {
        setIsLocating(false);
        setLocationError('Location permission denied or unavailable. Enter your city below:');
        setIsEditingLocation(true);
      },
      { timeout: 6000 }
    );
  }, []);

  // Auto-run location detection once if no saved location exists
  useEffect(() => {
    if (!location) {
      detectLocation();
    }
  }, [location, detectLocation]);

  // Refetch timings whenever location, date, or Asr calculation school changes
  useEffect(() => {
    if (location) {
      fetchTimings(location, selectedSalahDate, asrSchool);
    }
  }, [location, selectedSalahDate, asrSchool, fetchTimings]);

  const handleToggleAsrSchool = () => {
    const next: 0 | 1 = asrSchool === 1 ? 0 : 1;
    setAsrSchool(next);
    try {
      localStorage.setItem(SCHOOL_STORAGE_KEY, String(next));
    } catch {}
  };

  const handleSaveManualCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const newLoc: SavedLocation = {
      city: cityInput.trim(),
      mode: 'city',
    };
    setLocation(newLoc);
    setIsEditingLocation(false);
    setLocationError(null);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
    } catch {}
  };

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
    fallbackWindow: { start: string; end: string };
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      key: 'fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      fallbackWindow: { start: 'Dawn', end: 'Sunrise' },
      icon: Sunrise,
      color: '#6366F1',
    },
    {
      key: 'dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      fallbackWindow: { start: 'Midday', end: 'Before Asr' },
      icon: Sun,
      color: '#F59E0B',
    },
    {
      key: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      fallbackWindow: { start: 'Afternoon', end: 'Sunset' },
      icon: CloudSun,
      color: '#EA580C',
    },
    {
      key: 'maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      fallbackWindow: { start: 'Sunset', end: 'Before Isha' },
      icon: Sunset,
      color: '#EC4899',
    },
    {
      key: 'isha',
      name: 'Isha',
      arabicName: 'العشاء',
      fallbackWindow: { start: 'Night', end: 'Before Fajr' },
      icon: Moon,
      color: '#8B5CF6',
    },
  ];

  const isWindowActive = (key: SalahPrayerName): boolean => {
    if (!isToday(selectedSalahDate) || !timings) return false;
    const w = timings[key];
    if (!w || w.startMinutes < 0 || w.endMinutes < 0) return false;
    if (w.endMinutes > w.startMinutes) {
      return nowMinutes >= w.startMinutes && nowMinutes < w.endMinutes;
    }
    // Overnight wrap (Isha starts in evening, ends at next morning Fajr)
    return nowMinutes >= w.startMinutes || nowMinutes < w.endMinutes;
  };

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
    <div className="space-y-4 pb-8 w-full overflow-x-hidden">
      {/* Compact Overview & City Prayer Time Bar */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Daily Salah Tracker
            </span>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {formatFullDate(selectedSalahDate)}
            </h1>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => stepDate(-1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-[#2a2d3e] hover:bg-slate-100 dark:hover:bg-[#1c1e2c] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {!isToday(selectedSalahDate) && (
              <button
                type="button"
                onClick={jumpToToday}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 cursor-pointer whitespace-nowrap"
              >
                Today
              </button>
            )}

            <button
              type="button"
              onClick={() => stepDate(1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-[#2a2d3e] hover:bg-slate-100 dark:hover:bg-[#1c1e2c] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedSalahDate}
              onChange={(e) => {
                if (e.target.value) setSelectedSalahDate(e.target.value);
              }}
              className="bg-slate-100 dark:bg-[#1b1d29] border border-slate-200 dark:border-[#2a2d3e] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* City / Location Bar for Today's Prayer Start & End Times */}
        <div className="mb-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293a]">
          {isEditingLocation || !location ? (
            <form onSubmit={handleSaveManualCity} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-[var(--app-accent)] shrink-0" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter your city (e.g. Dhaka, London, Sylhet)..."
                  className="w-full bg-white dark:bg-[#12131b] border border-slate-200 dark:border-[#2b2e40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors whitespace-nowrap"
                >
                  Set City
                </button>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-[#232638] hover:bg-slate-300 dark:hover:bg-[#2c3046] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Auto-detect GPS location"
                >
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  <span>Auto GPS</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {location.city}
                </span>
                {isLoadingTimings && <Loader2 className="w-3 h-3 animate-spin text-slate-400 shrink-0" />}
                {!isLoadingTimings && timings && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
                    · Start &amp; end windows synced
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleAsrSchool}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#2a2d3e] text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-500/50 cursor-pointer whitespace-nowrap"
                  title="Switch Asr juristic method"
                >
                  {asrSchool === 1 ? 'Asr: Hanafi' : 'Asr: Standard'}
                </button>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#2a2d3e] text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Refresh GPS Location"
                >
                  {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  <span>GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#2a2d3e] text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change City</span>
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
              {locationError}
            </p>
          )}
        </div>

        {/* Compact Metrics Strip */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {completedCount}
              <span className="text-base font-sans text-slate-400 font-normal"> / 5</span>
            </span>
            {completedCount === 5 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Masha&apos;Allah 5/5</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {5 - completedCount} remaining
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5 text-xs tabular-nums">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{salahStreakDays}d Streak</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{percent}%</span>
            </div>
          </div>
        </div>

        {/* 5-Segmented Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-[#1e202e] h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
          {prayers.map((p) => {
            const isDone = record[p.key];
            return (
              <div
                key={p.key}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  isDone ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* Responsive Premium Grid:
          Mobile: 2 columns + full-width Isha (2 + 2 + 1)
          PC (md+): 6-col bento grid -> Row 1: Fajr, Dhuhr, Asr (3 equal cols); Row 2: Maghrib, Isha (2 wide cols) — zero overlapping */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-3 w-full">
        {prayers.map((prayer, index) => {
          const isDone = record[prayer.key];
          const isActiveNow = isWindowActive(prayer.key);
          const IconComponent = prayer.icon;
          const timingWindow = timings ? timings[prayer.key] : null;
          const startDisplay = timingWindow?.start || prayer.fallbackWindow.start;
          const endDisplay = timingWindow?.end || prayer.fallbackWindow.end;
          const gridSpanClass =
            index < 3
              ? 'col-span-1 md:col-span-2'
              : index === 3
              ? 'col-span-1 md:col-span-3'
              : 'col-span-2 md:col-span-3';

          return (
            <button
              type="button"
              key={prayer.key}
              onClick={() => toggleSalahPrayer(selectedSalahDate, prayer.key)}
              className={`${gridSpanClass} min-w-0 text-left cursor-pointer group relative bg-white dark:bg-[#13141d] border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 select-none shadow-xs hover:shadow-md flex flex-col justify-between active:scale-[0.98] ${
                isDone
                  ? 'border-emerald-500/60 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : isActiveNow
                  ? 'border-indigo-400/70 dark:border-indigo-500/60 bg-indigo-50/30 dark:bg-[#17192b]'
                  : 'border-slate-200 dark:border-[#232638] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Top Row: Icon + Prayer Name & Arabic + Status */}
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: isDone ? '#10B981' : prayer.color }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                        {prayer.name}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400 font-mono leading-tight">
                        {prayer.arabicName}
                      </span>
                    </div>
                    {isActiveNow && !isDone && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                        Current Waqt
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'border-2 border-slate-300 dark:border-slate-700 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Start & End Prayer Window Block */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50/90 dark:bg-[#191b28] border border-slate-200/80 dark:border-[#25283b] grid grid-cols-2 gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Starts
                  </span>
                  <span className="text-xs sm:text-[13px] font-mono font-bold tabular-nums text-slate-800 dark:text-slate-100 block truncate mt-0.5">
                    {startDisplay}
                  </span>
                </div>
                <div className="min-w-0 border-l border-slate-200 dark:border-[#292d42] pl-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Ends
                  </span>
                  <span className="text-xs sm:text-[13px] font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300 block truncate mt-0.5">
                    {endDisplay}
                  </span>
                </div>
              </div>

              {/* Bottom Status Text */}
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span
                  className={`font-bold transition-colors ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                  }`}
                >
                  {isDone ? 'Prayed ✓' : 'Tap to mark prayed'}
                </span>
                {location && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[110px] hidden sm:inline">
                    {location.city}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* Compact Optional Reflection Box */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Daily Dhikr &amp; Reflection (Optional)
        </label>
        <textarea
          rows={2}
          value={record.notes || ''}
          onChange={(e) => updateSalahNotes(selectedSalahDate, e.target.value)}
          placeholder="e.g. Sunnah prayers, Quran recitation, Masjid..."
          className="w-full bg-slate-50 dark:bg-[#191b27] border border-slate-200 dark:border-[#272a3d] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 resize-none"
        />
      </section>
    </div>
  );
};
