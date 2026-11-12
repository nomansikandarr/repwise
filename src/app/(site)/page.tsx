import {
  Apple,
  CalendarCheck,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Home,
  Languages,
  MessagesSquare,
  MoonStar,
  Search,
  Swords,
  Target,
  Trophy,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CtaLink, SectionHeading, Stars } from "@/components/bits";
import { ProgramCard, TrainerCard } from "@/components/cards";
import { listLatestReviews, listPrograms, listTrainers } from "@/lib/queries";

/** Curated, men-first picks for the landing page (looked up in the DB by slug). */
const FEATURED_TRAINERS = ["hamza-sheikh", "bilal-ahmed", "gurpreet-singh", "ayesha-siddiqui"];
const FEATURED_PROGRAMS = ["desi-strength-12", "fast-bowler-engine", "ramadan-shred", "daal-roti-macros"];

function pick<T>(items: T[], keys: string[], key: (item: T) => string, count = 4) {
  const chosen = keys.map((k) => items.find((i) => key(i) === k)).filter((i): i is T => !!i);
  return [...chosen, ...items.filter((i) => !chosen.includes(i))].slice(0, count);
}

const CATEGORIES = [
  { icon: Dumbbell, label: "Strength" },
  { icon: Trophy, label: "Cricket" },
  { icon: Footprints, label: "Running" },
  { icon: Home, label: "Home" },
  { icon: Swords, label: "Boxing" },
  { icon: Apple, label: "Nutrition" },
];

const COLLECTIONS = [
  {
    title: "Strength coaches",
    body: "Barbell basics to serious lifting.",
    cta: "Find a coach",
    img: "/images/imran.jpg",
    focus: "50% 18%",
  },
  {
    title: "Cricket fitness",
    body: "Pace, stamina and injury-free seasons.",
    cta: "Train for cricket",
    img: "/images/cricket.jpg",
    focus: "50% 20%",
  },
  {
    title: "Women-only coaching",
    body: "Private sessions with female coaches.",
    cta: "Meet the coaches",
    img: "/images/hijab-dumbbell.jpg",
    focus: "50% 15%",
  },
];

const FEATURES = [
  { icon: Video, title: "Live 1:1 video", body: "Train face to face. From home." },
  { icon: Apple, title: "Desi diet plans", body: "Roti, daal, chawal. No fads." },
  { icon: Languages, title: "Your language", body: "Urdu, Punjabi, Hindi, English." },
  { icon: MoonStar, title: "Ramadan friendly", body: "Plans around sehri and iftar." },
];

const STEPS = [
  { icon: Search, n: "01", title: "Pick your coach", body: "Filter by goal, city, language and price. Every coach is verified by our team." },
  { icon: CalendarCheck, n: "02", title: "Buy a program or book a session", body: "Follow a video program at your pace, or grab a live slot that suits your day." },
  { icon: MessagesSquare, n: "03", title: "Train, chat, repeat", body: "Meet on video, send form checks in chat and keep moving forward every week." },
];

