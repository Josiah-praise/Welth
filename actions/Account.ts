"use server";

import {
  Account,
  AccountType,
  PrismaClient,
  Transaction,
} from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { safeSerializeAccount, safeSerializeTransaction } from "@/lib/serialize";
import { serverAction } from "@/types/server-action";
import { serverResponse } from "@/types/response";

export interface IACCOUNT {
  name: string;
  type: AccountType;
  balance: string | number;
  isDefault: boolean;
}

// type safeAccount = Omit<Account, "decimal"> & { decimal: number };
// type safeAccountWithCount = safeAccount & { _count: number };
// type safeAccounts = safeAccountWithCount[];

// type successResponse = {
//   info: "successful";
//   data?: safeAccount | safeAccounts;
// };

// type errorResponse = {
//   info: "error" | "unauthorized";
//   error?: unknown;
// };

// type serverResponse = errorResponse | successResponse;

export type serializableAccountResponse = Omit<Account, "balance"> & {
  balance: number;
};

export type serializableAccountResponseWithCount =
  serializableAccountResponse & {
    _count: Record<string, number>;
  };

export type serializableAccountsResponse =
  serializableAccountResponse[];

export type accountResponse =
  | serializableAccountsResponse
  | serializableAccountResponse;

export type serializableTransaction = Omit<Transaction, "amount"> & {
  amount: number;
};

export type serializableAccountResponseWithTransactionAndCount =
  serializableAccountResponseWithCount & {
    transactions: serializableTransaction[];
  };

export const createAccount: serverAction<IACCOUNT, accountResponse> = async (
  accountData
) => {
  if (!accountData) return { info: "error" };

  try {
    const decimalBalance = parseFloat(accountData.balance as string);
    if (isNaN(decimalBalance)) return { info: "error" };

    const { userId } = await auth();

    if (!userId) return { info: "unauthorized" };

    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!prismaUser) return { info: "unauthorized" };

    const isFirstAccount = (await db.account.findMany({ where: { userId } }))
      .length;

    if (!isFirstAccount || accountData.isDefault) {
      await db.account.updateMany({
        where: {
          userId: prismaUser.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAccount = await db.account.create({
      data: {
        ...accountData,
        balance: decimalBalance,
        userId: prismaUser.id,
      },
    });

    revalidatePath("/dashboard");

    return {
      info: "successful",
      data: safeSerializeAccount(newAccount),
    };
  } catch (error: unknown) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message || "Error creating acount",
    };
  }
};

export const getAccounts: serverAction<void, accountResponse> = async () => {
  try {
    const { userId } = await auth();

    if (!userId) return { info: "unauthorized" };

    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!prismaUser) return { info: "unauthorized" };

    const accounts = await db.account.findMany({
      where: { user: prismaUser },
      orderBy: { createdAt: "desc" },
    });

    return { info: "successful", data: safeSerializeAccount(accounts) };
  } catch (error) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message || "Error creating acount",
    };
  }
};

export const toggleDefault: serverAction<
  { value: boolean; accountId: string },
  accountResponse
> = async (payload) => {
  if (!payload?.accountId || ![true, false].includes(payload.value))
    return { info: "error", error: "accountId or value missing" };

  try {
    const { userId } = await auth();

    if (!userId) return { info: "unauthorized" };

    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!prismaUser) return { info: "unauthorized" };

    let updatedAccount: Account | undefined;
    await db.$transaction(async (tx: PrismaClient) => {
      // If we're setting this account to be the default
      console.log("Inside the transaction");
      if (payload.value) {
        // First, set all other accounts of this user to non-default
        await tx.account.updateMany({
          where: {
            userId: prismaUser.id,
            id: { not: payload.accountId }, // Exclude the current account
          },
          data: { isDefault: false },
        });

        // Then set the current account to default
        updatedAccount = await tx.account.update({
          where: { userId: prismaUser.id, id: payload.accountId },
          data: { isDefault: true },
        });
      } else {
        // Just update this specific account to not be default
        updatedAccount = await tx.account.update({
          where: { userId: prismaUser.id, id: payload.accountId },
          data: { isDefault: false },
        });

     
      }
    });

    revalidatePath("/dashboard");
    return {
      info: "successful",
      data: updatedAccount ? safeSerializeAccount(updatedAccount) : undefined,
    };
  } catch (error) {
    console.error(error, "Error toggling default");
    return {
      info: "error",
      error: "Error toggling default",
    };
  }
};

export const getAccountWithTransaction: serverAction<
  { id: string },
  serializableAccountResponseWithTransactionAndCount
  > = async (param) => {
    if (!param || !param.id) return { info: "error" };
    
  try {
    const { userId } = await auth();

    if (!userId) return { info: "unauthorized" };

    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!prismaUser) return { info: "unauthorized" };


    const accountWithTransactionsAndCount = await db.account.findUnique({
      where: { user: prismaUser, id: param.id },
      include: {
        _count: {
          select: {transactions: true}
        },
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!accountWithTransactionsAndCount) return { info: 'not found' }
    
    const acc = safeSerializeAccount(accountWithTransactionsAndCount) ;
    
    return {info: 'successful', data: acc}
  } catch (error) {
    console.error(error);
    return {
      info: "error",
      error: (error as any).message || "Error fetching account details",
    };
  }
};
