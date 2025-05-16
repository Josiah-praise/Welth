import { db } from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

export const checkPersistence = async () => {
  try {
    const user = await currentUser();

    if (!user) return;
    const prismaUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!prismaUser) {
      await db.user.create({
        data: {
          clerkUserId: user.id,
          name:
            user.firstName && user.lastName
              ? user.firstName + user.lastName
              : "",
          email: user.primaryEmailAddress?.emailAddress || "",
          imageUrl: user.imageUrl,
        },
      });
    }
  } catch (error) {
    console.error(error, "shit");
  }
};
