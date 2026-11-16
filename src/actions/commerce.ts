"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { availabilityRules, bookings, enrollments, orders, profiles, programs, trainerProfiles } from "@/db/schema";
import { canCancel, openSlots } from "@/lib/booking/slots";
import { getCurrentUser, type CurrentUser } from "@/lib/dal";
import { formatDay, formatTime } from "@/lib/format";
import { notify } from "@/lib/notify";
import { payments, splitFee } from "@/lib/payments";
import { invalidateCatalog } from "@/lib/catalog-cache";

export type ActionResult = { ok: true } | { ok: false; error: string; signIn?: boolean };

const key = z.string().min(8).max(100);

/** Only onboarded members can buy or book. */
async function requireMember(): Promise<CurrentUser | ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to continue.", signIn: true };
  if (!user.profile.onboarded || user.profile.role !== "client") {
    return { ok: false, error: "Only member accounts can buy programs or book sessions." };
  }
  return user;
}

function refreshDashboards() {
  revalidatePath("/app", "layout");
  revalidatePath("/trainer", "layout");
}

/* ------------------------------ Programs ------------------------------ */

export async function buyProgram(input: { slug: string; idempotencyKey: string }): Promise<ActionResult> {
  const user = await requireMember();
  if ("ok" in user) return user;
  const parsed = z.object({ slug: z.string().min(1).max(80), idempotencyKey: key }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const [program] = await db
    .select({ id: programs.id, title: programs.title, price: programs.price, trainerId: programs.trainerId })
    .from(programs)
    .innerJoin(trainerProfiles, eq(trainerProfiles.userId, programs.trainerId))
    .where(and(eq(programs.slug, parsed.data.slug), eq(programs.published, true), eq(trainerProfiles.status, "approved")))
    .limit(1);
  if (!program) return { ok: false, error: "This program is not available." };

  const [already] = await db
    .select({ programId: enrollments.programId })
    .from(enrollments)
    .where(and(eq(enrollments.clientId, user.id), eq(enrollments.programId, program.id)))
    .limit(1);
  if (already) return { ok: true };

  const idempotencyKey = `${user.id}:${parsed.data.idempotencyKey}`;
  const charge = await payments.charge({
    amount: program.price,
    clientId: user.id,
    idempotencyKey,
    description: program.title,
  });
  if (!charge.ok) return { ok: false, error: charge.error };

  const { fee, net } = splitFee(program.price);
  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        clientId: user.id,
        trainerId: program.trainerId,
        type: "program",
        programId: program.id,
        amount: program.price,
        platformFee: fee,
        trainerNet: net,
        idempotencyKey,
      })
      .onConflictDoNothing({ target: orders.idempotencyKey })
      .returning({ id: orders.id });
    if (!order) return; // same click submitted twice: first one already did the work

    const enrolled = await tx
      .insert(enrollments)
      .values({ clientId: user.id, programId: program.id, orderId: order.id })
      .onConflictDoNothing()
      .returning({ programId: enrollments.programId });
    if (!enrolled.length) return;

    await tx
      .update(programs)
      .set({ studentCount: sql`${programs.studentCount} + 1` })
      .where(eq(programs.id, program.id));
    await notify(tx, user.id, "play", `${program.title} is in your library`, "Start with lesson 1 whenever you're ready.", { slug: parsed.data.slug });
    await notify(tx, program.trainerId, "check", "New program sale", `${user.profile.displayName} bought ${program.title}.`, { slug: parsed.data.slug });
  });

  invalidateCatalog(); // student count on public pages
  refreshDashboards();
  return { ok: true };
}

/* ------------------------------ Sessions ------------------------------ */

