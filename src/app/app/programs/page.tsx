import { CheckCircle2, Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "@/components/bits";
import { PageTitle } from "@/components/dashboard-shell";
import { getProgram, getTrainer, myPrograms } from "@/lib/mock";

export const metadata: Metadata = { title: "My programs" };

export default function MyProgramsPage() {
  return (
    <>
      <PageTitle
        title="My programs"
        body="Everything you own, with your progress."
        action={
          <CtaLink href="/programs" variant="line">
            Browse more
          </CtaLink>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {myPrograms.map((mp) => {
          const p = getProgram(mp.id)!;
          const pct = Math.round((mp.done / p.lessons.length) * 100);
          const done = pct === 100;
          return (
            <Link
              key={p.id}
              href={`/app/programs/${p.id}/lessons/${mp.next}`}
              className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-brand/50"
            >
              <div className="relative aspect-video">
                <Image src={p.cover} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" style={{ objectPosition: p.focus }} />
                <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid size-14 place-items-center rounded-full bg-brand text-brand-foreground">
                    <Play className="size-6 fill-current" />
                  </span>
                </span>
              </div>
              <div className="p-5">
                <h2 className="display text-lg">{p.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">by {getTrainer(p.trainer)?.name}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {mp.done} of {p.lessons.length} lessons
                  </span>
                  {done ? (
                    <span className="text-lime flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="size-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground">{pct}%</span>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
