import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageTitle, Panel, StatCard } from "@/components/dashboard-shell";
import { EarningsChart } from "@/components/earnings-chart";
import { SessionRow } from "@/components/session-row";
import { getMyTrainerProfile, requireUser } from "@/lib/dal";
import { trainerConversations, trainerSessions, trainerStats } from "@/lib/mock";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Coach overview" };

export default async function TrainerOverview() {
  const user = await requireUser();
  const coach = await getMyTrainerProfile(user.id);
  const rating = (coach?.ratingX100 ?? 0) / 100;
  const today = trainerSessions.filter((s) => s.status === "upcoming").slice(0, 3);
  return (
    <>
      <PageTitle
        title={`Salam, ${user.profile.displayName.split(" ")[0]}`}
        body="2 sessions today and 4 unread messages."
        action={
          <Link href="/trainer/programs/new" className="eyebrow inline-flex h-11 items-center gap-2 rounded-sm bg-brand px-5 text-brand-foreground hover:bg-brand/85">
            <Plus className="size-4" /> New program
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Earned this month" value={formatPrice(trainerStats.monthNet)} hint="After 10% platform fee" accent />
        <StatCard label="Active clients" value={String(trainerStats.activeClients)} hint="+6 this month" />
        <StatCard label="Sessions this week" value={String(trainerStats.sessionsThisWeek)} hint="2 today" />
        <StatCard label="Rating" value={rating ? rating.toFixed(1) : "New"} hint={`${coach?.ratingCount ?? 0} reviews`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel
            title="Earnings, last 30 days"
            action={
              <Link href="/trainer/earnings" className="eyebrow flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground">
                Details <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <div className="p-5 pt-10">
              <EarningsChart />
            </div>
          </Panel>

          <Panel
            title="Next sessions"
            action={
              <Link href="/trainer/bookings" className="eyebrow flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground">
                All sessions <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <ul className="divide-y">
              {today.map((s) => (
                <SessionRow key={s.id} booking={s} view="trainer" />
              ))}
            </ul>
          </Panel>
        </div>

        <Panel
          title="Recent messages"
          action={
            <Link href="/trainer/messages" className="eyebrow flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground">
              Inbox <ArrowRight className="size-3.5" />
            </Link>
          }
          className="self-start"
        >
          <ul className="divide-y">
            {trainerConversations.map((c) => (
              <li key={c.id}>
                <Link href="/trainer/messages" className="flex items-center gap-3 p-4 hover:bg-accent/50 sm:px-5">
                  <Image src={c.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="flex justify-between gap-2 text-sm">
                      <span className="truncate font-semibold">{c.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{c.when}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{c.last}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">{c.unread}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
