import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getISOWeek,
  getYear,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";

export const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Jakarta";

/**
 * Returns Monday 00:00:00 as the start of the week for a given date
 */
export function getMondayOfWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Returns Sunday 23:59:59.999 as the end of the week for a given date
 */
export function getSundayOfWeek(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Returns local calendar date string YYYY-MM-DD for habit tracking
 */
export function getCalendarDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Formats a date for standard display in ORBIT: "Sunday, 6 September 2026"
 */
export function formatFullDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, d MMMM yyyy");
}

/**
 * Formats a short date: "06 Sep 2026"
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy");
}

/**
 * Formats weekly range: "31 Aug — 6 Sep 2026"
 */
export function formatWeekRange(monday: Date | string): string {
  const start = typeof monday === "string" ? parseISO(monday) : monday;
  const end = getSundayOfWeek(start);
  return `${format(start, "d MMM")} — ${format(end, "d MMM yyyy")}`;
}

/**
 * Returns ISO week info: "Week 36 · 31 Aug — 6 Sep"
 */
export function getWeekLabel(monday: Date | string): string {
  const start = typeof monday === "string" ? parseISO(monday) : monday;
  const weekNum = getISOWeek(start);
  return `Week ${weekNum} · ${formatWeekRange(start)}`;
}

/**
 * Returns greeting based on hour (Morning, Afternoon, Evening)
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
