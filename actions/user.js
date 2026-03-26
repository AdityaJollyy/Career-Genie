"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Start a transaction to handle both operations
    const result = await prisma.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If no insights exist, generate them
        if (!user.industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await prisma.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000. Increased timeout for potentially long AI generation
      },
    );

    return { success: true, ...result };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error(
      "Failed to update profile" + (error.message ? `: ${error.message}` : ""),
    );
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Query the database to find a user with the given Clerk user ID
    // findUnique() returns a single record using a unique field
    const user = await prisma.user.findUnique({
      where: {
        // Searching the user table using the Clerk authentication ID
        clerkUserId: userId,
      },
      select: {
        // Only fetch the 'industry' field instead of the entire user object
        // This improves performance by returning only required data
        industry: true,
      },
    });

    // 1. Determine if the user has completed onboarding
    // 2. ? Access industry only if user exists.
    // 3. user?.industry → checks if industry exists
    // 4. !! converts the value to a boolean (true/false)
    // 5. true  → user has selected an industry → onboarding completed
    // 6. false → industry not set → onboarding not completed
    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    // Log the detailed error on the server for debugging
    console.error("Error checking onboarding status:", error);

    // Throw a generic error so internal details are not exposed to the client
    throw new Error("Failed to check onboarding status");
  }
}
