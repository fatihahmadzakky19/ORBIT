"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { startOfWeek, endOfWeek } from "date-fns";

export async function createReflectionAction(data: {
  weekStart: string; // ISO date string of Monday
  whatHappened: string;
  whatLearned: string;
  whatChanged: string;
  wentWell?: string;
  wentWrong?: string;
  selfInsight?: string;
  notes?: string;
}) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

    const monday = startOfWeek(new Date(data.weekStart), { weekStartsOn: 1 });

    const reflection = await prisma.reflection.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart: monday,
        },
      },
      update: {
        whatHappened: data.whatHappened,
        whatLearned: data.whatLearned,
        whatChanged: data.whatChanged,
        wentWell: data.wentWell || null,
        wentWrong: data.wentWrong || null,
        selfInsight: data.selfInsight || null,
        notes: data.notes || null,
      },
      create: {
        userId: user.id,
        weekStart: monday,
        whatHappened: data.whatHappened,
        whatLearned: data.whatLearned,
        whatChanged: data.whatChanged,
        wentWell: data.wentWell || null,
        wentWrong: data.wentWrong || null,
        selfInsight: data.selfInsight || null,
        notes: data.notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/journey/reflections");

    return { success: true, reflection };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save reflection";
    return { success: false, error: message };
  }
}

export async function getWeeklyContextAction(date: Date = new Date()) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) return null;

    const monday = startOfWeek(date, { weekStartsOn: 1 });
    const sunday = endOfWeek(date, { weekStartsOn: 1 });

    const [activities, learnings, habitsCount, activeGoalsCount, transactions] = await Promise.all([
      prisma.activity.findMany({
        where: {
          userId: user.id,
          startedAt: { gte: monday, lte: sunday },
          deletedAt: null,
        },
        select: { id: true, title: true, durationMinutes: true },
      }),
      prisma.learning.findMany({
        where: {
          userId: user.id,
          date: { gte: monday, lte: sunday },
          deletedAt: null,
        },
        select: { id: true, topic: true, takeaways: true },
      }),
      prisma.habit.count({
        where: { userId: user.id, isActive: true },
      }),
      prisma.goal.count({
        where: { userId: user.id, status: "IN_PROGRESS" },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: monday, lte: sunday },
          deletedAt: null,
        },
        select: { type: true, amount: true },
      }),
    ]);

    let incomeTotal = 0;
    let expenseTotal = 0;
    for (const t of transactions) {
      const amt = t.amount.toNumber();
      if (t.type === "INCOME") incomeTotal += amt;
      else expenseTotal += amt;
    }

    return {
      activitiesCount: activities.length,
      learningCount: learnings.length,
      habitsCount,
      activeGoalsCount,
      incomeTotal,
      expenseTotal,
      activities,
      learnings,
    };
  } catch {
    return null;
  }
}
