"use server";

import { Budget } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import { serverAction } from "@/types/server-action";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type currentBudget = {
  budget: null | serializableBudget;
  currentExpenses: number;
};

type serializableBudget = Omit<Budget, 'amount'> & {amount: number}

export const getCurrentBudget: serverAction<string, currentBudget> = async (
  accountId
) => {
  try {
    if (!accountId) return { info: "error", error: "accountId param missing" };
    const { userId } = await auth();

    if (!userId) return { info: "unauthorized" };

    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!prismaUser) return { info: "unauthorized" };

    const budget = await db.budget.findFirst({
      where: {
        userId: prismaUser.id,
      },
    });

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: prismaUser.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      info: "successful",
      data: {
        budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
        currentExpenses: expenses._sum.amount
          ? expenses._sum.amount.toNumber()
          : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
};

export const updateBudget: serverAction<number, serializableBudget> = async (amount)=> {
  try {
     if (!amount) return { info: "error", error: "amount param missing" };
     const { userId } = await auth();

     if (!userId) return { info: "unauthorized" };

     const prismaUser = await db.user.findUnique({
       where: { clerkUserId: userId },
     });

     if (!prismaUser) return { info: "unauthorized" };


    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: prismaUser.id,
      },
      update: {
        amount,
      },
      create: {
        userId: prismaUser.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      info: 'successful',
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error: unknown) {
    console.error("Error updating budget:", error);
      return { info: 'error', error: (error as any).message || 'Error updating budget' };
  }
}
