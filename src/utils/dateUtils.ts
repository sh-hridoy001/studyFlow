/**
 * Formats minutes into human readable "2h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Returns formatted decimal hours e.g. "2.5"
 */
export function formatHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

/**
 * Get date string in YYYY-MM-DD
 */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date object
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if a given date string or Date is today
 */
export function isToday(dateInput: string | Date): boolean {
  const d = typeof dateInput === 'string' ? parseDateKey(dateInput) : dateInput;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Returns human friendly date label e.g., "Today", "Yesterday", "Nov 5, 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  const d = parseDateKey(dateStr);
  if (isToday(d)) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format full verbose date e.g. "Thursday, November 5, 2026"
 */
export function formatFullDate(dateStr: string): string {
  const d = parseDateKey(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format Month & Year e.g. "November 2026"
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get the Monday (start) of the week containing the given date
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // day 0 is Sunday, so Monday is day - 6 if Sunday, otherwise day - 1
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(d.setDate(diff));
}

/**
 * Get the Sunday (end) of the week containing the given date
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Get the 1st of the month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Returns array of date strings (YYYY-MM-DD) between start and end inclusive
 */
export function getDatesInRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(toDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Calculate study streak in days based on date records with > 0 actualMinutes
 */
export function calculateStreakFromDates(activeDates: string[]): number {
  if (!activeDates.length) return 0;

  const sortedDates = Array.from(new Set(activeDates)).sort().reverse();
  const todayKey = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (sortedDates[0] !== todayKey && sortedDates[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 0;
  let checkDate = sortedDates[0] === todayKey ? new Date() : yesterday;

  for (let i = 0; i < sortedDates.length; i++) {
    const expected = toDateKey(checkDate);
    if (sortedDates.includes(expected)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
