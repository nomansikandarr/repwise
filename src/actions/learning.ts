"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { availabilityRules, enrollments, lessonProgress, lessons, programs, reviews, trainerProfiles } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/dal";
import { hasPaidOrderWith } from "@/lib/member";
import { notify } from "@/lib/notify";
import { invalidateCatalog } from "@/lib/catalog-cache";
import type { ActionResult } from "./commerce";

/* --------------------------- Lesson progress --------------------------- */

export async function setLessonComplete(input: { slug: string; position: number; complete: boolean }): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in.", signIn: true };
  const parsed = z
    .object({ slug: z.string().min(1).max(80), position: z.number().int().min(1), complete: z.boolean() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const [lesson] = await db
    .select({ id: lessons.id, programId: lessons.programId })
    .from(lessons)
    .innerJoin(programs, eq(programs.id, lessons.programId))
    .where(and(eq(programs.slug, parsed.data.slug), eq(lessons.position, parsed.data.position)))
    .limit(1);
  if (!lesson) return { ok: false, error: "Lesson not found." };

  const [owned] = await db
    .select({ programId: enrollments.programId })
    .from(enrollments)
    .where(and(eq(enrollments.clientId, user.id), eq(enrollments.programId, lesson.programId)))
    .limit(1);
  if (!owned) return { ok: false, error: "Buy this program to track your progress." };

  if (parsed.data.complete) {
    await db.insert(lessonProgress).values({ clientId: user.id, lessonId: lesson.id }).onConflictDoNothing();
  } else {
    await db
      .delete(lessonProgress)
      .where(and(eq(lessonProgress.clientId, user.id), eq(lessonProgress.lessonId, lesson.id)));
  }
  revalidatePath("/app", "layout");
  return { ok: true };
}

/* -------------------------------- Reviews -------------------------------- */

const reviewSchema = z.object({
  slug: z.string().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Write at least a sentence (10+ characters).").max(1000),
});

/** Create or edit the member's review of a coach. Requires a paid order with that coach. */
export async function saveReview(input: z.input<typeof reviewSchema>): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in.", signIn: true };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };

  const [coach] = await db
    .select({ userId: trainerProfiles.userId })
    .from(trainerProfiles)
    .where(and(eq(trainerProfiles.slug, parsed.data.slug), eq(trainerProfiles.status, "approved")))
    .limit(1);
  if (!coach) return { ok: false, error: "Coach not found." };
  if (coach.userId === user.id) return { ok: false, error: "You can't review yourself." };
  if (!(await hasPaidOrderWith(user.id, coach.userId))) {
    return { ok: false, error: "You can review a coach after buying a program or booking a session." };
  }

  const { rating, body } = parsed.data;
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(and(eq(reviews.trainerId, coach.userId), eq(reviews.clientId, user.id)))
      .limit(1);
    const [stats] = await tx
      .select({ avg: trainerProfiles.ratingX100, count: trainerProfiles.ratingCount })
      .from(trainerProfiles)
      .where(eq(trainerProfiles.userId, coach.userId))
      .for("update");

    // Update the running average incrementally (seeded aggregates include
    // reviews from before this app existed, so we don't recount from rows).
    const total = stats.avg * stats.count;
    const next = existing
      ? { count: stats.count, sum: total - existing.rating * 100 + rating * 100 }
      : { count: stats.count + 1, sum: total + rating * 100 };

    await tx
      .insert(reviews)
      .values({ trainerId: coach.userId, clientId: user.id, rating, body })
      .onConflictDoUpdate({ target: [reviews.trainerId, reviews.clientId], set: { rating, body } });
    await tx
      .update(trainerProfiles)
      .set({ ratingX100: Math.round(next.sum / Math.max(next.count, 1)), ratingCount: next.count })
      .where(eq(trainerProfiles.userId, coach.userId));
    if (!existing) {
      await notify(tx, coach.userId, "star", `New ${rating}★ review`, `${user.profile.displayName}: “${body.slice(0, 120)}”`);
    }
  });

  invalidateCatalog();
  return { ok: true };
}

/* ------------------------------ Availability ------------------------------ */

const rangeSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1440),
    endMinute: z.number().int().min(0).max(1440),
  })
  .refine((r) => r.startMinute < r.endMinute, "Each range must end after it starts.");

const availabilitySchema = z.object({
  rules: z.array(rangeSchema).max(50),
  sessionMinutes: z.number().int().refine((m) => [30, 45, 60, 90].includes(m), "Choose 30, 45, 60 or 90 minutes."),
  price: z.number().int().min(500, "Minimum price is Rs 500.").max(100_000),
});

export async function saveAvailability(input: z.input<typeof availabilitySchema>): Promise<ActionResult> {
  const user = await requireRole("trainer");
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid hours." };

  const { rules, sessionMinutes, price } = parsed.data;
  for (let day = 0; day < 7; day++) {
    const list = rules.filter((r) => r.weekday === day).sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < list.length; i++) {
      if (list[i].startMinute < list[i - 1].endMinute) return { ok: false, error: "Some hours overlap on the same day." };
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(availabilityRules).where(eq(availabilityRules.trainerId, user.id));
    if (rules.length) await tx.insert(availabilityRules).values(rules.map((r) => ({ ...r, trainerId: user.id })));
    await tx
      .update(trainerProfiles)
      .set({ sessionMinutes, sessionPrice: price })
      .where(eq(trainerProfiles.userId, user.id));
  });

  invalidateCatalog(); // price shows on public cards
  revalidatePath("/trainer/availability");
  return { ok: true };
}
