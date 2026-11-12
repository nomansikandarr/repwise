import { Pencil, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageTitle, StatusPill } from "@/components/dashboard-shell";
import { programsBy, trainerMe } from "@/lib/mock";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Programs" };

export default function TrainerProgramsPage() {
  const mine = programsBy(trainerMe.slug);
  return (
    <>
      <PageTitle
        title="Programs"
        body="Create video programs and track how they sell."
        action={
          <Link href="/trainer/programs/new" className="eyebrow inline-flex h-11 items-center gap-2 rounded-sm bg-brand px-5 text-brand-foreground hover:bg-brand/85">
            <Plus className="size-4" /> New program
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mine.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-lg border bg-card">
            <div className="relative aspect-video">
              <Image src={p.cover} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" style={{ objectPosition: p.focus }} />
              <span className="absolute top-3 left-3">
                <StatusPill status="Published" />
              </span>
            </div>
            <div className="p-5">
              <h2 className="display text-lg">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.lessons.length} lessons · {formatPrice(p.price)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Students</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                    <Users className="size-3.5" /> {p.students.toLocaleString("en-US")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Earned (net)</dt>
                  <dd className="mt-1 font-semibold">{formatPrice(Math.round(p.students * p.price * 0.9))}</dd>
                </div>
              </dl>
              <Link href={`/trainer/programs/${p.id}`} className="eyebrow mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border text-[11px] hover:border-brand">
                <Pencil className="size-3.5" /> Edit program
              </Link>
            </div>
          </article>
        ))}

        <article className="overflow-hidden rounded-lg border border-dashed bg-card">
          <div className="grid aspect-video place-items-center bg-muted/40 text-muted-foreground">No cover yet</div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="display text-lg">Shaadi Season Shred</h2>
              <StatusPill status="Draft" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">3 lessons · price not set</p>
            <Link href="/trainer/programs/new" className="eyebrow mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border text-[11px] hover:border-brand">
              <Pencil className="size-3.5" /> Continue editing
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
