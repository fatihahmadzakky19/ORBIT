/**
 * Prayer Times Calculation Service (Kemenag RI / MWL Standard)
 * 
 * Provides precise, offline astronomical prayer time calculations.
 * Standard parameters for Indonesia (Kemenag RI):
 * - Subuh (Fajr): Sun depression angle 20°
 * - Isya (Isha): Sun depression angle 18°
 * - Ashar (Asr): Shafi'i shadow factor (shadow length = object length + noon shadow)
 * - Ihtiyat (precautionary buffer): +2 minutes added to prayers
 * - Default location: Jakarta (-6.2088° S, 106.8456° E, UTC+7 / WIB)
 */

export interface PrayerSchedule {
  date: string; // YYYY-MM-DD
  fajr: string; // "04:32"
  sunrise: string; // "05:46"
  dhuhr: string; // "11:53"
  asr: string; // "15:06"
  maghrib: string; // "17:54"
  isha: string; // "19:03"
  timezone: string; // "Asia/Jakarta"
  timezoneAbbr: string; // "WIB"
  locationName: string; // "Jakarta (WIB)"
}

export interface PrayerTimeOptions {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  timezoneOffset?: number; // hours (e.g. 7 for WIB)
  timezoneAbbr?: string;
  locationName?: string;
  fajrAngle?: number; // default 20
  ishaAngle?: number; // default 18
  ihtiyatMinutes?: number; // default 2
}

const DEFAULT_OPTIONS: Required<PrayerTimeOptions> = {
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "Asia/Jakarta",
  timezoneOffset: 7,
  timezoneAbbr: "WIB",
  locationName: "Jakarta (WIB)",
  fajrAngle: 20,
  ishaAngle: 18,
  ihtiyatMinutes: 2,
};

// Map timezones to default offsets and abbreviations
export function getTimezoneMeta(tz: string = "Asia/Jakarta"): { offset: number; abbr: string } {
  switch (tz) {
    case "Asia/Jakarta":
    case "Asia/Pontianak":
      return { offset: 7, abbr: "WIB" };
    case "Asia/Makassar":
    case "Asia/Ujung_Pandang":
    case "Asia/Bali":
      return { offset: 8, abbr: "WITA" };
    case "Asia/Jayapura":
      return { offset: 9, abbr: "WIT" };
    default: {
      try {
        const now = new Date();
        const str = now.toLocaleString("en-US", { timeZone: tz, timeZoneName: "short" });
        const abbrMatch = str.match(/[A-Z]{3,5}/);
        const abbr = abbrMatch ? abbrMatch[0] : "WIB";
        return { offset: 7, abbr };
      } catch {
        return { offset: 7, abbr: "WIB" };
      }
    }
  }
}

// Degree to Radian and vice versa
const deg2rad = (deg: number) => (deg * Math.PI) / 180.0;
const rad2deg = (rad: number) => (rad * 180.0) / Math.PI;

// Range normalizers
const fixAngle = (a: number) => {
  let res = a - 360.0 * Math.floor(a / 360.0);
  if (res < 0) res += 360.0;
  return res;
};

const fixHour = (h: number) => {
  let res = h - 24.0 * Math.floor(h / 24.0);
  if (res < 0) res += 24.0;
  return res;
};

/**
 * Calculates Julian Date from Gregorian date (year, month, day)
 */
function getJulianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

/**
 * Calculates Sun's Declination (delta) and Equation of Time (EqT) in hours
 */
function getSunCoordinates(jd: number): { declination: number; equationOfTime: number } {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * Math.sin(deg2rad(g)) + 0.02 * Math.sin(deg2rad(2 * g)));

  const e = 23.439 - 0.00000036 * d;

  // Declination
  const sinDelta = Math.sin(deg2rad(e)) * Math.sin(deg2rad(l));
  const declination = rad2deg(Math.asin(sinDelta));

  // Right Ascension
  const ra = rad2deg(Math.atan2(Math.cos(deg2rad(e)) * Math.sin(deg2rad(l)), Math.cos(deg2rad(l)))) / 15.0;
  const normalizedRA = fixHour(ra);

  // Equation of Time in hours
  const equationOfTime = q / 15.0 - normalizedRA;
  return { declination, equationOfTime };
}

