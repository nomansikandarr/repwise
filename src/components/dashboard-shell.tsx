import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardNav, type NavItem } from "@/components/dashboard-nav";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/dal";

export type { NavItem };

/** Shared layout for the client, trainer and admin areas. */
export function DashboardShell({
  nav,
  roleLabel,
  notificationsHref,
  children,
}: {
  nav: NavItem[];
  roleLabel: string;
  notificationsHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-1">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar p-5 lg:flex">
        <Logo />
        <p className="eyebrow mt-8 mb-3 text-[10px] text-muted-foreground">{roleLabel}</p>
        <Suspense>
          <DashboardNav items={nav} orientation="vertical" />
        </Suspense>
        <Link href="/" className="mt-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to site
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Logo className="lg:hidden" />
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              {notificationsHref && (
                <Link href={notificationsHref} aria-label="Notifications" className="relative grid size-9 place-items-center rounded-md hover:bg-accent">
                  <Bell className="size-4" />
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-brand" />
                </Link>
              )}
              <div className="ml-2">
                <Suspense fallback={<Skeleton className="h-8 w-28 rounded-full" />}>
                  <HeaderUser />
                </Suspense>
              </div>
            </div>
          </div>
          <div className="border-t lg:hidden">
            <Suspense>
              <DashboardNav items={nav} orientation="horizontal" />
            </Suspense>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

async function HeaderUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <UserMenu
      showName
      name={user.profile.displayName}
      email={user.email}
      image={user.profile.avatarUrl ?? user.image}
      role={user.profile.role}
    />
  );
}

export { PageSkeleton, PageTitle, Panel, StatCard, StatusPill } from "@/components/dashboard-ui";
