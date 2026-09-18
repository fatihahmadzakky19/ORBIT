"use server";

import { prisma, isDatabaseAvailable, markDatabaseOffline } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getTodayInTimezone, getCurrentTimeInTimezone } from "@/lib/date";
import { getPrayerScheduleForDate } from "@/features/ibadah/services/prayerTimes";

// Cast to any to prevent stale IDE type-checking warnings
const db = prisma as any;

const FALLBACK_USER = {
  id: "local-user-orbit",
  email: "alex@orbit.local",
  name: "Fatih Ahmad Zakky",
};

async function getDefaultUser() {
  const isOnline = await isDatabaseAvailable();
  if (!isOnline) {
    return FALLBACK_USER;
  }
  try {
    let user = await db.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) {
      user = await db.user.create({
        data: {
          email: "alex@orbit.local",
          name: "Fatih Ahmad Zakky",
        },
      });
    }
    return user;
  } catch (error) {
    markDatabaseOffline(error);
    return FALLBACK_USER;
  }
}

const DEFAULT_SEEDS = [
  // ── Wajib 5 Waktu ──
  { name: "Sholat Subuh", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 1, isCustom: false, isActive: true },
  { name: "Sholat Dzuhur", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 2, isCustom: false, isActive: true },
  { name: "Sholat Ashar", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 3, isCustom: false, isActive: true },
  { name: "Sholat Maghrib", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 4, isCustom: false, isActive: true },
  { name: "Sholat Isya", type: "WAJIB", mode: "BOTH", targetCount: 1, unit: "waktu", order: 5, isCustom: false, isActive: true },

  // ── Sunnah Harian ──
  { name: "Sholat Dhuha", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 6, isCustom: false, isActive: true },
  { name: "Sholat Tahajud", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 7, isCustom: false, isActive: true },
  { name: "Sholat Witir", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 8, isCustom: false, isActive: true },
  { name: "Sholat Rawatib", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 9, isCustom: false, isActive: true },
  { name: "Puasa Sunnah", type: "SUNNAH", mode: "DAILY", targetCount: 1, unit: "hari", order: 10, isCustom: false, isActive: true },
  { name: "Tilawah Al-Qur'an", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "halaman", order: 11, isCustom: false, isActive: true },
  { name: "Dzikir Pagi", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 12, isCustom: false, isActive: true },
  { name: "Dzikir Petang", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 13, isCustom: false, isActive: true },
  { name: "Sedekah", type: "SUNNAH", mode: "BOTH", targetCount: 1, unit: "kali", order: 14, isCustom: false, isActive: true },

  // ── Khusus Ramadhan ──
  { name: "Puasa Ramadhan", type: "WAJIB", mode: "RAMADHAN", targetCount: 1, unit: "hari", order: 15, isCustom: false, isActive: true },
  { name: "Sahur", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 16, isCustom: false, isActive: true },
  { name: "Sholat Tarawih", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 17, isCustom: false, isActive: true },
  { name: "I'tikaf di Masjid", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 18, isCustom: false, isActive: true },
  { name: "Doa & Munajat", type: "SUNNAH", mode: "RAMADHAN", targetCount: 1, unit: "kali", order: 19, isCustom: false, isActive: true },
];

