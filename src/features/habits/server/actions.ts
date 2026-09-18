"use server";

import { prisma, isDatabaseAvailable, markDatabaseOffline } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { HabitSource } from "@prisma/client";

export async function toggleHabitAction(habitId: string, dateStr: string) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) {
      return { success: true, isOffline: true };
    }

    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: dateStr,
        },
      },
    });

    if (existing) {
      await prisma.habitCompletion.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.habitCompletion.create({
        data: {
          habitId,
          date: dateStr,
          source: HabitSource.MANUAL,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/habits");

    return { success: true, isCompleted: !existing };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function createHabitAction(data: { title: string; description?: string }) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) {
      return { success: true, isOffline: true };
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/habits");

    return { success: true, habit };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}
