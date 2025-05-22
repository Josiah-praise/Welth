import { db } from "@/lib/prisma";
import { serverAction } from "@/types/server-action";
import { auth } from "@clerk/nextjs/server";
import { serializableTransaction } from "./Account";

export const getDashboardData: serverAction<void, serializableTransaction[]> = async () =>{
  const { userId } = await auth();
  if (!userId) return { info: "unauthorized" };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    return { info: "unauthorized" };
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return {data: transactions.map((tx=> ({...tx, amount: tx.amount.toNumber()}))), info: "successful" };
}