export async function getIbadahInitialDataAction(dateStr: string) {
  const serverToday = getTodayInTimezone("Asia/Jakarta");
  const serverTime = getCurrentTimeInTimezone("Asia/Jakarta");
  const prayerSchedule = getPrayerScheduleForDate(dateStr, { timezone: "Asia/Jakarta" });

  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return {
        success: true,
        isOffline: true,
        serverToday,
        serverTime,
        prayerSchedule,
        activities: [],
        records: [],
        reflection: null,
        todayTilawah: [],
        recentTilawah: [],
        allCompletedRecords: [],
      };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return {
        success: true,
        isOffline: true,
        serverToday,
        serverTime,
        prayerSchedule,
        activities: [],
        records: [],
        reflection: null,
        todayTilawah: [],
        recentTilawah: [],
        allCompletedRecords: [],
      };
    }

    // Check if activities exist, otherwise seed them
    let activities = await db.ibadahActivity.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
    });

    if (activities.length === 0) {
      await db.ibadahActivity.createMany({
        data: DEFAULT_SEEDS.map((s) => ({
          userId: user.id,
          name: s.name,
          type: s.type,
          mode: s.mode,
          targetCount: s.targetCount,
          unit: s.unit,
          order: s.order,
          isCustom: false,
          isActive: true,
        })),
      });

      activities = await db.ibadahActivity.findMany({
        where: { userId: user.id },
        orderBy: { order: "asc" },
      });
    }

    // Get records for selected date
    const records = await db.ibadahRecord.findMany({
      where: {
        userId: user.id,
        date: dateStr,
      },
    });

    // Get reflection for selected date
    const reflection = await db.ibadahDailyReflection.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: dateStr,
        },
      },
    });

    // Get Tilawah records for selected date
    const todayTilawah = await db.quranReading.findMany({
      where: {
        userId: user.id,
        date: dateStr,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get recent Tilawah history (last 10 entries)
    const recentTilawah = await db.quranReading.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 10,
    });

    // Get all records for streak / 7-day calculations
    const allRecords = await db.ibadahRecord.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      select: {
        activityId: true,
        date: true,
        completed: true,
        count: true,
      },
    });

    return {
      success: true,
      serverToday,
      serverTime,
      prayerSchedule,
      activities,
      records,
      reflection,
      todayTilawah,
      recentTilawah,
      allCompletedRecords: allRecords,
    };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return {
      success: true,
      isOffline: true,
      serverToday,
      serverTime,
      prayerSchedule,
      activities: [],
      records: [],
      reflection: null,
      todayTilawah: [],
      recentTilawah: [],
      allCompletedRecords: [],
    };
  }
}

