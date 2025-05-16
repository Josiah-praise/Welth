"use server";

import { PrismaClient, Transaction } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import { serverAction } from "@/types/server-action";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type transactionIdArray = Array<string>;
export type serializableTransaction = Omit<Transaction, "amount"> & {
  amount: number;
};

export const deleteTransactions: serverAction<string[], void> = async (
  idArray?: string[]
) => {
  if (!idArray || idArray.length === 0)
    return { info: "error", error: "missing array of transaction Id" };

  try {
    const { userId } = await auth();

    if (!userId) return { info: "unauthorized" };

    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!prismaUser) return { info: "unauthorized" };

    // const deletedTransactions = await db.transaction.deleteMany({
    //   where: { id: { in: idArray } },
    // });

    let deletedTransactions = { count: 0 };

    await db.$transaction(async (tx: PrismaClient) => {
      // get transactions
      const transactions = await tx.transaction.findMany({
        where: { id: { in: idArray } },
      });
      // calculate total income and expense
      const txsBalance = transactions.reduce<Record<string, number>>(
        (acc, tx) => {
          if (tx.type === "EXPENSE")
            return {
              ...acc,
              expense: (acc.expense ?? 0) + parseFloat(tx.amount.toString()),
            };
          else
            return {
              ...acc,
              income: (acc.income ?? 0) + parseFloat(tx.amount.toString()),
            };
        },
        {}
      );

      console.log(typeof txsBalance["income"]);

      // update account balance
      if (transactions.length > 0) {
        if (txsBalance["income"] && txsBalance["expense"]) {
          await tx.account.update({
            where: { id: transactions[0].accountId },
            data: {
              balance: {
                increment: txsBalance["expense"] - txsBalance["income"],
              },
            },
          });
        } else if (txsBalance["income"]) {
          await tx.account.update({
            where: { id: transactions[0].accountId },
            data: {
              balance: {
                increment: -txsBalance["income"],
              },
            },
          });
        } else {
          await tx.account.update({
            where: { id: transactions[0].accountId },
            data: {
              balance: {
                increment: txsBalance["expense"],
              },
            },
          });
        }
      }
      // delete transactions
      deletedTransactions = await tx.transaction.deleteMany({
        where: { id: { in: idArray } },
      });
    });

    console.log(deletedTransactions.count, " transactions were deleted");

    revalidatePath("/dashboard");

    return { info: "successful" };

    //   revalidatePath('/accounts/' + accountId)
  } catch (error) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message ?? "Error deleting transactions",
    };
  }
};
