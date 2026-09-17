"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Cast to any to prevent stale IDE type-checking warnings
const db = prisma as any;

async function getDefaultUser() {
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
  try {
    const user = await getDefaultUser();

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
      activities,
      records,
      reflection,
      todayTilawah,
      recentTilawah,
      allCompletedRecords: allRecords,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load ibadah data";
    return { success: false, error: message };
  }
}

export async function toggleIbadahRecordAction(data: {
  activityId: string;
  date: string;
  completed?: boolean;
}) {
  try {
    const user = await getDefaultUser();

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
    const message = error instanceof Error ? error.message : "Failed to toggle ibadah record";
    return { success: false, error: message };
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
    const user = await getDefaultUser();
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
    const message = error instanceof Error ? error.message : "Failed to create custom ibadah";
    return { success: false, error: message };
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
    const user = await getDefaultUser();

    // Verify ownership
    const existing = await db.ibadahActivity.findFirst({
      where: { id: data.id, userId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Activity not found or unauthorized" };
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
    const message = error instanceof Error ? error.message : "Failed to update custom ibadah";
    return { success: false, error: message };
  }
}

export async function toggleActivityActiveAction(activityId: string, isActive: boolean) {
  try {
    const user = await getDefaultUser();
    const updated = await db.ibadahActivity.updateMany({
      where: { id: activityId, userId: user.id },
      data: { isActive },
    });
    revalidatePath("/ibadah");
    return { success: true, count: updated.count };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle activity active";
    return { success: false, error: message };
  }
}

export async function reorderActivitiesAction(activityIds: string[]) {
  try {
    const user = await getDefaultUser();
    for (let index = 0; index < activityIds.length; index++) {
      await db.ibadahActivity.updateMany({
        where: { id: activityIds[index], userId: user.id },
        data: { order: index + 1 },
      });
    }
    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reorder activities";
    return { success: false, error: message };
  }
}

export async function deleteCustomIbadahAction(activityId: string) {
  try {
    const user = await getDefaultUser();

    // Verify ownership
    const existing = await db.ibadahActivity.findFirst({
      where: { id: activityId, userId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Activity not found or unauthorized" };
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
    const message = error instanceof Error ? error.message : "Failed to delete custom ibadah";
    return { success: false, error: message };
  }
}

export async function saveIbadahReflectionAction(data: {
  date: string;
  content: string;
  mood?: string;
}) {
  try {
    const user = await getDefaultUser();

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
    const message = error instanceof Error ? error.message : "Failed to save ibadah reflection";
    return { success: false, error: message };
  }
}

export async function resetIbadahDailyAction(dateStr: string) {
  try {
    const user = await getDefaultUser();

    await db.ibadahRecord.deleteMany({
      where: {
        userId: user.id,
        date: dateStr,
      },
    });

    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset daily ibadah";
    return { success: false, error: message };
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
    const user = await getDefaultUser();

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
    const message = error instanceof Error ? error.message : "Failed to import ibadah records";
    return { success: false, error: message };
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
    const user = await getDefaultUser();

    // Auto-calculate pagesRead if startPage and endPage are provided
    let calculatedPages = data.pagesRead || 1;
    if (data.startPage && data.endPage && data.endPage >= data.startPage) {
      calculatedPages = data.endPage - data.startPage + 1;
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
    const message = error instanceof Error ? error.message : "Failed to record quran reading";
    return { success: false, error: message };
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
    const user = await getDefaultUser();

    // Verify ownership
    const existing = await db.quranReading.findFirst({
      where: { id: data.id, userId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Reading record not found or unauthorized" };
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
    const message = error instanceof Error ? error.message : "Failed to update quran reading";
    return { success: false, error: message };
  }
}

export async function deleteQuranReadingAction(id: string) {
  try {
    const user = await getDefaultUser();

    // Ownership check
    const existing = await db.quranReading.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Reading record not found or unauthorized" };
    }

    await db.quranReading.delete({
      where: { id },
    });

    revalidatePath("/ibadah");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete quran reading";
    return { success: false, error: message };
  }
}

export async function getQuranReadingHistoryAction(limit: number = 20) {
  try {
    const user = await getDefaultUser();
    const readings = await db.quranReading.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return { success: true, readings };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch quran history";
    return { success: false, error: message };
  }
}
