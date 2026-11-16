import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bookings, enrollments, lessonProgress, lessons, orders, profiles, programs, trainerProfiles } from "@/db/schema";
import { PLACEHOLDER_PHOTO } from "@/lib/queries";
import { toSessionView, type SessionView } from "@/lib/sessions";

/** Per-member reads. Always called with the signed-in user's own id. */

export type LibraryItem = {
  slug: string;
  title: string;
  trainerName: string;
  cover: string;
  focus?: string;
  total: number;
  done: number;
  /** Position of the first unfinished lesson (or the last lesson when complete). */
  next: number;
  nextTitle: string;
};

export async function myLibrary(userId: string): Promise<LibraryItem[]> {
  const owned = await db
    .select({
      id: programs.id,
      slug: programs.slug,
      title: programs.title,
      cover: programs.coverUrl,
      focus: programs.coverFocus,
      trainerName: profiles.displayName,
      enrolledAt: enrollments.createdAt,
    })
    .from(enrollments)
    .innerJoin(programs, eq(programs.id, enrollments.programId))
    .innerJoin(profiles, eq(profiles.userId, programs.trainerId))
    .where(eq(enrollments.clientId, userId))
    .orderBy(desc(enrollments.createdAt));
  if (!owned.length) return [];

  const ids = owned.map((p) => p.id);
  const [lessonRows, doneRows] = await Promise.all([
    db
      .select({ id: lessons.id, programId: lessons.programId, position: lessons.position, title: lessons.title })
      .from(lessons)
      .where(inArray(lessons.programId, ids))
      .orderBy(asc(lessons.position)),
    db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .where(and(eq(lessonProgress.clientId, userId), inArray(lessons.programId, ids))),
  ]);
  const done = new Set(doneRows.map((r) => r.lessonId));

  return owned.map((p) => {
    const list = lessonRows.filter((l) => l.programId === p.id);
    const next = list.find((l) => !done.has(l.id)) ?? list[list.length - 1];
    return {
      slug: p.slug,
      title: p.title,
      trainerName: p.trainerName,
      cover: p.cover ?? PLACEHOLDER_PHOTO,
      focus: p.focus ?? undefined,
      total: list.length,
      done: list.filter((l) => done.has(l.id)).length,
      next: next?.position ?? 1,
      nextTitle: next?.title ?? "",
    };
  });
}

/** Ownership + completed lesson positions for one program. */
export async function programState(userId: string, slug: string) {
  const [program] = await db.select({ id: programs.id }).from(programs).where(eq(programs.slug, slug)).limit(1);
  if (!program) return { owned: false, completed: new Set<number>() };
  const [enrolled] = await db
    .select({ programId: enrollments.programId })
    .from(enrollments)
    .where(and(eq(enrollments.clientId, userId), eq(enrollments.programId, program.id)))
    .limit(1);
  if (!enrolled) return { owned: false, completed: new Set<number>() };
  const rows = await db
    .select({ position: lessons.position })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .where(and(eq(lessonProgress.clientId, userId), eq(lessons.programId, program.id)));
  return { owned: true, completed: new Set(rows.map((r) => r.position)) };
}

export async function myBookings(userId: string, now = new Date()): Promise<SessionView[]> {
  const rows = await db
    .select({
      id: bookings.id,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
      price: orders.amount,
      coachName: profiles.displayName,
      coachHeadline: trainerProfiles.headline,
      coachPhoto: trainerProfiles.photoUrl,
      coachFocus: trainerProfiles.photoFocus,
      coachSlug: trainerProfiles.slug,
    })
    .from(bookings)
    .innerJoin(trainerProfiles, eq(trainerProfiles.userId, bookings.trainerId))
    .innerJoin(profiles, eq(profiles.userId, bookings.trainerId))
    .leftJoin(orders, eq(orders.id, bookings.orderId))
    .where(eq(bookings.clientId, userId))
    .orderBy(asc(bookings.startsAt));

  return rows.map((r) =>
    toSessionView(
      r,
      { name: r.coachName, sub: r.coachHeadline, img: r.coachPhoto, focus: r.coachFocus },
      now,
      `/trainers/${r.coachSlug}#review`,
    ),
  );
}

/** Has this member paid for anything from this coach? (Required to review.) */
export async function hasPaidOrderWith(userId: string, trainerId: string) {
  const [row] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.clientId, userId), eq(orders.trainerId, trainerId), eq(orders.status, "paid")))
    .limit(1);
  return !!row;
}
