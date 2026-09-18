import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getISOWeek,
  parseISO,
  differenceInCalendarDays,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
} from "date-fns";

export const JAKARTA_TIMEZONE = "Asia/Jakarta";
export const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || JAKARTA_TIMEZONE;

export const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export const INDONESIAN_DAYS_SHORT = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
] as const;

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export const INDONESIAN_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export interface JakartaDateParts {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  hour: number; // 0 - 23
  minute: number; // 0 - 59
  second: number; // 0 - 59
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  dayName: string; // "Jumat"
  dayNameShort: string; // "Jum"
  monthName: string; // "September"
  monthNameShort: string; // "Sep"
  dateStr: string; // "2026-09-18"
  timeStr: string; // "09:20"
  timeWithSecStr: string; // "09:20:15"
}

/**
 * Extracts comprehensive date and time components strictly in Asia/Jakarta timezone.
 */
export function getJakartaDateParts(date?: Date | string | number): JakartaDateParts {
  let d: Date;
  if (!date) {
    d = new Date();
  } else if (typeof date === "string") {
    // If date is "YYYY-MM-DD", append midnight in UTC/Jakarta to avoid offset drift
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      d = new Date(`${date}T12:00:00+07:00`);
    } else {
      d = new Date(date);
    }
  } else if (typeof date === "number") {
    d = new Date(date);
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: JAKARTA_TIMEZONE,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const year = parseInt(map.year, 10) || d.getFullYear();
    const month = parseInt(map.month, 10) || d.getMonth() + 1;
    const day = parseInt(map.day, 10) || d.getDate();
    const hour = parseInt(map.hour, 10) || 0;
    const minute = parseInt(map.minute, 10) || 0;
    const second = parseInt(map.second, 10) || 0;

    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = weekdayMap[map.weekday] ?? d.getDay();
    const dayName = INDONESIAN_DAYS[dayOfWeek] || "Senin";
    const dayNameShort = INDONESIAN_DAYS_SHORT[dayOfWeek] || "Sen";
    const monthName = INDONESIAN_MONTHS[month - 1] || "";
    const monthNameShort = INDONESIAN_MONTHS_SHORT[month - 1] || "";

    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const timeWithSecStr = `${timeStr}:${String(second).padStart(2, "0")}`;

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      dayOfWeek,
      dayName,
      dayNameShort,
      monthName,
      monthNameShort,
      dateStr,
      timeStr,
      timeWithSecStr,
    };
  } catch {
    // Fallback if Intl is unavailable
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    const dayOfWeek = d.getDay();
    const dayName = INDONESIAN_DAYS[dayOfWeek] || "Senin";
    const dayNameShort = INDONESIAN_DAYS_SHORT[dayOfWeek] || "Sen";
    const monthName = INDONESIAN_MONTHS[month - 1] || "";
    const monthNameShort = INDONESIAN_MONTHS_SHORT[month - 1] || "";

    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const timeWithSecStr = `${timeStr}:${String(second).padStart(2, "0")}`;

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      dayOfWeek,
      dayName,
      dayNameShort,
      monthName,
      monthNameShort,
      dateStr,
      timeStr,
      timeWithSecStr,
    };
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Jakarta timezone
 */
export function getTodayInJakarta(): string {
  return getJakartaDateParts().dateStr;
}

/**
 * Returns current time in Asia/Jakarta as "HH:mm" or "HH:mm:ss"
 */
export function getCurrentTimeInJakarta(includeSeconds: boolean = false): string {
  const parts = getJakartaDateParts();
  return includeSeconds ? parts.timeWithSecStr : parts.timeStr;
}

/**
 * Formats full Indonesian date: "Jumat, 18 September 2026"
 */
export function formatDateIndonesia(date?: Date | string | number): string {
  const p = getJakartaDateParts(date);
  return `${p.dayName}, ${p.day} ${p.monthName} ${p.year}`;
}

/**
 * Formats compact Indonesian date: "18 Sep 2026"
 */
export function formatShortDateIndonesia(date?: Date | string | number): string {
  const p = getJakartaDateParts(date);
  return `${p.day} ${p.monthNameShort} ${p.year}`;
}

/**
 * Formats time with WIB suffix: "09:20 WIB" or "09:20:15 WIB"
 */