/**
 * Format decimal hours (e.g. 4.53) into "HH:mm"
 */
function formatHours(hours: number): string {
  const normalized = fixHour(hours);
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60.0 + 0.5); // round to nearest minute
  const adjustedH = m >= 60 ? (h + 1) % 24 : h;
  const adjustedM = m >= 60 ? 0 : m;
  return `${String(adjustedH).padStart(2, "0")}:${String(adjustedM).padStart(2, "0")}`;
}

/**
 * Calculates prayer schedule for a given date YYYY-MM-DD
 */
export function getPrayerScheduleForDate(
  dateStr: string,
  customOptions?: PrayerTimeOptions
): PrayerSchedule | null {
  try {
    if (!dateStr || !dateStr.includes("-")) return null;
    const parts = dateStr.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return null;
    }
    const [year, month, day] = parts;

    const tzMeta = getTimezoneMeta(customOptions?.timezone || DEFAULT_OPTIONS.timezone);
    const opts: Required<PrayerTimeOptions> = {
      ...DEFAULT_OPTIONS,
      timezoneOffset: tzMeta.offset,
      timezoneAbbr: tzMeta.abbr,
      ...customOptions,
    };

    const jd = getJulianDate(year, month, day);
    const { declination, equationOfTime } = getSunCoordinates(jd);

    const lat = opts.latitude;
    const lon = opts.longitude;
    const tz = opts.timezoneOffset;
    const ihtiyatHours = opts.ihtiyatMinutes / 60.0;

    // Midday (Dzuhur) in hours
    const dhuhrMidday = 12.0 + tz - lon / 15.0 - equationOfTime;

    // Helper: Hour angle for an altitude/depression angle
    const getHourAngle = (angle: number): number => {
      const sinAlt = Math.sin(deg2rad(angle));
      const sinLat = Math.sin(deg2rad(lat));
      const cosLat = Math.cos(deg2rad(lat));
      const sinDec = Math.sin(deg2rad(declination));
      const cosDec = Math.cos(deg2rad(declination));

      const cosH = (sinAlt - sinLat * sinDec) / (cosLat * cosDec);
      if (cosH > 1.0 || cosH < -1.0) {
        return 0; // Polar extremes
      }
      return rad2deg(Math.acos(cosH)) / 15.0; // in hours
    };

    // Subuh (Fajr): depression angle (default -20°)
    const fajrHA = getHourAngle(-opts.fajrAngle);
    const fajrTime = dhuhrMidday - fajrHA + ihtiyatHours;

    // Terbit (Sunrise): -0.833°
    const sunriseHA = getHourAngle(-0.833);
    const sunriseTime = dhuhrMidday - sunriseHA - ihtiyatHours;

    // Dzuhur: Midday + Ihtiyat
    const dhuhrTime = dhuhrMidday + ihtiyatHours;

    // Ashar: Shafi'i shadow factor = 1
    // Altitude = arccot(1 + tan|lat - dec|)
    const diff = Math.abs(lat - declination);
    const asrAlt = rad2deg(Math.atan(1.0 / (1.0 + Math.tan(deg2rad(diff)))));
    const asrHA = getHourAngle(asrAlt);
    const asrTime = dhuhrMidday + asrHA + ihtiyatHours;

    // Maghrib: sunset at -0.833°
    const maghribHA = getHourAngle(-0.833);
    const maghribTime = dhuhrMidday + maghribHA + ihtiyatHours;

    // Isya: depression angle (default -18°)
    const ishaHA = getHourAngle(-opts.ishaAngle);
    const ishaTime = dhuhrMidday + ishaHA + ihtiyatHours;

    return {
      date: dateStr,
      fajr: formatHours(fajrTime),
      sunrise: formatHours(sunriseTime),
      dhuhr: formatHours(dhuhrTime),
      asr: formatHours(asrTime),
      maghrib: formatHours(maghribTime),
      isha: formatHours(ishaTime),
      timezone: opts.timezone,
      timezoneAbbr: opts.timezoneAbbr,
      locationName: opts.locationName,
    };
  } catch (err) {
    console.error("Error calculating prayer times:", err);
    return null;
  }
}

