import { industries } from "@/data/industries";
import { getCurrentUser } from "@/actions/user";
import { redirect } from "next/navigation";
import SettingsForm from "./_components/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  // If user hasn't completed onboarding, redirect to onboarding
  if (!user.isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <main>
      <SettingsForm industries={industries} initialData={user} />
    </main>
  );
}
