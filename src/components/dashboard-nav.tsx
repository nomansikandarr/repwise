"use client";

import {
  Banknote,
  Bell,
  CalendarDays,
  Clock,
  LayoutDashboard,
  MessageSquare,
  PlaySquare,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ICONS = {
  home: LayoutDashboard,
  programs: PlaySquare,
  bookings: CalendarDays,
  messages: MessageSquare,
  bell: Bell,
  search: Search,
  clock: Clock,
  users: Users,
  money: Banknote,
  profile: UserRound,
  shield: ShieldCheck,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number; exact?: boolean };

export function DashboardNav({ items, orientation }: { items: NavItem[]; orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <nav className={cn(orientation === "vertical" ? "flex flex-col gap-1" : "no-scrollbar flex gap-1 overflow-x-auto px-3 py-2")}>
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-brand font-semibold text-brand-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
            {item.badge ? (
              <span className={cn("ml-auto rounded-full px-1.5 text-[10px] font-bold", active ? "bg-black/20" : "bg-brand text-brand-foreground")}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