export function formatTimeIndonesia(date?: Date | string | number, includeSeconds: boolean = false): string {
  const p = getJakartaDateParts(date);
  return `${includeSeconds ? p.timeWithSecStr : p.timeStr} WIB`;
}

/**
 * Formats full datetime in Indonesia: "Jumat, 18 September 2026 09:20 WIB"
 */
export function formatDateTimeIndonesia(date?: Date | string | number, includeSeconds: boolean = false): string {
  const p = getJakartaDateParts(date);
  const time = includeSeconds ? p.timeWithSecStr : p.timeStr;
  return `${p.dayName}, ${p.day} ${p.monthName} ${p.year} ${time} WIB`;
}

/**
 * Returns Indonesian day name: e.g. "Jumat"
 */
export function getDayNameIndonesia(date?: Date | string | number): string {
  return getJakartaDateParts(date).dayName;
}

/**
 * Returns Indonesian month name: e.g. "September"
 */
export function getMonthNameIndonesia(date?: Date | string | number): string {
  return getJakartaDateParts(date).monthName;
}

/**
 * Returns dynamic Indonesian greeting based on Asia/Jakarta hour:
 * - 05:00 - 10:59: "Selamat pagi"
 * - 11:00 - 14:59: "Selamat siang"
 * - 15:00 - 17:59: "Selamat sore"
 * - 18:00 - 04:59: "Selamat malam"
 */
