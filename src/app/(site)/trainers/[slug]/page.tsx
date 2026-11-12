import { BadgeCheck, Languages, MapPin, MessageSquare, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rating, SectionHeading, Stars, Tag } from "@/components/bits";
import { BookingPanel } from "@/components/booking-panel";
import { ProgramCard } from "@/components/cards";
import { getTrainerBySlug, listProgramsByTrainer, listReviewsForTrainer, listTrainers } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listTrainers()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trainer = await getTrainerBySlug((await params).slug);
  return { title: trainer ? `${trainer.name}, ${trainer.headline}` : "Trainer" };
}

export default async function TrainerPage({ params }: Props) {
  const trainer = await getTrainerBySlug((await params).slug);
  if (!trainer) notFound();
  const [trainerPrograms, reviews] = await Promise.all([listProgramsByTrainer(trainer.slug), listReviewsForTrainer(trainer.slug)]);

  return (
    <>
      {/* Header */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-1/2">
          <Image src={trainer.photo} alt={trainer.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" style={{ objectPosition: trainer.focus }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20 lg:via-black/30 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="eyebrow mb-4 flex items-center gap-2 text-brand">
            <BadgeCheck className="size-4" /> Verified coach
          </p>
          <h1 className="display max-w-xl text-5xl sm:text-7xl">{trainer.name}</h1>
          <p className="mt-4 max-w-md text-lg text-white/80">{trainer.headline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <Rating value={trainer.rating} count={trainer.reviews} className="text-white" />
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {trainer.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {trainer.clients}+ clients
            </span>
            <span className="flex items-center gap-1.5">
              <Languages className="size-4" /> {trainer.languages.join(", ")}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className="eyebrow inline-flex h-11 items-center rounded-sm bg-brand px-6 text-brand-foreground hover:bg-brand/85">
              Book a session
            </a>
            <Link href="/app/messages" className="eyebrow inline-flex h-11 items-center gap-2 rounded-sm border border-white/40 px-6 hover:border-white">
              <MessageSquare className="size-4" /> Message
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-14">
          {/* About */}
          <section>
            <h2 className="display mb-4 text-2xl">About</h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{trainer.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trainer.specialties.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
            <dl className="mt-8 grid max-w-2xl grid-cols-3 divide-x rounded-lg border">
              {[
                [`${trainer.years} yrs`, "Experience"],
                [`${trainer.clients}+`, "Clients coached"],
                [trainer.rating.toFixed(1), "Rating"],
              ].map(([v, l]) => (
                <div key={l} className="p-4 text-center">
                  <dd className="display text-xl sm:text-2xl">{v}</dd>
                  <dt className="mt-1 text-xs text-muted-foreground">{l}</dt>
                </div>
              ))}
            </dl>
          </section>

          {/* Programs */}
          <section>
            <SectionHeading title={`Programs by ${trainer.name.split(" ")[0]}`} className="mb-5" />
            {trainerPrograms.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {trainerPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No programs yet. Book a 1:1 session to start training with {trainer.name.split(" ")[0]}.
              </p>
            )}
          </section>

          {/* Reviews */}
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="display text-2xl">Reviews</h2>
              {trainer.reviews > 0 && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stars value={trainer.rating} /> {trainer.rating.toFixed(1)} from {trainer.reviews} verified clients
                </p>
              )}
            </div>
            {reviews.length === 0 && (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No reviews yet. Clients can review {trainer.name.split(" ")[0]} after their first session or program.
              </p>
            )}
            <ul className="grid gap-4 sm:grid-cols-2">
              {reviews.slice(0, 4).map((r) => (
                <li key={r.name} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Image src={r.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                    <div className="text-sm">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-muted-foreground">
                        {r.city} · {r.date}
                      </p>
                    </div>
                    <Stars value={r.rating} className="ml-auto" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Booking */}
        <aside id="book" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <BookingPanel trainer={trainer} />
        </aside>
      </div>
    </>
  );
}
