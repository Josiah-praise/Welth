import {
  serializableAccountResponse,
  serializableAccountResponseWithTransactionAndCount,
} from "@/actions/Account";
import { Account, Transaction } from "./generated/prisma";

type accountWithCount = Account & { _count: Record<string, number> };

type accountWithCountAndTransactions = accountWithCount & {
  transactions: Transaction[];
};

export function safeSerializeAccount(
  data: accountWithCountAndTransactions
): serializableAccountResponseWithTransactionAndCount;
export function safeSerializeAccount(
  data: Account
): serializableAccountResponse;
export function safeSerializeAccount(
  data: Account[]
): serializableAccountResponse[];


export function safeSerializeAccount(data: any): any {
  if (Array.isArray(data)) {
    return data.map((account) => ({
      ...account,
      balance: parseFloat(account.balance.toString()).toFixed(2),
    }));
  } else if ('_count' in data && Array.isArray(data.transactions)) {
    return { ...data, balance: parseFloat(data.balance.toString()), transactions: safeSerializeTransaction(data.transactions) };
  } else {
    return { ...data, balance: parseFloat(data.balance.toString()) };
  }
}

export const safeSerializeTransaction = (data: Transaction | Transaction[]) => {
  if (Array.isArray(data)) {
    return data.map((account) => ({
      ...account,
      amount: parseFloat(account.amount.toString()),
    }));
  } else {
    return { ...data, amount: parseFloat(data.amount.toString()) };
  }
};
