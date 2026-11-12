import { Suspense } from "react";
import { DashboardShell, PageSkeleton, type NavItem } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/dal";

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: "home", exact: true },
  { href: "/app/programs", label: "My programs", icon: "programs" },
  { href: "/app/bookings", label: "Bookings", icon: "bookings" },
  { href: "/app/messages", label: "Messages", icon: "messages", badge: 2 },
  { href: "/app/notifications", label: "Notifications", icon: "bell" },
  { href: "/trainers", label: "Find a trainer", icon: "search" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} roleLabel="Member" notificationsHref="/app/notifications">
      <Suspense fallback={<PageSkeleton />}>
        <MemberGate>{children}</MemberGate>
      </Suspense>
    </DashboardShell>
  );
}

/** Members only. Coaches and admins are sent to their own dashboards. */
async function MemberGate({ children }: { children: React.ReactNode }) {
  await requireRole("client");
  return children;
}
