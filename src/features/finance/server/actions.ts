"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

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

    const user = await getDefaultUser();

    const transaction = await db.transaction.create({
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
      const goal = await db.goal.findUnique({
        where: { id: data.goalId },
      });
      if (goal && goal.targetValue) {
        const totalAllocated = await db.transaction.aggregate({
          where: { goalId: data.goalId, deletedAt: null },
          _sum: { amount: true },
        });
        const currentSum = totalAllocated._sum.amount?.toNumber() || 0;
        await db.goal.update({
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

export async function updateTransactionAction(
  id: string,
  data: {
    amount?: number;
    category?: string;
    note?: string;
    type?: TransactionType;
    date?: string;
  }
) {
  try {
    const transaction = await db.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.note !== undefined ? { note: data.note } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/finance");
    return { success: true, transaction };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update transaction";
    return { success: false, error: message };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await db.transaction.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/finance");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete transaction";
    return { success: false, error: message };
  }
}

export async function createCategoryAction(data: {
  name: string;
  type?: TransactionType;
  icon?: string;
  color?: string;
}) {
  try {
    const user = await getDefaultUser();
    const category = await db.transactionCategory.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        type: data.type || TransactionType.EXPENSE,
        icon: data.icon || null,
        color: data.color || null,
      },
    });

    revalidatePath("/finance");
    return { success: true, category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await db.transactionCategory.delete({
      where: { id },
    });

    revalidatePath("/finance");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return { success: false, error: message };
  }
}

export async function updateActualBalanceAction(newBalance: number) {
  try {
    const user = await getDefaultUser();

    await db.financeProfile.upsert({
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
