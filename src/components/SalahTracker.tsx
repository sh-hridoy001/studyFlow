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
  Clock,
  Edit2,
} from 'lucide-react';

interface SavedLocation {
  city: string;
  lat?: number;
  lng?: number;
  mode: 'gps' | 'city';
}

type PrayerTimingsMap = Record<SalahPrayerName, string>;

const LOCATION_STORAGE_KEY = 'focustrack_salah_location_v1';

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
  const [cityInput, setCityInput] = useState<string>(location?.city || '');
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [timings, setTimings] = useState<PrayerTimingsMap | null>(null);
  const [isLoadingTimings, setIsLoadingTimings] = useState<boolean>(false);

  // Fetch prayer times from Aladhan API
  const fetchTimings = useCallback(async (loc: SavedLocation, dateKey: string) => {
    setIsLoadingTimings(true);
    setLocationError(null);
    const aladhanDate = formatAladhanDate(dateKey);

    try {
      let url = '';
      if (loc.mode === 'gps' && loc.lat !== undefined && loc.lng !== undefined) {
        url = `https://api.aladhan.com/v1/timings/${aladhanDate}?latitude=${loc.lat}&longitude=${loc.lng}&method=1`;
      } else if (loc.city.trim()) {
        url = `https://api.aladhan.com/v1/timingsByAddress/${aladhanDate}?address=${encodeURIComponent(
          loc.city.trim()
        )}&method=1`;
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
          fajr: formatTime12h(rawTimings.Fajr),
          dhuhr: formatTime12h(rawTimings.Dhuhr),
          asr: formatTime12h(rawTimings.Asr),
          maghrib: formatTime12h(rawTimings.Maghrib),
          isha: formatTime12h(rawTimings.Isha),
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

  // Refetch timings whenever location or selectedSalahDate changes
  useEffect(() => {
    if (location) {
      fetchTimings(location, selectedSalahDate);
    }
  }, [location, selectedSalahDate, fetchTimings]);

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
    fallbackTiming: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      key: 'fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      fallbackTiming: 'Dawn',
      icon: Sunrise,
      color: '#6366F1',
    },
    {
      key: 'dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      fallbackTiming: 'Midday',
      icon: Sun,
      color: '#F59E0B',
    },
    {
      key: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      fallbackTiming: 'Afternoon',
      icon: CloudSun,
      color: '#EA580C',
    },
    {
      key: 'maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      fallbackTiming: 'Sunset',
      icon: Sunset,
      color: '#EC4899',
    },
    {
      key: 'isha',
      name: 'Isha',
      arabicName: 'العشاء',
      fallbackTiming: 'Night',
      icon: Moon,
      color: '#8B5CF6',
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
    <div className="space-y-4 pb-8 w-full overflow-x-hidden">
      {/* Compact Overview & City Prayer Time Bar */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Daily Salah Tracker</span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {formatFullDate(selectedSalahDate)}
            </h1>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => stepDate(-1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2a2d3e] hover:bg-slate-100 dark:hover:bg-[#1c1e2c] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {!isToday(selectedSalahDate) && (
              <button
                onClick={jumpToToday}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
              >
                Today
              </button>
            )}

            <button
              onClick={() => stepDate(1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2a2d3e] hover:bg-slate-100 dark:hover:bg-[#1c1e2c] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
              className="bg-slate-100 dark:bg-[#1b1d29] border border-slate-200 dark:border-[#2a2d3e] rounded-xl px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 font-mono font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* City / Location Bar for Today's Prayer Times */}
        <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#191b27] border border-slate-200 dark:border-[#26293a]">
          {isEditingLocation || !location ? (
            <form onSubmit={handleSaveManualCity} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#ff4757] shrink-0" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter your city (e.g. Dhaka, London, Sylhet)..."
                  className="w-full bg-white dark:bg-[#12131b] border border-slate-200 dark:border-[#2b2e40] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Set City
                </button>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-[#232638] hover:bg-slate-300 dark:hover:bg-[#2c3046] text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="Auto-detect GPS location"
                >
                  {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  <span>Auto</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {location.city}
                </span>
                {isLoadingTimings && <Loader2 className="w-3 h-3 animate-spin text-slate-400 shrink-0" />}
                {!isLoadingTimings && timings && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden xs:inline">
                    · Prayer times synced
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#2a2d3e] text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
                  title="Refresh GPS Location"
                >
                  {isLocating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Navigation className="w-2.5 h-2.5" />}
                  <span>GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#2a2d3e] text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  <span>Change City</span>
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
              {locationError}
            </p>
          )}
        </div>

        {/* Compact Metrics Strip */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {completedCount}
              <span className="text-base font-sans text-slate-400 font-normal"> / 5</span>
            </span>
            {completedCount === 5 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                <span>Masha&apos;Allah 5/5</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {5 - completedCount} left today
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
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

      {/* Compact 5 Daily Prayer Cards: 2 Columns on Mobile + 1 Full-Width Last Card (2 + 2 + 1) */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full">
        {prayers.map((prayer, index) => {
          const isDone = record[prayer.key];
          const IconComponent = prayer.icon;
          const exactTime = timings ? timings[prayer.key] : '';
          const isLastCard = index === prayers.length - 1;

          return (
            <div
              key={prayer.key}
              onClick={() => toggleSalahPrayer(selectedSalahDate, prayer.key)}
              className={`cursor-pointer group relative bg-white dark:bg-[#13141d] border rounded-2xl p-3 sm:p-3.5 transition-all duration-200 select-none shadow-xs hover:shadow-md flex flex-col justify-between active:scale-[0.98] ${
                isLastCard ? 'col-span-2 lg:col-span-1' : ''
              } ${
                isDone
                  ? 'border-emerald-400/70 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-[#232638] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={{
                borderTopWidth: '3px',
                borderTopColor: isDone ? '#10B981' : prayer.color,
              }}
            >
              {/* Top Row: Compact Icon + Prayer Name & Time */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: isDone ? '#10B981' : prayer.color }}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
                      {prayer.name}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 font-mono block leading-tight">
                      {prayer.arabicName}
                    </span>
                  </div>
                </div>

                {/* Prayer Time Badge right beside name */}
                <div className="text-right shrink-0">
                  {exactTime ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1d1f2d] text-slate-700 dark:text-slate-200 font-mono text-[10px] font-bold border border-slate-200 dark:border-[#2b2e42]">
                      <Clock className="w-2.5 h-2.5 text-emerald-500 hidden xs:inline" />
                      {exactTime}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {prayer.fallbackTiming}
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Bottom Row: Status & Checkmark */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#202333] flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                >
                  {isDone ? 'Prayed ✓' : 'Mark Done'}
                </span>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'border-2 border-slate-300 dark:border-slate-700 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Compact Optional Reflection Box */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Daily Dhikr & Reflection (Optional)
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
