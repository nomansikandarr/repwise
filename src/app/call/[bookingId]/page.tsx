import { eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { CallRoom } from "@/components/call-room";
import { db } from "@/db";
import { bookings, profiles, trainerProfiles } from "@/db/schema";
import { formatTime } from "@/lib/format";
import { requireUser } from "@/lib/dal";
import { PLACEHOLDER_PHOTO } from "@/lib/queries";

type Props = { params: Promise<{ bookingId: string }> };

export const metadata: Metadata = { title: "Live session" };

export default function CallPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center bg-black"><Loader2 className="size-6 animate-spin text-white/60" /></div>}>
      <Call params={params} />
    </Suspense>
  );
}

/**
 * Only the booking's two participants may open the room. The video itself is
 * still a mock-up; Stream Video replaces it in phase 5.
 */
async function Call({ params }: Props) {
  const { bookingId } = await params;
  const user = await requireUser();
  if (!z.uuid().safeParse(bookingId).success) notFound();

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking || (booking.clientId !== user.id && booking.trainerId !== user.id) || booking.status === "cancelled") notFound();

  const isCoach = user.id === booking.trainerId;
  const otherId = isCoach ? booking.clientId : booking.trainerId;
  const [other] = await db
    .select({ name: profiles.displayName, avatar: profiles.avatarUrl, photo: trainerProfiles.photoUrl, focus: trainerProfiles.photoFocus })
    .from(profiles)
    .leftJoin(trainerProfiles, eq(trainerProfiles.userId, profiles.userId))
    .where(eq(profiles.userId, otherId))
    .limit(1);

  return (
    <CallRoom
      title={`1:1 session with ${other?.name ?? "your coach"} · ${formatTime(booking.startsAt)}`}
      remote={{ name: other?.name ?? "Guest", img: other?.photo ?? other?.avatar ?? PLACEHOLDER_PHOTO, focus: other?.focus ?? undefined }}
      local={{ name: user.profile.displayName, img: user.profile.avatarUrl ?? PLACEHOLDER_PHOTO }}
      exitHref={isCoach ? "/trainer/bookings" : "/app/bookings"}
    />
  );
}
