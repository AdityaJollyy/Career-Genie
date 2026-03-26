import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import DashboardView from "./_components/DashboardView";
import { getIndustryInsights } from "@/actions/dashboard";

export default async function IndustryInsightPage() {
  // Check if user is onboarded, if not, redirect to onboarding page
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