export async function toggleIbadahRecordAction(data: {
  activityId: string;
  date: string;
  completed?: boolean;
}) {
  try {
    // SERVER-SIDE DATE VALIDATION (Asia/Jakarta timezone)
    const todayStr = getTodayInTimezone("Asia/Jakarta");

    if (data.date < todayStr) {
      return {
        success: false,
        error: "Catatan ibadah untuk tanggal yang sudah berlalu tidak dapat diubah.",
      };
    }

    if (data.date > todayStr) {
      return {
        success: false,
        error: "Ibadah untuk tanggal mendatang belum dapat dicatat.",
      };
    }

    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return {
        success: true,
        isOffline: true,
        message: "Disimpan di penyimpanan lokal (Database offline)",
      };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return {
        success: true,
        isOffline: true,
        message: "Disimpan di penyimpanan lokal (Database offline)",
      };
    }

    // Verify activity exists and belongs to user
    const activity = await db.ibadahActivity.findFirst({
      where: {
        id: data.activityId,
        userId: user.id,
      },
    });
    if (!activity) {
      return { success: true, isOffline: true };
    }

    const existing = await db.ibadahRecord.findUnique({
      where: {
        userId_activityId_date: {
          userId: user.id,
          activityId: data.activityId,
          date: data.date,
        },
      },
    });

    const isCompleted = data.completed !== undefined ? data.completed : !existing?.completed;

    const record = await db.ibadahRecord.upsert({
      where: {
        userId_activityId_date: {
          userId: user.id,
          activityId: data.activityId,
          date: data.date,
        },
      },
      update: {
        completed: isCompleted,
        count: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: user.id,
        activityId: data.activityId,
        date: data.date,
        completed: isCompleted,
        count: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    revalidatePath("/ibadah");
    return { success: true, record };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return {
      success: true,
      isOffline: true,
      message: "Disimpan di penyimpanan lokal (Database offline)",
    };
  }
}

export async function createCustomIbadahAction(data: {
  name: string;
  type: "WAJIB" | "SUNNAH" | "CUSTOM";
  mode: "DAILY" | "RAMADHAN" | "BOTH";
  targetCount?: number;
  unit?: string;
  isActive?: boolean;
}) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    const count = await db.ibadahActivity.count({
      where: { userId: user.id },
    });

    const activity = await db.ibadahActivity.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        type: data.type,
        mode: data.mode || "BOTH",
        targetCount: data.targetCount || 1,
        unit: data.unit || "kali",
        order: count + 1,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isCustom: true,
      },
    });

    revalidatePath("/ibadah");
    return { success: true, activity };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function updateCustomIbadahAction(data: {
  id: string;
  name?: string;
  type?: "WAJIB" | "SUNNAH" | "CUSTOM";
  mode?: "DAILY" | "RAMADHAN" | "BOTH";
  targetCount?: number;
  unit?: string;
  isActive?: boolean;
}) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    // Verify ownership
    const existing = await db.ibadahActivity.findFirst({
      where: { id: data.id, userId: user.id },
    });
    if (!existing) {
      return { success: true, isOffline: true };
    }

    const activity = await db.ibadahActivity.update({
      where: { id: data.id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.mode ? { mode: data.mode } : {}),
        ...(data.targetCount ? { targetCount: data.targetCount } : {}),
        ...(data.unit ? { unit: data.unit } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    revalidatePath("/ibadah");
    return { success: true, activity };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function toggleActivityActiveAction(activityId: string, isActive: boolean) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    const updated = await db.ibadahActivity.updateMany({
      where: { id: activityId, userId: user.id },
      data: { isActive },
    });
    revalidatePath("/ibadah");
    return { success: true, count: updated.count };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function reorderActivitiesAction(activityIds: string[]) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    for (let index = 0; index < activityIds.length; index++) {
      await db.ibadahActivity.updateMany({
        where: { id: activityIds[index], userId: user.id },
        data: { order: index + 1 },
      });
    }
    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function deleteCustomIbadahAction(activityId: string) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    // Verify ownership
    const existing = await db.ibadahActivity.findFirst({
      where: { id: activityId, userId: user.id },
    });
    if (!existing) {
      return { success: true, isOffline: true };
    }

    // Delete associated records first
    await db.ibadahRecord.deleteMany({
      where: {
        userId: user.id,
        activityId,
      },
    });

    // Delete activity
    await db.ibadahActivity.delete({
      where: {
        id: activityId,
      },
    });

    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function saveIbadahReflectionAction(data: {
  date: string;
  content: string;
  mood?: string;
}) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return {
        success: true,
        isOffline: true,
        reflection: {
          id: `local-refl-${data.date}`,
          userId: FALLBACK_USER.id,
          date: data.date,
          content: data.content.trim(),
          mood: data.mood || null,
        },
      };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return {
        success: true,
        isOffline: true,
        reflection: {
          id: `local-refl-${data.date}`,
          userId: FALLBACK_USER.id,
          date: data.date,
          content: data.content.trim(),
          mood: data.mood || null,
        },
      };
    }

    const reflection = await db.ibadahDailyReflection.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: data.date,
        },
      },
      update: {
        content: data.content.trim(),
        mood: data.mood || null,
      },
      create: {
        userId: user.id,
        date: data.date,
        content: data.content.trim(),
        mood: data.mood || null,
      },
    });

    revalidatePath("/ibadah");
    return { success: true, reflection };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return {
      success: true,
      isOffline: true,
      reflection: {
        id: `local-refl-${data.date}`,
        userId: FALLBACK_USER.id,
        date: data.date,
        content: data.content.trim(),
        mood: data.mood || null,
      },
    };
  }
}

export async function resetIbadahDailyAction(dateStr: string) {
  try {
    const todayStr = getTodayInTimezone("Asia/Jakarta");

    if (dateStr !== todayStr) {
      return {
        success: false,
        error: "Hanya amalan hari ini yang dapat di-reset. Data riwayat terkunci.",
      };
    }

    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    await db.ibadahRecord.deleteMany({
      where: {
        userId: user.id,
        date: dateStr,
      },
    });

    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function batchImportIbadahRecordsAction(
  records: Array<{
    activityId: string;
    date: string;
    completed: boolean;
    count: number;
    completedAt?: string;
  }>
) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true, imported: records.length };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true, imported: records.length };
    }

    for (const r of records) {
      await db.ibadahRecord.upsert({
        where: {
          userId_activityId_date: {
            userId: user.id,
            activityId: r.activityId,
            date: r.date,
          },
        },
        update: {
          completed: r.completed,
          count: r.count,
          completedAt: r.completedAt ? new Date(r.completedAt) : null,
        },
        create: {
          userId: user.id,
          activityId: r.activityId,
          date: r.date,
          completed: r.completed,
          count: r.count,
          completedAt: r.completedAt ? new Date(r.completedAt) : null,
        },
      });
    }

    revalidatePath("/ibadah");
    return { success: true, imported: records.length };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true, imported: records.length };
  }
}