export function getGreetingIndonesia(date?: Date | string | number): string {
  const hour = getJakartaDateParts(date).hour;
  if (hour >= 5 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Returns Monday 00:00:00 of the week in Asia/Jakarta
 */
export function getMondayOfWeek(date: Date = new Date()): Date {
  const parts = getJakartaDateParts(date);
  // Construct a base date string representing noon in Jakarta
  const base = parseISO(`${parts.dateStr}T12:00:00`);
  return startOfWeek(base, { weekStartsOn: 1 });
}

/**
 * Returns Sunday 23:59:59 of the week in Asia/Jakarta
 */
export function getSundayOfWeek(date: Date = new Date()): Date {
  const parts = getJakartaDateParts(date);
  const base = parseISO(`${parts.dateStr}T12:00:00`);
  return endOfWeek(base, { weekStartsOn: 1 });
}

/**
 * Returns local calendar date string YYYY-MM-DD for habit tracking (Asia/Jakarta)
 */
export function getCalendarDateString(date?: Date): string {
  return getJakartaDateParts(date).dateStr;
}

/**
 * Formats full date in standard ORBIT display: "Jumat, 18 September 2026"
 */
export function formatFullDate(date: Date | string): string {
  return formatDateIndonesia(date);
}

/**
 * Formats short date: "18 Sep 2026"
 */
export function formatShortDate(date: Date | string): string {
  return formatShortDateIndonesia(date);
}

/**
 * Formats weekly range: "14 Sep — 20 Sep 2026"
 */
export function formatWeekRange(monday: Date | string): string {
  const start = typeof monday === "string" ? parseISO(monday) : monday;
  const end = getSundayOfWeek(start);
  const pStart = getJakartaDateParts(start);
  const pEnd = getJakartaDateParts(end);
  return `${pStart.day} ${pStart.monthNameShort} — ${pEnd.day} ${pEnd.monthNameShort} ${pEnd.year}`;
}

/**
 * Returns ISO week label: "Week 38 · 14 Sep — 20 Sep 2026"
 */
export function getWeekLabel(monday: Date | string): string {
  const start = typeof monday === "string" ? parseISO(monday) : monday;
  const weekNum = getISOWeek(start);
  return `Week ${weekNum} · ${formatWeekRange(start)}`;
}

/**
 * Returns greeting based on hour (English fallback if requested)
 */
export function getGreeting(): string {
  const hour = getJakartaDateParts().hour;
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Jakarta
 */
export function getTodayDateString(date?: Date): string {
  return getJakartaDateParts(date).dateStr;
}

/**
 * Returns end of current week (Sunday) formatted as YYYY-MM-DD in Asia/Jakarta
 */
export function getEndOfWeekDateString(date: Date = new Date()): string {
  const sun = getSundayOfWeek(date);
  return getJakartaDateParts(sun).dateStr;
}

/**
 * Returns end of current month formatted as YYYY-MM-DD in Asia/Jakarta
 */
export function getEndOfMonthDateString(date: Date = new Date()): string {
  const parts = getJakartaDateParts(date);
  const base = parseISO(`${parts.dateStr}T12:00:00`);
  return format(endOfMonth(base), "yyyy-MM-dd");
}

/**
 * Returns end of current year (Dec 31) formatted as YYYY-MM-DD in Asia/Jakarta
 */
export function getEndOfYearDateString(date: Date = new Date()): string {
  const parts = getJakartaDateParts(date);
  const base = parseISO(`${parts.dateStr}T12:00:00`);
  return format(endOfYear(base), "yyyy-MM-dd");
}

/**
 * Calculates days remaining between a deadline date string and current date
 */
export function getDaysRemaining(deadline: Date | string, fromDate: Date = new Date()): number {
  const d = typeof deadline === "string" ? parseISO(deadline) : deadline;
  const fromParts = getJakartaDateParts(fromDate);
  const from = parseISO(`${fromParts.dateStr}T12:00:00`);
  return differenceInCalendarDays(d, from);
}

/**
 * Calculates high-precision countdown (days, hours, minutes, seconds)
 * Target is set to end of that calendar day (23:59:59 WIB)
 */
export function getPreciseCountdown(deadline: Date | string, now: Date = new Date()) {
  const dStr = typeof deadline === "string" ? deadline : getJakartaDateParts(deadline).dateStr;
  const target = new Date(`${dStr}T23:59:59+07:00`);
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
  const base = dateStr ? parseISO(dateStr) : parseISO(getTodayInJakarta());
  return format(addDays(base, days), "yyyy-MM-dd");
}

export function addWeeksDateString(dateStr: string, weeks: number): string {
  const base = dateStr ? parseISO(dateStr) : parseISO(getTodayInJakarta());
  return format(addWeeks(base, weeks), "yyyy-MM-dd");
}

export function addMonthsDateString(dateStr: string, months: number): string {
  const base = dateStr ? parseISO(dateStr) : parseISO(getTodayInJakarta());
  return format(addMonths(base, months), "yyyy-MM-dd");
}

export interface WeekDayInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
  dayNum: number;  // 1..31
  isToday: boolean;
}

/**
 * Returns array of 7 days for current week (Mon -> Sun) strictly calculated in Asia/Jakarta
 */
export function getCurrentWeekDays(now: Date = new Date()): WeekDayInfo[] {
  const todayParts = getJakartaDateParts(now);
  const todayStr = todayParts.dateStr;

  // Day of week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  // We want Monday (1) to Sunday (7)
  const mondayOffset = todayParts.dayOfWeek === 0 ? -6 : 1 - todayParts.dayOfWeek;
  const mondayBase = parseISO(addDaysDateString(todayStr, mondayOffset));

  const dayNamesIndo = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const days: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = addDays(mondayBase, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const dParts = getJakartaDateParts(d);
    days.push({
      dateStr,
      dayName: dayNamesIndo[i],
      dayNum: dParts.day,
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the specified timezone (default: Asia/Jakarta)
 */
export function getTodayInTimezone(timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return getTodayInJakarta();
  }
}

/**
 * Returns current time formatted as HH:mm in the specified timezone (default: Asia/Jakarta)
 */
export function getCurrentTimeInTimezone(timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    return getCurrentTimeInJakarta(false);
  }
}

/**
 * Compares dateStr with today in the specified timezone
 */
export function compareDateWithToday(
  dateStr: string,
  timeZone: string = DEFAULT_TIMEZONE
): "TODAY" | "PAST" | "FUTURE" {
  const todayStr = getTodayInTimezone(timeZone);
  if (dateStr === todayStr) return "TODAY";
  if (dateStr < todayStr) return "PAST";
  return "FUTURE";
}

/**
 * Calculates milliseconds remaining until next midnight (00:00:01) in Asia/Jakarta timezone
 */
export function getMsUntilNextMidnight(timeZone: string = DEFAULT_TIMEZONE): number {
  try {
    const p = getJakartaDateParts();
    const elapsedSecondsToday = p.hour * 3600 + p.minute * 60 + p.second;
    const totalSecondsInDay = 86400;
    const remainingSeconds = Math.max(1, totalSecondsInDay - elapsedSecondsToday + 1);
    return remainingSeconds * 1000;
  } catch {
    return 3600 * 1000; // fallback 1 hour
  }
}
