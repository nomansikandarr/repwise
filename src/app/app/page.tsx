import { ArrowRight, Flame, Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "@/components/bits";
import { TrainerCard } from "@/components/cards";
import { PageTitle, Panel, StatCard } from "@/components/dashboard-shell";
import { SessionRow } from "@/components/session-row";
import { requireUser } from "@/lib/dal";
import { myBookings, myLibrary } from "@/lib/member";
import { listTrainers } from "@/lib/queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ClientDashboard() {
  const user = await requireUser();
  const [library, sessions, trainers] = await Promise.all([myLibrary(user.id), myBookings(user.id), listTrainers()]);

  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const lessonsDone = library.reduce((n, p) => n + p.done, 0);
  const finished = library.filter((p) => p.total > 0 && p.done === p.total).length;
  const current = library.find((p) => p.done < p.total) ?? library[0];
  const next = upcoming[0];
  const firstName = user.profile.displayName.split(" ")[0];

  return (
    <>
      <PageTitle
        title={`Salam, ${firstName}`}
        body={next ? `Your next session is ${/^(Today|Tomorrow)/.test(next.day) ? next.day.split(",")[0].toLowerCase() : "on " + next.day} at ${next.time}.` : "Here's your training at a glance."}
      />

      {current ? (
        <Link
          href={`/app/programs/${current.slug}/lessons/${current.next}`}
          className="group relative mb-6 block overflow-hidden rounded-lg bg-black text-white"
        >
          <Image src={current.cover} alt="" fill sizes="100vw" className="object-cover opacity-55 transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: current.focus }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 sm:p-8">
            <div>
              <p className="eyebrow mb-3 text-brand">{current.done === current.total ? "Program complete" : "Continue training"}</p>
              <h2 className="display text-3xl sm:text-4xl">{current.title}</h2>
              <p className="mt-2 text-white/80">
                Lesson {current.next}: {current.nextTitle}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full bg-brand" style={{ width: `${(current.done / Math.max(current.total, 1)) * 100}%` }} />
                </div>
                <span className="text-xs text-white/70">
                  {current.done}/{current.total} lessons
                </span>
              </div>
            </div>
            <span className="eyebrow inline-flex h-11 items-center gap-3 rounded-sm bg-brand px-5 text-brand-foreground">
              <Play className="size-4 fill-current" /> {current.done ? "Resume" : "Start"}
            </span>
          </div>
        </Link>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed p-6 sm:p-8">
          <div>
            <p className="display text-2xl">Start your first program</p>
            <p className="mt-1 text-sm text-muted-foreground">Every program has a free first lesson. Try one before you buy.</p>
          </div>
          <CtaLink href="/programs">Browse programs</CtaLink>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lessons done" value={String(lessonsDone)} hint={`Across ${library.length} program${library.length === 1 ? "" : "s"}`} accent />
        <StatCard label="Programs" value={String(library.length)} hint={`${finished} completed`} />
        <StatCard label="Upcoming sessions" value={String(upcoming.length)} hint={next ? `Next: ${next.day}, ${next.time}` : "None booked"} />
        <StatCard label="Sessions done" value={String(completedSessions)} hint="Live 1:1 sessions" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Upcoming sessions"
          action={
            <Link href="/app/bookings" className="eyebrow flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground">
              All bookings <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {upcoming.length ? (
            <ul className="divide-y">
              {upcoming.slice(0, 4).map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No sessions booked. <Link href="/trainers" className="text-lime font-medium hover:underline">Find a coach</Link> to book a live 1:1.
            </p>
          )}
        </Panel>

        <Panel
          title="My programs"
          action={
            <Link href="/app/programs" className="eyebrow flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground">
              Library <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {library.length ? (
            <ul className="divide-y">
              {library.map((p) => {
                const pct = Math.round((p.done / Math.max(p.total, 1)) * 100);
                return (
                  <li key={p.slug}>
                    <Link href={`/app/programs/${p.slug}/lessons/${p.next}`} className="flex items-center gap-4 p-4 hover:bg-accent/50 sm:px-5">
                      <Image src={p.cover} alt="" width={64} height={48} className="h-12 w-16 rounded-sm object-cover" style={{ objectPosition: p.focus }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">by {p.trainerName}</p>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{pct}%</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">Programs you buy appear here.</p>
          )}
        </Panel>
      </div>

      <div className="mt-10 mb-5 flex items-end justify-between">
        <h2 className="display flex items-center gap-2 text-2xl">
          <Flame className="text-lime size-6" /> Coaches you may like
        </h2>
        <Link href="/trainers" className="eyebrow text-[11px] text-muted-foreground hover:text-foreground">
          See all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {trainers.filter((t) => ["bilal-ahmed", "usman-tariq", "rohan-mehta", "imran-butt"].includes(t.slug)).map((t) => (
          <TrainerCard key={t.slug} trainer={t} />
        ))}
      </div>
    </>
  );
}
