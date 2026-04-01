import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const checkUser = async () => {
  const user = await currentUser();

  // If there's no authenticated user, return null
  if (!user) {
    return null;
  }

  try {
    // Use upsert to avoid race condition between findUnique + create
    const name = `${user.firstName} ${user.lastName}`;

    const loggedInUser = await prisma.user.upsert({
      where: {
        clerkUserId: user.id,
      },
      update: {}, // No update needed if user already exists
      create: {
        clerkUserId: user.id,
        name: name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return loggedInUser;
  } catch (error) {
    console.error("Error checking/creating user:", error);
    return null;
  }
};
