"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";
import { checkUser } from "@/lib/checkUser";
import { industries } from "@/data/industries";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    // If user doesn't exist yet, create them
    if (!user) {
      user = await checkUser();
    }

    if (!user) throw new Error("User not found");

    // Get current Clerk user for latest name/image
    const clerkUser = await currentUser();

    // Parse industry into industry and subIndustry
    let industry = "";
    let subIndustry = "";
    if (user.industry) {
      const parts = user.industry.split("-");
      if (parts.length >= 2) {
        industry = parts[0];
        // Get the stored subIndustry slug (e.g., "it-services")
        const subIndustrySlug = parts.slice(1).join("-");

        // Find the matching industry and subIndustry from the data
        const industryData = industries.find((ind) => ind.id === industry);
        if (industryData) {
          // Find the subIndustry that matches when converted to slug format
          const matchingSubIndustry = industryData.subIndustries.find(
            (sub) => sub.toLowerCase().replace(/ /g, "-") === subIndustrySlug,
          );
          subIndustry = matchingSubIndustry || "";
        }
      }
    }

    return {
      id: user.id,
      name: clerkUser
        ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()
        : user.name,
      email: user.email,
      imageUrl: clerkUser?.imageUrl || user.imageUrl,
      industry,
      subIndustry,
      experience: user.experience,
      bio: user.bio,
      skills: user.skills ? user.skills.join(", ") : "",
      isOnboarded: !!user.industry,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) user = await checkUser();
  if (!user) throw new Error("User not found");

  try {
    // Generate insights BEFORE opening the database transaction
    // This prevents the transaction from timing out if the AI takes > 5 seconds
    let industryInsight = await prisma.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    let insights = null;
    if (!industryInsight) {
      insights = await generateAIInsights(data.industry);
    }

    // Start a transaction to handle both operations
    const result = await prisma.$transaction(
      async (tx) => {
        // If no insights exist, use the generated ones
        if (!industryInsight && insights) {
          // Upsert prevents duplicate rows when concurrent requests hit the same industry.
          industryInsight = await tx.industryInsight.upsert({
            where: { industry: data.industry },
            update: {},
            create: {
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
            ...(data.name && { name: data.name }),
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
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

  try {
    // Query the database to find a user with the given Clerk user ID
    // findUnique() returns a single record using a unique field
    let user = await prisma.user.findUnique({
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

    // If the user doesn't exist in the DB yet, it means the layout's
    // checkUser() is still running. We call checkUser() here to ensure they are created.
    if (!user) {
      user = await checkUser();
    }

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
