import { ArrowRight, Flame, Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrainerCard } from "@/components/cards";
import { PageTitle, Panel, StatCard } from "@/components/dashboard-shell";
import { SessionRow } from "@/components/session-row";
import { requireUser } from "@/lib/dal";
import { bookings, getProgram, getTrainer, myPrograms } from "@/lib/mock";
import { listTrainers } from "@/lib/queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ClientDashboard() {
  const [user, trainers] = await Promise.all([requireUser(), listTrainers()]);
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const current = myPrograms[0];
  const program = getProgram(current.id)!;
  const nextLesson = program.lessons.find((l) => l.id === current.next)!;

  return (
    <>
      <PageTitle title={`Salam, ${user.profile.displayName.split(" ")[0]}`} body="You have a session tonight. Here is your week." />

      {/* Continue watching */}
      <Link
        href={`/app/programs/${program.id}/lessons/${nextLesson.id}`}
        className="group relative mb-6 block overflow-hidden rounded-lg bg-black text-white"
      >
        <Image src={program.cover} alt="" fill sizes="100vw" className="object-cover opacity-55 transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: program.focus }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 sm:p-8">
          <div>
            <p className="eyebrow mb-3 text-brand">Continue training</p>
            <h2 className="display text-3xl sm:text-4xl">{program.title}</h2>
            <p className="mt-2 text-white/80">
              Lesson {current.done + 1}: {nextLesson.title}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-brand" style={{ width: `${(current.done / program.lessons.length) * 100}%` }} />
              </div>
              <span className="text-xs text-white/70">
                {current.done}/{program.lessons.length} lessons
              </span>
            </div>
          </div>
          <span className="eyebrow inline-flex h-11 items-center gap-3 rounded-sm bg-brand px-5 text-brand-foreground">
            <Play className="size-4 fill-current" /> Resume
          </span>
        </div>
      </Link>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Day streak" value="12" hint="Best: 19 days" accent />
        <StatCard label="Lessons done" value="14" hint="3 this week" />
        <StatCard label="Live sessions" value="6" hint="Next: today 7:30 PM" />
        <StatCard label="Programs" value={String(myPrograms.length)} hint="1 completed" />
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
          <ul className="divide-y">
            {upcoming.map((b) => (
              <SessionRow key={b.id} booking={b} view="client" />
            ))}
          </ul>
        </Panel>

        <Panel
          title="My programs"
          action={
            <Link href="/app/programs" className="eyebrow flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground">
              Library <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <ul className="divide-y">
            {myPrograms.map((mp) => {
              const p = getProgram(mp.id)!;
              const pct = Math.round((mp.done / p.lessons.length) * 100);
              return (
                <li key={mp.id}>
                  <Link href={`/app/programs/${p.id}/lessons/${mp.next}`} className="flex items-center gap-4 p-4 hover:bg-accent/50 sm:px-5">
                    <Image src={p.cover} alt="" width={64} height={48} className="h-12 w-16 rounded-sm object-cover" style={{ objectPosition: p.focus }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">by {getTrainer(p.trainer)?.name}</p>
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
