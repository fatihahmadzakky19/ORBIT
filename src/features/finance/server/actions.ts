"use server";

import { prisma, isDatabaseAvailable, markDatabaseOffline } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

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

    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

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
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
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
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

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
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    await db.transaction.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/finance");
    return { success: true };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function createCategoryAction(data: {
  name: string;
  type?: TransactionType;
  icon?: string;
  color?: string;
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
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    await db.transactionCategory.delete({
      where: { id },
    });

    revalidatePath("/finance");
    return { success: true };
  } catch (error: unknown) {
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}

export async function updateActualBalanceAction(newBalance: number) {
  try {
    const isOnline = await isDatabaseAvailable();
    if (!isOnline) {
      return { success: true, isOffline: true };
    }

    const user = await getDefaultUser();
    if (user.id === FALLBACK_USER.id) {
      return { success: true, isOffline: true };
    }

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
    markDatabaseOffline(error);
    return { success: true, isOffline: true };
  }
}
