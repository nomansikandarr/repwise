import { Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CtaLink } from "@/components/bits";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/dal";

const NAV = [
  { href: "/trainers", label: "Trainers" },
  { href: "/programs", label: "Programs" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/onboarding", label: "Become a coach", accent: true },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="mx-auto hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`eyebrow transition-colors hover:text-foreground ${item.accent ? "text-lime" : "text-foreground/80"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />
          {/* The session read streams in; the rest of the header is in the static shell. */}
          <Suspense fallback={<Skeleton className="h-9 w-24 rounded-sm" />}>
            <HeaderAuth />
          </Suspense>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo />
              <nav className="mt-8 flex flex-col">
                {[...NAV, { href: "/dashboard", label: "My dashboard" }].map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="display border-b py-4 text-lg hover:text-lime">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

async function HeaderAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <>
        <Link href="/auth/sign-in" className="eyebrow hidden px-3 text-foreground/80 hover:text-foreground sm:block">
          Sign in
        </Link>
        <CtaLink href="/auth/sign-up" className="h-9 gap-2 px-4">
          Join free
        </CtaLink>
      </>
    );
  }
  return (
    <UserMenu
      name={user.profile.displayName}
      email={user.email}
      image={user.profile.avatarUrl ?? user.image}
      role={user.profile.role}
    />
  );
}
