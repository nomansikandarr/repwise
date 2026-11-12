import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Get started" };

export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh flex-col p-6 md:p-10">
      <Logo />
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-xl">
          <Suspense fallback={<Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />}>
            <Onboarding />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function Onboarding() {
  const user = await requireUser();
  // Members who already finished can still apply to coach from "Become a coach".
  if (user.profile.onboarded && user.profile.role !== "client") redirect("/dashboard");
  return <OnboardingFlow name={user.profile.displayName} startAsCoach={user.profile.onboarded} />;
}
