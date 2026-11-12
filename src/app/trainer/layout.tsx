import { Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardShell, PageSkeleton, type NavItem } from "@/components/dashboard-shell";
import { getMyTrainerProfile, requireRole } from "@/lib/dal";

const NAV: NavItem[] = [
  { href: "/trainer", label: "Overview", icon: "home", exact: true },
  { href: "/trainer/programs", label: "Programs", icon: "programs" },
  { href: "/trainer/bookings", label: "Sessions", icon: "bookings" },
  { href: "/trainer/availability", label: "Availability", icon: "clock" },
  { href: "/trainer/clients", label: "Clients", icon: "users" },
  { href: "/trainer/messages", label: "Messages", icon: "messages", badge: 4 },
  { href: "/trainer/earnings", label: "Earnings", icon: "money" },
  { href: "/trainer/profile", label: "Profile", icon: "profile" },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} roleLabel="Coach">
      <Suspense fallback={<PageSkeleton />}>
        <CoachGate>{children}</CoachGate>
      </Suspense>
    </DashboardShell>
  );
}

/** Coaches only, and only once an admin has approved their application. */
async function CoachGate({ children }: { children: React.ReactNode }) {
  const user = await requireRole("trainer");
  const coach = await getMyTrainerProfile(user.id);

  if (coach?.status === "approved") return children;

  const rejected = coach?.status === "rejected";
  const Icon = rejected ? XCircle : Clock;
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className={`mx-auto grid size-16 place-items-center rounded-full ${rejected ? "bg-destructive/15 text-destructive" : "bg-brand text-brand-foreground"}`}>
        <Icon className="size-7" />
      </span>
      <h1 className="display mt-6 text-3xl">{rejected ? "Application not approved" : "Application under review"}</h1>
      <p className="mt-3 text-muted-foreground">
        {rejected
          ? coach?.applicationNote ?? "Our team could not approve your application this time."
          : "Shukriya! Our team reviews every coach by hand, usually within 2 working days. Your dashboard unlocks as soon as you are approved."}
      </p>
      {coach && (
        <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3 rounded-lg border p-4 text-left text-sm">
          <dt className="text-muted-foreground">Headline</dt>
          <dd className="font-medium">{coach.headline}</dd>
          <dt className="text-muted-foreground">Submitted</dt>
          <dd className="font-medium">{coach.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd>
        </dl>
      )}
      <Link href="/trainers" className="eyebrow mt-8 inline-flex h-11 items-center rounded-sm border px-5 text-[11px] hover:border-brand">
        Browse coaches meanwhile
      </Link>
    </div>
  );
}
