import { BarChart3, Check, Clock, Infinity as InfinityIcon, Lock, PlayCircle, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rating, Tag } from "@/components/bits";
import { PayDialog } from "@/components/pay-dialog";
import { getProgramBySlug, getTrainerBySlug, listPrograms } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await listPrograms()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await getProgramBySlug((await params).id))?.title ?? "Program" };
}

export default async function ProgramPage({ params }: Props) {
  const program = await getProgramBySlug((await params).id);
  if (!program) notFound();
  const trainer = await getTrainerBySlug(program.trainer);
  if (!trainer) notFound();
  const totalMinutes = program.lessons.reduce((sum, l) => sum + l.minutes, 0);
  const first = program.lessons[0];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-black text-white">
        <Image src={program.cover} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-65" style={{ objectPosition: program.focus }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/30" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-5 flex flex-wrap gap-2">
            {[program.level, ...program.tags].map((t) => (
              <Tag key={t} className="border-white/30 text-white/80">
                {t}
              </Tag>
            ))}
          </div>
          <h1 className="display max-w-3xl text-5xl sm:text-7xl">{program.title}</h1>
          <p className="mt-4 max-w-lg text-lg text-white/80">{program.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <Rating value={program.rating} className="text-white" />
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {program.students.toLocaleString("en-US")} enrolled
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {program.weeks} weeks
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="size-4" /> {program.level}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="display mb-4 text-2xl">What you get</h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{program.description}</p>
            <ul className="mt-6 grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
              {[
                `${program.lessons.length} video lessons (${totalMinutes} min)`,
                "Lifetime access, watch any time",
                "Works on mobile data and Wi-Fi",
                "Message your coach with questions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="text-lime mt-0.5 size-4 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="display text-2xl">Lessons</h2>
              <p className="text-sm text-muted-foreground">
                {program.lessons.length} lessons · {totalMinutes} min
              </p>
            </div>
            <ol className="divide-y rounded-lg border">
              {program.lessons.map((lesson, i) => (
                <li key={lesson.id} className="flex items-center gap-4 p-4">
                  <span className="display w-7 text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.minutes} min</p>
                  </div>
                  {lesson.preview ? (
                    <Link
                      href={`/app/programs/${program.id}/lessons/${lesson.id}`}
                      className="eyebrow text-lime flex items-center gap-1.5 text-[11px] hover:underline"
                    >
                      <PlayCircle className="size-4" /> Free preview
                    </Link>
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="display mb-4 text-2xl">Your coach</h2>
            <Link href={`/trainers/${trainer.slug}`} className="group flex items-center gap-5 rounded-lg border bg-card p-5 transition-colors hover:border-brand/50">
              <Image src={trainer.photo} alt="" width={88} height={88} className="size-22 rounded-md object-cover" style={{ objectPosition: trainer.focus }} />
              <div className="min-w-0">
                <p className="display text-lg">{trainer.name}</p>
                <p className="text-sm text-muted-foreground">{trainer.headline}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                  <Rating value={trainer.rating} count={trainer.reviews} className="text-foreground" />
                  <span>{trainer.city}</span>
                </p>
              </div>
            </Link>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-lg border bg-card">
            <Link href={`/app/programs/${program.id}/lessons/${first.id}`} className="group relative block aspect-video">
              <Image src={program.cover} alt="" fill sizes="380px" className="object-cover" style={{ objectPosition: program.focus }} />
              <span className="absolute inset-0 grid place-items-center bg-black/40 text-white transition-colors group-hover:bg-black/25">
                <span className="flex flex-col items-center gap-2">
                  <PlayCircle className="size-14" strokeWidth={1.25} />
                  <span className="eyebrow text-[11px]">Watch free preview</span>
                </span>
              </span>
            </Link>
            <div className="p-5">
              <p className="display text-3xl">{formatPrice(program.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">One-time payment. No subscription.</p>
              <PayDialog
                title="Complete your purchase"
                lines={[
                  ["Program", program.title],
                  ["Coach", trainer.name],
                  ["Access", "Lifetime"],
                ]}
                total={program.price}
                successTitle="You're in"
                successBody={`${program.title} is now in your library. Start with lesson 1 whenever you are ready.`}
                successHref={`/app/programs/${program.id}/lessons/${first.id}`}
                successCta="Start lesson 1"
                trigger={
                  <button className="eyebrow mt-5 h-12 w-full rounded-sm bg-brand text-brand-foreground hover:bg-brand/85">
                    Buy program
                  </button>
                }
              />
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <InfinityIcon className="size-3.5" /> Lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <PlayCircle className="size-3.5" /> First lesson free
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
