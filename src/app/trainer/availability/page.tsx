import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityForm } from "@/components/availability-form";
import { PageTitle } from "@/components/dashboard-shell";
import { db } from "@/db";
import { availabilityRules } from "@/db/schema";
import { zoneLabel } from "@/lib/booking/slots";
import { getMyTrainerProfile, requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const user = await requireUser();
  const [coach, rules] = await Promise.all([
    getMyTrainerProfile(user.id),
    db
      .select({ weekday: availabilityRules.weekday, startMinute: availabilityRules.startMinute, endMinute: availabilityRules.endMinute })
      .from(availabilityRules)
      .where(eq(availabilityRules.trainerId, user.id)),
  ]);
  if (!coach) notFound();

  return (
    <>
      <PageTitle title="Availability" body="Set the hours clients can book. Open slots are created automatically from these." />
      <AvailabilityForm
        initial={rules}
        sessionMinutes={coach.sessionMinutes}
        price={coach.sessionPrice}
        timezoneLabel={zoneLabel(user.profile.timezone)}
      />
    </>
  );
}
