import { industries } from "@/data/industries";
import OnboardingForm from "./_components/OnboardingForm";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  // Check if user is already onboarded, if yes, redirect to dashboard (api call so server component)
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    // using OnboardingForm as it will be client component and cannot make this page a client component due to the use of server actions in checking user onboarding status
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
