import { and, eq, gte } from "drizzle-orm";
import { connection } from "next/server";
import { BookingPanel } from "@/components/booking-panel";
import { db } from "@/db";
import { availabilityRules, bookings, profiles, trainerProfiles } from "@/db/schema";
import { groupByDay, openSlots, zoneLabel } from "@/lib/booking/slots";
import { getCurrentUser } from "@/lib/dal";

/** Live booking slots for a coach (per request: depends on the clock and existing bookings). */
export async function BookingSection({ slug }: { slug: string }) {
  await connection();
  const [coach] = await db
    .select({
      userId: trainerProfiles.userId,
      name: profiles.displayName,
      timezone: profiles.timezone,
      sessionPrice: trainerProfiles.sessionPrice,
      sessionMinutes: trainerProfiles.sessionMinutes,
    })
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.userId, trainerProfiles.userId))
    .where(eq(trainerProfiles.slug, slug))
    .limit(1);
  if (!coach) return null;

  const now = new Date();
  const [rules, taken, user] = await Promise.all([
    db.select().from(availabilityRules).where(eq(availabilityRules.trainerId, coach.userId)),
    db
      .select({ startsAt: bookings.startsAt })
      .from(bookings)
      .where(and(eq(bookings.trainerId, coach.userId), eq(bookings.status, "confirmed"), gte(bookings.startsAt, now))),
    getCurrentUser(),
  ]);

  const slots = openSlots({
    rules,
    booked: taken.map((t) => t.startsAt),
    timezone: coach.timezone,
    sessionMinutes: coach.sessionMinutes,
    now,
    days: 7,
  });

  const viewer = !user ? "guest" : user.profile.role === "client" && user.profile.onboarded && user.id !== coach.userId ? "member" : "other";

  return (
    <BookingPanel
      coach={{ slug, name: coach.name, sessionPrice: coach.sessionPrice, sessionMinutes: coach.sessionMinutes }}
      days={groupByDay(slots, coach.timezone, now, 7)}
      zone={zoneLabel(coach.timezone)}
      viewer={viewer}
    />
  );
}
