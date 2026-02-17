import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const checkUser = async () => {
  const user = await currentUser();

  // If there's no authenticated user, return null
  if (!user) {
    return null;
  }

  try {
    // Check if the user already exists in the database
    const loggedInUser = await prisma.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // If the user exists, return it. Otherwise, create a new user record.
    if (loggedInUser) {
      return loggedInUser;
    }

    // Create a new user record in the database
    const name = `${user.firstName} ${user.lastName}`;
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        name: name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error checking/creating user:", error);
    return null;
  }
};
