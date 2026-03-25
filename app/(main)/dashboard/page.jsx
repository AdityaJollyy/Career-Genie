import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function IndustryInsightPage() {
  // Check if user is onboarded, if not, redirect to onboarding page
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return <div>IndustryInsightPage</div>;
}
