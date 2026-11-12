import type { Metadata } from "next";
import { ProgramCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";
import { listPrograms } from "@/lib/queries";

export const metadata: Metadata = { title: "Programs" };

export default async function ProgramsPage() {
  const programs = await listPrograms();
  return (
    <>
      <PageHero
        eyebrow="Video programs"
        title={
          <>
            Buy once.
            <br />
            Train for life.
          </>
        }
        body="Step-by-step video programs from our coaches. Watch the first lesson of every program free."
        image="/images/run-forest.jpg"
        focus="50% 35%"
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-4 text-sm text-muted-foreground">{programs.length} programs</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </section>
    </>
  );
}
