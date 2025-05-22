"use server";

import { PrismaClient, Transaction } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import { TransactionSchema } from "@/schema/transactionSchema";
import { serverAction } from "@/types/server-action";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import aj from "@/lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

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

    await db.$transaction(async (tx) => {
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

// Create Transaction
export const createTransaction: serverAction<
  TransactionSchema,
  serializableTransaction
> = async (data) => {
  if (!data) {
    return { info: "error", error: "missing transaction data" };
  }
  try {
    const { userId } = await auth();
    if (!userId) return { info: "unauthorized" };

    // // Get request data for ArcJet
    // const req = await request();

    // // Check rate limit
    // const decision = await aj.protect(req, {
    //   userId,
    //   requested: 1, // Specify how many tokens to consume
    // });

    // if (decision.isDenied()) {
    //   if (decision.reason.isRateLimit()) {
    //     const { remaining, reset } = decision.reason;
    //     console.error({
    //       code: "RATE_LIMIT_EXCEEDED",
    //       details: {
    //         remaining,
    //         resetInSeconds: reset,
    //       },
    //     });

    //     return {
    //       info: "too many requests",
    //       error: `Rate limit exceeded. Try again in ${reset} seconds.`,
    //     };
    //   }

    //   return {
    //     info: "unauthorized",
    //     error: "Unauthorized",
    //   };
    // }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { info: "not found", error: "User not found" };
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return { info: "error", error: "Account not found" };
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + Number(balanceChange);

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return {
      info: "successful",
      data: { ...transaction, amount: transaction.amount.toNumber() },
    };
  } catch (error) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message ?? "Error creating transaction",
    };
  }
};

type updateTransactionParam = {
  id: string;
  data: TransactionSchema;
};

export const updateTransaction: serverAction<
  updateTransactionParam,
  serializableTransaction
> = async (param) => {
  console.log(param);
  if (!param?.id || !param?.data) {
    return { info: "error", error: "missing transaction data" };
  }
  const { id, data } = param;
  try {
    const { userId } = await auth();
    if (!userId) return { info: "unauthorized", error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { info: "unauthorized", error: "User not found" };

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction)
      return { info: "not found", error: "Transaction not found" };

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = Number(newBalanceChange) - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return {
      info: "successful",
      data: { ...transaction, amount: transaction.amount.toNumber() },
    };
  } catch (error) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message ?? "Error updating transaction",
    };
  }
};

// Helper function to calculate next recurring date
function calculateNextRecurringDate(
  startDate: Date,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export const getTransaction: serverAction<
  string,
  serializableTransaction
> = async (id) => {
  if (!id) return { info: "error", error: "missing transaction id" };
  console.log(id);
  try {
    const { userId } = await auth();
    if (!userId) return { info: "unauthorized" };

    const transaction = await db.transaction.findUnique({
      where: {
        id,
      },
    });
    console.log(transaction);

    if (!transaction)
      return { info: "not found", error: "Transaction not found" };

    return {
      info: "successful",
      data: { ...transaction, amount: transaction.amount.toNumber() },
    };
  } catch (error) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message ?? "Error fetching transaction",
    };
  }
};

export const scanReceipt: serverAction<File, reciptResponse> = async (file) => {
  if (!file) return { info: "error", error: "missing file" };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        info: "successful",
        data: {
          amount: parseFloat(data.amount),
          date: new Date(data.date),
          description: data.description,
          category: data.category,
          merchantName: data.merchantName,
        },
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return {
        info: "error",
        error: (parseError as Error).message ?? "Failed to parse JSON response",
      };
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return { info: "error", error: (error as Error).message ?? "Failed to scan receipt" };
  }
};

type reciptResponse = {
  amount: number;
  date: Date;
  description: string;
  category: string;
  merchantName: string;
};
