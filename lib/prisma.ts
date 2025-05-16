import { PrismaClient } from "./generated/prisma";

export const db =
  (globalThis as unknown as { prisma: undefined | PrismaClient }).prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as { prisma: undefined | PrismaClient }).prisma = db;
}
 