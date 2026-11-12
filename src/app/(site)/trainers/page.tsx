import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { TrainerDirectory } from "@/components/trainer-directory";
import { listTrainers } from "@/lib/queries";

export const metadata: Metadata = { title: "Find a trainer" };

export default async function TrainersPage() {
  return (
    <>
      <PageHero
        eyebrow="250+ verified coaches"
        title={
          <>
            Find the coach
            <br />
            who gets you.
          </>
        }
        body="Strength, cricket, running, home workouts and women-only coaching. Filter by goal, city and budget."
        image="/images/hero.jpg"
        focus="50% 22%"
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <TrainerDirectory trainers={await listTrainers()} />
      </section>
    </>
  );
}
