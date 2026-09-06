"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { HabitSource } from "@prisma/client";

export async function createActivityAction(data: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  note?: string;
  goalId?: string;
  habitId?: string;
  learningTopic?: string;
}) {
  try {
    // 1. Get default user (Alex)
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

    // 2. Parse timestamps
    const startedAt = new Date(`${data.date}T${data.time}:00`);
    const endedAt = new Date(startedAt.getTime() + data.durationMinutes * 60 * 1000);

    // Business Invariant: No future activity
    if (startedAt.getTime() > Date.now() + 5 * 60 * 1000) {
      throw new Error("Cannot record an activity with a future date/time.");
    }

    // 3. Create Activity
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        title: data.title,
        startedAt,
        endedAt,
        durationMinutes: data.durationMinutes,
        note: data.note || null,
        goalId: data.goalId || null,
        habitId: data.habitId || null,
      },
    });

    // 4. If linked to Habit, mark completion for that calendar date
    if (data.habitId) {
      await prisma.habitCompletion.upsert({
        where: {
          habitId_date: {
            habitId: data.habitId,
            date: data.date,
          },
        },
        update: {
          activityId: activity.id,
        },
        create: {
          habitId: data.habitId,
          date: data.date,
          source: HabitSource.ACTIVITY,
          activityId: activity.id,
        },
      });
    }

    // 5. If learning topic provided in context, create Learning record
    if (data.learningTopic && data.learningTopic.trim()) {
      await prisma.learning.create({
        data: {
          userId: user.id,
          topic: data.learningTopic,
          activityId: activity.id,
          goalId: data.goalId || null,
          date: startedAt,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/habits");
    revalidatePath("/learning");
    revalidatePath("/goals");

    return { success: true, activity };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save activity";
    return { success: false, error: message };
  }
}
