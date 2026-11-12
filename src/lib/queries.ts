import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { lessons, profiles, programs, reviews, trainerProfiles } from "@/db/schema";
import type { Lesson, Program, Review, Trainer } from "@/lib/mock";

/**
 * Public, cached reads for the marketing pages. Results are shaped like the
 * UI types in src/lib/mock.ts so components work with either source.
 * Mutations that change this data call updateTag("catalog").
 */

export const CATALOG_TAG = "catalog";
export const PLACEHOLDER_PHOTO = "/images/coach-placeholder.svg";

const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

const trainerColumns = {
  slug: trainerProfiles.slug,
  name: profiles.displayName,
  city: profiles.city,
  avatar: profiles.avatarUrl,
  headline: trainerProfiles.headline,
  bio: trainerProfiles.bio,
  specialties: trainerProfiles.specialties,
  languages: trainerProfiles.languages,
  years: trainerProfiles.yearsExperience,
  sessionPrice: trainerProfiles.sessionPrice,
  sessionMinutes: trainerProfiles.sessionMinutes,
  ratingX100: trainerProfiles.ratingX100,
  ratingCount: trainerProfiles.ratingCount,
  clients: trainerProfiles.clientCount,
  photo: trainerProfiles.photoUrl,
  focus: trainerProfiles.photoFocus,
  badge: trainerProfiles.badge,
};

type TrainerRow = { [K in keyof typeof trainerColumns]: (typeof trainerColumns)[K]["_"]["data"] | null };

function toTrainer(r: TrainerRow): Trainer {
  return {
    slug: r.slug!,
    name: r.name!,
    city: r.city ?? "Pakistan",
    headline: r.headline!,
    bio: r.bio!,
    specialties: r.specialties ?? [],
    languages: r.languages ?? [],
    years: r.years ?? 0,
    sessionPrice: r.sessionPrice ?? 0,
    sessionMinutes: r.sessionMinutes ?? 60,
    rating: (r.ratingX100 ?? 0) / 100,
    reviews: r.ratingCount ?? 0,
    clients: r.clients ?? 0,
    photo: r.photo ?? r.avatar ?? PLACEHOLDER_PHOTO,
    focus: r.focus ?? undefined,
    badge: r.badge ?? (r.ratingCount === 0 ? "New coach" : undefined),
  };
}

function trainerQuery() {
  return db
    .select(trainerColumns)
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.userId, trainerProfiles.userId));
}

export async function listTrainers(): Promise<Trainer[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const rows = await trainerQuery()
    .where(eq(trainerProfiles.status, "approved"))
    .orderBy(desc(trainerProfiles.ratingX100), desc(trainerProfiles.ratingCount));
  return rows.map(toTrainer);
}

export async function getTrainerBySlug(slug: string): Promise<Trainer | null> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const [row] = await trainerQuery()
    .where(and(eq(trainerProfiles.slug, slug), eq(trainerProfiles.status, "approved")))
    .limit(1);
  return row ? toTrainer(row) : null;
}

async function loadPrograms(where: ReturnType<typeof eq> | undefined): Promise<Program[]> {
  const rows = await db
    .select({
      id: programs.id,
      slug: programs.slug,
      title: programs.title,
      tagline: programs.tagline,
      description: programs.description,
      level: programs.level,
      price: programs.price,
      weeks: programs.weeks,
      cover: programs.coverUrl,
      focus: programs.coverFocus,
      students: programs.studentCount,
      ratingX100: programs.ratingX100,
      tags: programs.tags,
      trainerSlug: trainerProfiles.slug,
      trainerName: profiles.displayName,
    })
    .from(programs)
    .innerJoin(trainerProfiles, eq(trainerProfiles.userId, programs.trainerId))
    .innerJoin(profiles, eq(profiles.userId, programs.trainerId))
    .where(and(eq(programs.published, true), eq(trainerProfiles.status, "approved"), where))
    .orderBy(desc(programs.studentCount));

  if (!rows.length) return [];
  const lessonRows = await db
    .select({
      programId: lessons.programId,
      position: lessons.position,
      title: lessons.title,
      durationSec: lessons.durationSec,
      isPreview: lessons.isPreview,
    })
    .from(lessons)
    .where(inArray(lessons.programId, rows.map((r) => r.id)))
    .orderBy(asc(lessons.position));

  const byProgram = new Map<string, Lesson[]>();
  for (const l of lessonRows) {
    const list = byProgram.get(l.programId) ?? [];
    list.push({
      id: String(l.position),
      title: l.title,
      minutes: Math.max(1, Math.round((l.durationSec ?? 0) / 60)),
      preview: l.isPreview,
    });
    byProgram.set(l.programId, list);
  }

  return rows.map((r) => ({
    id: r.slug,
    title: r.title,
    tagline: r.tagline,
    description: r.description,
    trainer: r.trainerSlug,
    trainerName: r.trainerName,
    level: LEVEL_LABEL[r.level],
    price: r.price,
    weeks: r.weeks,
    cover: r.cover ?? PLACEHOLDER_PHOTO,
    focus: r.focus ?? undefined,
    students: r.students,
    rating: r.ratingX100 / 100,
    tags: r.tags,
    lessons: byProgram.get(r.id) ?? [],
  }));
}

export async function listPrograms(): Promise<Program[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return loadPrograms(undefined);
}

export async function listProgramsByTrainer(slug: string): Promise<Program[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return loadPrograms(eq(trainerProfiles.slug, slug));
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const [program] = await loadPrograms(eq(programs.slug, slug));
  return program ?? null;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

async function loadReviews(trainerSlug: string | null, limit: number): Promise<Review[]> {
  const rows = await db
    .select({
      name: profiles.displayName,
      city: profiles.city,
      avatar: profiles.avatarUrl,
      rating: reviews.rating,
      body: reviews.body,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(profiles, eq(profiles.userId, reviews.clientId))
    .innerJoin(trainerProfiles, eq(trainerProfiles.userId, reviews.trainerId))
    .where(trainerSlug ? eq(trainerProfiles.slug, trainerSlug) : undefined)
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    name: r.name,
    city: r.city ?? "",
    avatar: r.avatar ?? PLACEHOLDER_PHOTO,
    rating: r.rating,
    body: r.body,
    date: dateFmt.format(r.createdAt),
  }));
}

export async function listReviewsForTrainer(slug: string): Promise<Review[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return loadReviews(slug, 6);
}

/** Latest reviews across all coaches, deduplicated by reviewer (landing page). */
export async function listLatestReviews(count: number): Promise<Review[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const seen = new Set<string>();
  return (await loadReviews(null, 30)).filter((r) => !seen.has(r.name) && seen.add(r.name)).slice(0, count);
}
