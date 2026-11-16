import { Pencil, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageTitle, StatusPill } from "@/components/dashboard-shell";
import { netByProgram } from "@/lib/coach";
import { getMyTrainerProfile, requireUser } from "@/lib/dal";
import { listProgramsByTrainer } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Programs" };

export default async function TrainerProgramsPage() {
  const user = await requireUser();
  const coach = await getMyTrainerProfile(user.id);
  const [mine, net] = await Promise.all([coach ? listProgramsByTrainer(coach.slug) : [], netByProgram(user.id)]);
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
                  <dd className="mt-1 font-semibold">{formatPrice(net.get(p.id) ?? 0)}</dd>
                </div>
              </dl>
              <Link href={`/trainer/programs/${p.id}`} className="eyebrow mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border text-[11px] hover:border-brand">
                <Pencil className="size-3.5" /> Edit program
              </Link>
            </div>
          </article>
        ))}

        <Link
          href="/trainer/programs/new"
          className="grid min-h-64 place-items-center rounded-lg border border-dashed bg-card p-5 text-center text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
        >
          <span>
            <Plus className="mx-auto mb-2 size-7" strokeWidth={1.5} />
            <span className="display block text-lg">New program</span>
            <span className="text-sm">Program editing goes live with video uploads (phase 4)</span>
          </span>
        </Link>
      </div>
    </>
  );
}
