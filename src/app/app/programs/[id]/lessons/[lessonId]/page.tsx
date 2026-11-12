import { CheckCircle2, ChevronLeft, ChevronRight, Lock, Maximize, MessageSquare, Pause, Play, Settings, Volume2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram, getTrainer, myPrograms, programs } from "@/lib/mock";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string; lessonId: string }> };

export function generateStaticParams() {
  return programs.flatMap((p) => p.lessons.map((l) => ({ id: p.id, lessonId: l.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lessonId } = await params;
  return { title: getProgram(id)?.lessons.find((l) => l.id === lessonId)?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const { id, lessonId } = await params;
  const program = getProgram(id);
  const index = program?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!program || index < 0) notFound();

  const lesson = program.lessons[index];
  const trainer = getTrainer(program.trainer)!;
  const owned = myPrograms.find((mp) => mp.id === program.id);
  const doneCount = owned?.done ?? 0;
  const locked = !owned && !lesson.preview;
  const prev = program.lessons[index - 1];
  const next = program.lessons[index + 1];
  const base = `/app/programs/${program.id}/lessons`;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        <Link href="/app/programs" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> {program.title}
        </Link>

        {/* Player (static mock: real video comes from ImageKit later) */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-black text-white">
          <Image src={program.cover} alt="" fill priority sizes="(max-width: 1280px) 100vw, 70vw" className={cn("object-cover", locked ? "opacity-25 blur-sm" : "opacity-80")} style={{ objectPosition: program.focus }} />
          {locked ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <Lock className="mx-auto size-10" strokeWidth={1.5} />
                <p className="display mt-4 text-2xl">This lesson is locked</p>
                <p className="mt-2 text-sm text-white/70">Buy {program.title} to unlock all {program.lessons.length} lessons.</p>
                <Link href={`/programs/${program.id}`} className="eyebrow mt-6 inline-flex h-11 items-center rounded-sm bg-brand px-6 text-brand-foreground">
                  View program
                </Link>
              </div>
            </div>
          ) : (
            <>
              <button aria-label="Play" className="absolute inset-0 grid place-items-center">
                <span className="grid size-20 place-items-center rounded-full bg-brand text-brand-foreground shadow-2xl transition-transform hover:scale-105">
                  <Play className="ml-1 size-8 fill-current" />
                </span>
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-10">
                <div className="h-1 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full w-[38%] bg-brand" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <Pause className="size-4" />
                  <Volume2 className="size-4" />
                  <span className="tabular-nums">
                    {Math.floor(lesson.minutes * 0.38)}:12 / {lesson.minutes}:00
                  </span>
                  <span className="ml-auto rounded-sm border border-white/40 px-1.5 py-0.5 text-[10px]">720p</span>
                  <Settings className="size-4" />
                  <Maximize className="size-4" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-lime mb-2 text-[11px]">
              Lesson {index + 1} of {program.lessons.length}
              {lesson.preview && " · Free preview"}
            </p>
            <h1 className="display text-2xl sm:text-3xl">{lesson.title}</h1>
          </div>
          {!locked && (
            <button className="eyebrow inline-flex h-11 items-center gap-2 rounded-sm bg-brand px-5 text-brand-foreground hover:bg-brand/85">
              <CheckCircle2 className="size-4" /> Mark complete
            </button>
          )}
        </div>

        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          In this lesson {trainer.name.split(" ")[0]} walks you through {lesson.title.toLowerCase()}. Watch it once all the way
          through, then follow along. Keep a notebook nearby to log your sets and how each one felt.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
          <Image src={trainer.photo} alt="" width={48} height={48} className="size-12 rounded-full object-cover" style={{ objectPosition: trainer.focus }} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{trainer.name}</p>
            <p className="truncate text-sm text-muted-foreground">{trainer.headline}</p>
          </div>
          <Link href="/app/messages" className="eyebrow inline-flex h-10 items-center gap-2 rounded-sm border px-4 text-[11px] hover:border-brand">
            <MessageSquare className="size-4" /> Ask coach
          </Link>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          {prev ? (
            <Link href={`${base}/${prev.id}`} className="eyebrow inline-flex h-10 items-center gap-2 rounded-sm border px-4 text-[11px] hover:border-foreground/40">
              <ChevronLeft className="size-4" /> Previous
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`${base}/${next.id}`} className="eyebrow inline-flex h-10 items-center gap-2 rounded-sm border px-4 text-[11px] hover:border-foreground/40">
              Next lesson <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Playlist */}
      <aside className="rounded-lg border bg-card xl:sticky xl:top-20 xl:self-start">
        <div className="border-b p-4">
          <p className="eyebrow text-xs">Course content</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brand" style={{ width: `${(doneCount / program.lessons.length) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {doneCount} of {program.lessons.length} completed
          </p>
        </div>
        <ol className="max-h-[60vh] divide-y overflow-y-auto">
          {program.lessons.map((l, i) => {
            const isDone = i < doneCount;
            const isLocked = !owned && !l.preview;
            return (
              <li key={l.id}>
                <Link
                  href={`${base}/${l.id}`}
                  className={cn("flex items-center gap-3 p-4 text-sm transition-colors hover:bg-accent/50", l.id === lesson.id && "bg-brand/10")}
                >
                  {isDone ? (
                    <CheckCircle2 className="text-lime size-5 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="size-5 shrink-0 p-0.5 text-muted-foreground" />
                  ) : (
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border text-[10px]">{i + 1}</span>
                  )}
                  <span className={cn("min-w-0 flex-1 truncate", l.id === lesson.id && "font-semibold")}>{l.title}</span>
                  <span className="text-xs text-muted-foreground">{l.minutes}m</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
