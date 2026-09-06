"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createLearningAction(data: {
  topic: string;
  understood?: string;
  source?: string;
  date?: string;
  goalId?: string;
}) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

    const learning = await prisma.learning.create({
      data: {
        userId: user.id,
        topic: data.topic,
        takeaways: data.understood || null,
        source: data.source || null,
        date: data.date ? new Date(data.date) : new Date(),
        goalId: data.goalId || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/learning");
    revalidatePath("/goals");

    return { success: true, learning };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save learning";
    return { success: false, error: message };
  }
}
