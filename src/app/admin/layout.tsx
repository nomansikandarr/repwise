import { Suspense } from "react";
import { DashboardShell, PageSkeleton, type NavItem } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/dal";

const NAV: NavItem[] = [{ href: "/admin/applications", label: "Applications", icon: "shield" }];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} roleLabel="Admin">
      <Suspense fallback={<PageSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </DashboardShell>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireRole("admin");
  return children;
}