export async function bookSession(input: { slug: string; startsAt: string; idempotencyKey: string }): Promise<ActionResult> {
  const user = await requireMember();
  if ("ok" in user) return user;
  const parsed = z
    .object({ slug: z.string().min(1).max(80), startsAt: z.iso.datetime(), idempotencyKey: key })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const startsAt = new Date(parsed.data.startsAt);

  const [coach] = await db
    .select({
      userId: trainerProfiles.userId,
      price: trainerProfiles.sessionPrice,
      minutes: trainerProfiles.sessionMinutes,
      name: profiles.displayName,
      timezone: profiles.timezone,
    })
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.userId, trainerProfiles.userId))
    .where(and(eq(trainerProfiles.slug, parsed.data.slug), eq(trainerProfiles.status, "approved")))
    .limit(1);
  if (!coach) return { ok: false, error: "This coach is not taking bookings." };

  // Re-check on the server that the requested time is genuinely open.
  const now = new Date();
  const [rules, taken] = await Promise.all([
    db.select().from(availabilityRules).where(eq(availabilityRules.trainerId, coach.userId)),
    db
      .select({ startsAt: bookings.startsAt })
      .from(bookings)
      .where(and(eq(bookings.trainerId, coach.userId), eq(bookings.status, "confirmed"), gte(bookings.startsAt, now))),
  ]);
  const open = openSlots({
    rules,
    booked: taken.map((t) => t.startsAt),
    timezone: coach.timezone,
    sessionMinutes: coach.minutes,
    now,
  });
  if (!open.some((s) => s.getTime() === startsAt.getTime())) {
    return { ok: false, error: "That time is no longer available. Please pick another slot." };
  }

  const idempotencyKey = `${user.id}:${parsed.data.idempotencyKey}`;
  const charge = await payments.charge({ amount: coach.price, clientId: user.id, idempotencyKey, description: "1:1 session" });
  if (!charge.ok) return { ok: false, error: charge.error };

  const { fee, net } = splitFee(coach.price);
  const endsAt = new Date(startsAt.getTime() + coach.minutes * 60_000);
  const when = `${formatDay(startsAt, now)} at ${formatTime(startsAt)}`;
  try {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          clientId: user.id,
          trainerId: coach.userId,
          type: "session",
          amount: coach.price,
          platformFee: fee,
          trainerNet: net,
          idempotencyKey,
        })
        .onConflictDoNothing({ target: orders.idempotencyKey })
        .returning({ id: orders.id });
      if (!order) return;
      await tx.insert(bookings).values({ trainerId: coach.userId, clientId: user.id, startsAt, endsAt, orderId: order.id });
      await notify(tx, user.id, "calendar", "Session booked", `${when} with ${coach.name}. You can join 10 minutes early.`);
      await notify(tx, coach.userId, "calendar", "New session booked", `${user.profile.displayName} booked ${when}.`);
    });
  } catch (err) {
    // The partial unique index on (trainer, start) for confirmed bookings.
    if ((err as { cause?: { code?: string }; code?: string }).code === "23505" || (err as { cause?: { code?: string } }).cause?.code === "23505") {
      return { ok: false, error: "Someone just booked that slot. Please pick another time." };
    }
    throw err;
  }

  refreshDashboards();
  revalidatePath(`/trainers/${parsed.data.slug}`);
  return { ok: true };
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in.", signIn: true };
  if (!z.uuid().safeParse(bookingId).success) return { ok: false, error: "Booking not found." };

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking || (booking.clientId !== user.id && booking.trainerId !== user.id)) {
    return { ok: false, error: "Booking not found." };
  }
  if (booking.status !== "confirmed") return { ok: false, error: "This session is no longer active." };
  if (!canCancel(booking.startsAt, new Date())) {
    return { ok: false, error: "Sessions can only be cancelled 24 hours or more before they start." };
  }

  const [order] = booking.orderId ? await db.select().from(orders).where(eq(orders.id, booking.orderId)).limit(1) : [];
  if (order?.status === "paid") await payments.refund(`mock_${order.idempotencyKey}`);

  const byCoach = user.id === booking.trainerId;
  const other = byCoach ? booking.clientId : booking.trainerId;
  const when = `${formatDay(booking.startsAt)} at ${formatTime(booking.startsAt)}`;
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(bookings)
      .set({ status: "cancelled", cancelledBy: user.id })
      .where(and(eq(bookings.id, booking.id), eq(bookings.status, "confirmed")))
      .returning({ id: bookings.id });
    if (!updated.length) return;
    if (order) await tx.update(orders).set({ status: "refunded" }).where(eq(orders.id, order.id));
    await notify(
      tx,
      other,
      "refund",
      "Session cancelled",
      `${user.profile.displayName} cancelled the session on ${when}.${!byCoach ? "" : " Your payment has been refunded."}`,
    );
    if (!byCoach && order) {
      await notify(tx, user.id, "refund", "Refund processed", `Your payment for the session on ${when} has been refunded.`);
    }
  });

  refreshDashboards();
  return { ok: true };
}
