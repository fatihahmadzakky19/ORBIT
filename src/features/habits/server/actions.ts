"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { HabitSource } from "@prisma/client";

export async function toggleHabitAction(habitId: string, dateStr: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

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
    const message = error instanceof Error ? error.message : "Failed to toggle habit";
    return { success: false, error: message };
  }
}

export async function createHabitAction(data: { title: string; description?: string }) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

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
    const message = error instanceof Error ? error.message : "Failed to create habit";
    return { success: false, error: message };
  }
}
