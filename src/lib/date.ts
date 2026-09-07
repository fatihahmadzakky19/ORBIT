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
  differenceInCalendarDays,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
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

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Returns end of current week (Sunday) formatted as YYYY-MM-DD
 */
export function getEndOfWeekDateString(date: Date = new Date()): string {
  return format(getSundayOfWeek(date), "yyyy-MM-dd");
}

/**
 * Returns end of current month formatted as YYYY-MM-DD
 */
export function getEndOfMonthDateString(date: Date = new Date()): string {
  return format(endOfMonth(date), "yyyy-MM-dd");
}

/**
 * Returns end of current year (Dec 31) formatted as YYYY-MM-DD
 */
export function getEndOfYearDateString(date: Date = new Date()): string {
  return format(endOfYear(date), "yyyy-MM-dd");
}

/**
 * Calculates days remaining between a deadline date string and current date
 */
export function getDaysRemaining(deadline: Date | string, fromDate: Date = new Date()): number {
  const d = typeof deadline === "string" ? parseISO(deadline) : deadline;
  return differenceInCalendarDays(d, fromDate);
}

/**
 * Calculates high-precision countdown (days, hours, minutes, seconds)
 * Target is set to end of that calendar day (23:59:59)
 */
export function getPreciseCountdown(deadline: Date | string, now: Date = new Date()) {
  const dStr = typeof deadline === "string" ? deadline : format(deadline, "yyyy-MM-dd");
  const target = new Date(`${dStr}T23:59:59`);
  const diffMs = target.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalSeconds, isOverdue, days, hours, minutes, seconds };
}

/**
 * Adds days/weeks/months to a date string YYYY-MM-DD
 */
export function addDaysDateString(dateStr: string, days: number): string {
  const base = dateStr ? parseISO(dateStr) : new Date();
  return format(addDays(base, days), "yyyy-MM-dd");
}

export function addWeeksDateString(dateStr: string, weeks: number): string {
  const base = dateStr ? parseISO(dateStr) : new Date();
  return format(addWeeks(base, weeks), "yyyy-MM-dd");
}

export function addMonthsDateString(dateStr: string, months: number): string {
  const base = dateStr ? parseISO(dateStr) : new Date();
  return format(addMonths(base, months), "yyyy-MM-dd");
}
