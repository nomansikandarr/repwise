import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Train",
    links: [
      ["Find a trainer", "/trainers"],
      ["Programs", "/programs"],
      ["1:1 sessions", "/trainers"],
      ["Women-only coaches", "/trainers"],
    ],
  },
  {
    title: "Coaches",
    links: [
      ["Become a coach", "/onboarding"],
      ["Coach dashboard", "/trainer"],
      ["Earnings", "/trainer/earnings"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Our story", "/"],
      ["Help centre", "/"],
      ["Contact", "/"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Newsletter bar */}
        <div className="-mt-px grid gap-5 border-b py-8 md:grid-cols-2 md:items-center">
          <div className="flex items-center gap-4">
            <Mail className="size-9 shrink-0" strokeWidth={1.25} />
            <div>
              <p className="display text-lg">Be the first to know</p>
              <p className="text-sm text-muted-foreground">New coaches, Ramadan plans and training tips.</p>
            </div>
          </div>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email"
              className="h-11 min-w-0 flex-1 rounded-sm border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
            />
            <button
              type="button"
              aria-label="Subscribe"
              className="grid size-11 shrink-0 place-items-center rounded-sm bg-brand text-brand-foreground hover:bg-brand/85"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Coaching that fits desi life. Made in Lahore for Pakistan and South Asia.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 Repwise. Demo platform, payments are simulated.</p>
          <p className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms &amp; Conditions</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