// -------------------------------------------------------------
// Tilawah Al-Qur'an Actions
// -------------------------------------------------------------

export async function createQuranReadingAction(data: {
  date: string;
  startSurah: string;
  startAyah?: number;
  endSurah?: string;
  endAyah?: number;
  juz?: number;
  startPage?: number;
  endPage?: number;
  pagesRead?: number;
  durationMinutes?: number;
  notes?: string;
}) {
  try {
    let calculatedPages = data.pagesRead || 1;
    if (data.startPage && data.endPage && data.endPage >= data.startPage) {
      calculatedPages = data.endPage - data.startPage + 1;
    }

    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return {
        success: true,
        isOffline: true,
        reading: {
          id: `local-quran-${Date.now()}`,
          userId: FALLBACK_USER.id,
          date: data.date,
          startSurah: data.startSurah.trim(),
          startAyah: data.startAyah || null,
          endSurah: data.endSurah ? data.endSurah.trim() : data.startSurah.trim(),
          endAyah: data.endAyah || null,
          juz: data.juz || null,
          startPage: data.startPage || null,
          endPage: data.endPage || null,
          pagesRead: calculatedPages,
          durationMinutes: data.durationMinutes || null,
          notes: data.notes ? data.notes.trim() : null,
          createdAt: new Date().toISOString(),
        },
      };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    const reading = await db.quranReading.create({
      data: {
        userId: user.id,
        date: data.date,
        startSurah: data.startSurah.trim(),
        startAyah: data.startAyah || null,
        endSurah: data.endSurah ? data.endSurah.trim() : data.startSurah.trim(),
        endAyah: data.endAyah || null,
        juz: data.juz || null,
        startPage: data.startPage || null,
        endPage: data.endPage || null,
        pagesRead: calculatedPages,
        durationMinutes: data.durationMinutes || null,
        notes: data.notes ? data.notes.trim() : null,
      },
    });

    revalidatePath("/ibadah");
    return { success: true, reading };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function updateQuranReadingAction(data: {
  id: string;
  date?: string;
  startSurah?: string;
  startAyah?: number;
  endSurah?: string;
  endAyah?: number;
  juz?: number;
  startPage?: number;
  endPage?: number;
  pagesRead?: number;
  durationMinutes?: number;
  notes?: string;
}) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    // Verify ownership
    const existing = await db.quranReading.findFirst({
      where: { id: data.id, userId: user.id },
    });
    if (!existing) {
      return { success: true, isOffline: true };
    }

    let calculatedPages = data.pagesRead;
    if (data.startPage && data.endPage && data.endPage >= data.startPage) {
      calculatedPages = data.endPage - data.startPage + 1;
    }

    const reading = await db.quranReading.update({
      where: { id: data.id },
      data: {
        ...(data.date ? { date: data.date } : {}),
        ...(data.startSurah ? { startSurah: data.startSurah.trim() } : {}),
        ...(data.startAyah !== undefined ? { startAyah: data.startAyah || null } : {}),
        ...(data.endSurah !== undefined ? { endSurah: data.endSurah ? data.endSurah.trim() : null } : {}),
        ...(data.endAyah !== undefined ? { endAyah: data.endAyah || null } : {}),
        ...(data.juz !== undefined ? { juz: data.juz || null } : {}),
        ...(data.startPage !== undefined ? { startPage: data.startPage || null } : {}),
        ...(data.endPage !== undefined ? { endPage: data.endPage || null } : {}),
        ...(calculatedPages !== undefined ? { pagesRead: calculatedPages } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes || null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes ? data.notes.trim() : null } : {}),
      },
    });

    revalidatePath("/ibadah");
    return { success: true, reading };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function deleteQuranReadingAction(id: string) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

    // Ownership check
    const existing = await db.quranReading.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return { success: true, isOffline: true };
    }

    await db.quranReading.delete({
      where: { id },
    });

    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function getQuranReadingHistoryAction(limit: number = 20) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true, readings: [] };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true, readings: [] };
    }

    const readings = await db.quranReading.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return { success: true, readings };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true, readings: [] };
  }
}
