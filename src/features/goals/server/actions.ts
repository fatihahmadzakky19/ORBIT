"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GoalType, GoalStatus, ProgressMode } from "@prisma/client";

export async function createGoalAction(data: {
  title: string;
  description?: string;
  type: GoalType;
  progressMode?: ProgressMode;
  targetValue?: number;
  unit?: string;
  deadline?: string;
  milestones?: string[];
}) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description || null,
        type: data.type,
        status: GoalStatus.IN_PROGRESS,
        progressMode: data.progressMode || null,
        targetValue: data.targetValue || null,
        unit: data.unit || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        milestones:
          data.milestones && data.milestones.length > 0
            ? {
                create: data.milestones.map((m, idx) => ({
                  title: m,
                  order: idx + 1,
                  isCompleted: false,
                })),
              }
            : undefined,
      },
    });

    revalidatePath("/");
    revalidatePath("/goals");

    return { success: true, goal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create goal";
    return { success: false, error: message };
  }
}

export async function toggleMilestoneAction(milestoneId: string) {
  try {
    const milestone = await prisma.goalMilestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone) throw new Error("Milestone not found");

    const updated = await prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: {
        isCompleted: !milestone.isCompleted,
        completedAt: !milestone.isCompleted ? new Date() : null,
      },
    });

    revalidatePath("/goals");

    return { success: true, milestone: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle milestone";
    return { success: false, error: message };
  }
}
