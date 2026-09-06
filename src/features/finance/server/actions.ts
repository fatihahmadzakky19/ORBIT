"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function createTransactionAction(data: {
  type: TransactionType;
  amount: number;
  category: string;
  date?: string;
  note?: string;
  goalId?: string;
}) {
  try {
    if (!data.amount || data.amount <= 0) {
      throw new Error("Transaction amount must be greater than zero.");
    }

    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        note: data.note || null,
        goalId: data.goalId || null,
      },
    });

    // If goalId is provided and Goal is finance mode, update goal progress
    if (data.goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: data.goalId },
      });
      if (goal && goal.targetValue) {
        const totalAllocated = await prisma.transaction.aggregate({
          where: { goalId: data.goalId, deletedAt: null },
          _sum: { amount: true },
        });
        const currentSum = totalAllocated._sum.amount?.toNumber() || 0;
        await prisma.goal.update({
          where: { id: data.goalId },
          data: {
            currentValue: currentSum,
          },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/finance");
    revalidatePath("/goals");

    return { success: true, transaction };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record transaction";
    return { success: false, error: message };
  }
}

export async function updateActualBalanceAction(newBalance: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "alex@orbit.local" },
    });
    if (!user) throw new Error("User not found");

    await prisma.financeProfile.upsert({
      where: { userId: user.id },
      update: {
        actualBalance: newBalance,
        actualBalanceUpdatedAt: new Date(),
      },
      create: {
        userId: user.id,
        startingBalance: 0,
        actualBalance: newBalance,
        actualBalanceUpdatedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath("/finance");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update actual balance";
    return { success: false, error: message };
  }
}