export default async function HomePage() {
  const [allTrainers, allPrograms, reviews] = await Promise.all([listTrainers(), listPrograms(), listLatestReviews(3)]);
  const trainers = pick(allTrainers, FEATURED_TRAINERS, (t) => t.slug);
  const programs = pick(allPrograms, FEATURED_PROGRAMS, (p) => p.id);
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[58%]">
          <Image
            src="/images/hero.jpg"
            alt="A man training on a cable machine"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover object-[50%_18%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10 lg:via-black/25 lg:to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black to-transparent" />
        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:min-h-[640px]">
          <h1 className="display text-5xl sm:text-7xl lg:text-8xl">
            Train
            <br />
            stronger.
            <br />
            Live <span className="text-brand">bolder.</span>
          </h1>
          <span className="mt-6 block h-0.5 w-10 bg-brand" />
          <p className="mt-5 max-w-sm text-lg text-white/80">
            Pakistan&apos;s best personal trainers, live on video and in your pocket.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <CtaLink href="/trainers">Find a trainer</CtaLink>
            <CtaLink href="/programs" variant="line">
              Explore programs
            </CtaLink>
          </div>
          <dl className="mt-14 flex gap-10 text-sm">
            {[
              ["250+", "Verified coaches"],
              ["40k", "Members training"],
              ["4.9", "Average rating"],
            ].map(([value, label]) => (
              <div key={label}>
                <dd className="display text-2xl sm:text-3xl">{value}</dd>
                <dt className="mt-1 text-white/60">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ul className="no-scrollbar flex justify-between gap-6 overflow-x-auto sm:justify-center sm:gap-14">
          {CATEGORIES.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Link href="/trainers" className="group flex flex-col items-center gap-3">
                <span className="grid size-16 place-items-center rounded-full border border-foreground/40 transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground sm:size-[72px]">
                  <Icon className="size-7" strokeWidth={1.25} />
                </span>
                <span className="eyebrow text-[11px]">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Collections */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3">
        {COLLECTIONS.map((c) => (
          <Link key={c.title} href="/trainers" className="group relative block aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[16/9] md:aspect-[4/5]">
            <Image
              src={c.img}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition: c.focus }}
            />
            <div className="photo-shade absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="display max-w-[10ch] text-2xl">{c.title}</h3>
              <p className="mt-2 text-sm text-white/75">{c.body}</p>
              <span className="eyebrow mt-5 inline-flex items-center gap-3 border-b border-white/40 pb-2 text-[11px] group-hover:border-brand group-hover:text-brand">
                {c.cta} →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ul className="grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-4 lg:justify-center lg:px-6">
              <Icon className="size-9 shrink-0" strokeWidth={1.25} />
              <div>
                <p className="eyebrow text-[11px]">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured trainers */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Top coaches this month"
          title="Meet your coach"
          action={
            <CtaLink href="/trainers" variant="line">
              All trainers
            </CtaLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <TrainerCard key={t.slug} trainer={t} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-lg bg-black text-white">
          <Image
            src="/images/pushup.jpg"
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover opacity-45"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/50 to-black/80" />
          <div className="grid gap-10 p-8 sm:p-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="display text-4xl sm:text-5xl">
                Train.
                <br />
                Perform.
                <br />
                Repeat.
              </h2>
              <p className="mt-5 max-w-xs text-white/80">
                Video programs for the gym, the ground and your living room. Buy once, keep forever.
              </p>
              <CtaLink href="/programs" className="mt-7">
                Shop programs
              </CtaLink>
            </div>
            <ul className="space-y-7 lg:justify-self-end">
              {[
                [Flame, "Energy", "unleashed"],
                [HeartPulse, "Health", "protected"],
                [Target, "Goals", "within reach"],
              ].map(([Icon, a, b]) => {
                const I = Icon as typeof Flame;
                return (
                  <li key={a as string} className="flex items-center gap-4">
                    <I className="size-8 text-brand" strokeWidth={1.5} />
                    <span className="eyebrow leading-5">
                      {a as string}
                      <br />
                      {b as string}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Best sellers"
          title="Programs that fit desi life"
          action={
            <CtaLink href="/programs" variant="line">
              All programs
            </CtaLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </section>

      {/* Community strip (always light, as in the reference) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-lg bg-neutral-100 p-6 text-neutral-950 sm:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="display text-2xl sm:text-3xl">#RepwiseFamily</h2>
              <p className="mt-1 text-sm text-neutral-600">Real people. Real progress.</p>
            </div>
            <p className="text-sm text-neutral-600">Rated 4.9 by 12,000+ members</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="flex flex-col rounded-lg bg-white p-5">
                <Stars value={r.rating} className="[&_svg]:fill-neutral-900 [&_svg]:text-neutral-900" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700">“{r.body}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Image src={r.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                  <span className="text-sm">
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-neutral-500">{r.city}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Three steps to start" />
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, n, title, body }) => (
            <li key={n} className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="display text-lime text-4xl">{n}</span>
                <Icon className="size-7 text-muted-foreground" strokeWidth={1.25} />
              </div>
              <h3 className="display mt-6 text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Coach CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6">
        <div className="grid overflow-hidden rounded-lg bg-brand text-brand-foreground md:grid-cols-[1.3fr_1fr]">
          <div className="p-8 sm:p-14">
            <p className="eyebrow mb-4">For coaches</p>
            <h2 className="display text-4xl sm:text-5xl">
              Coach more people.
              <br />
              Earn more.
            </h2>
            <p className="mt-5 max-w-md">
              Sell programs, run live sessions and manage clients from one dashboard. Keep 90% of everything you earn.
            </p>
            <CtaLink href="/onboarding" variant="dark" className="mt-7">
              Apply as a coach
            </CtaLink>
          </div>
          <div className="relative min-h-56">
            <Image src="/images/dumbbell.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-[50%_25%]" />
          </div>
        </div>
      </section>
    </>
  );
}