/**
 * Matches an Ibadah activity name to its specific prayer time in the schedule
 */
export function getPrayerTimeForActivity(
  activityName: string,
  schedule: PrayerSchedule | null
): { time: string; label: string } | null {
  if (!schedule) return null;
  const name = activityName.toLowerCase();

  if (name.includes("subuh")) {
    return { time: schedule.fajr, label: `${schedule.fajr} ${schedule.timezoneAbbr}` };
  }
  if (name.includes("dzuhur") || name.includes("dhuhur") || name.includes("zuhur")) {
    return { time: schedule.dhuhr, label: `${schedule.dhuhr} ${schedule.timezoneAbbr}` };
  }
  if (name.includes("ashar") || name.includes("asar")) {
    return { time: schedule.asr, label: `${schedule.asr} ${schedule.timezoneAbbr}` };
  }
  if (name.includes("maghrib")) {
    return { time: schedule.maghrib, label: `${schedule.maghrib} ${schedule.timezoneAbbr}` };
  }
  if (name.includes("isya") || name.includes("isha")) {
    return { time: schedule.isha, label: `${schedule.isha} ${schedule.timezoneAbbr}` };
  }

  return null;
}

export type PrayerWindowStatus = "COMPLETED" | "ACTIVE" | "UPCOMING" | "EXPIRED" | "LOCKED";

/**
 * Determines the status of a prayer based on current time and date
 */
export function getPrayerStatus(
  activityName: string,
  schedule: PrayerSchedule | null,
  currentTimeStr: string, // "HH:mm" in user timezone
  isToday: boolean,
  isPast: boolean,
  isFuture: boolean,
  isCompleted: boolean
): { status: PrayerWindowStatus; statusLabel: string } {
  if (isCompleted) {
    return { status: "COMPLETED", statusLabel: "Selesai" };
  }

  if (isPast) {
    return { status: "LOCKED", statusLabel: "Belum dicatat · Terkunci" };
  }

  if (isFuture) {
    return { status: "UPCOMING", statusLabel: "Belum masuk waktu" };
  }

  // If today and not completed:
  if (!schedule) {
    return { status: "UPCOMING", statusLabel: "Belum dicatat" };
  }

  const prayer = getPrayerTimeForActivity(activityName, schedule);
  if (!prayer) {
    return { status: "UPCOMING", statusLabel: "Belum dicatat" };
  }

  const name = activityName.toLowerCase();
  let startTime = "";
  let endTime = "";

  if (name.includes("subuh")) {
    startTime = schedule.fajr;
    endTime = schedule.sunrise;
  } else if (name.includes("dzuhur") || name.includes("dhuhur") || name.includes("zuhur")) {
    startTime = schedule.dhuhr;
    endTime = schedule.asr;
  } else if (name.includes("ashar") || name.includes("asar")) {
    startTime = schedule.asr;
    endTime = schedule.maghrib;
  } else if (name.includes("maghrib")) {
    startTime = schedule.maghrib;
    endTime = schedule.isha;
  } else if (name.includes("isya") || name.includes("isha")) {
    startTime = schedule.isha;
    endTime = "23:59";
  }

  if (startTime && endTime) {
    if (currentTimeStr < startTime) {
      return { status: "UPCOMING", statusLabel: "Belum masuk waktu" };
    }
    if (currentTimeStr >= startTime && currentTimeStr <= endTime) {
      return { status: "ACTIVE", statusLabel: "Sedang berlangsung" };
    }
    if (currentTimeStr > endTime) {
      return { status: "EXPIRED", statusLabel: "Belum dicatat · Waktu terlewat" };
    }
  }

  return { status: "UPCOMING", statusLabel: "Belum dicatat" };
}
