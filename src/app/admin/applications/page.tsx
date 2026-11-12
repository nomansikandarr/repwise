import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ApplicationsBoard, type Application } from "@/components/applications-board";
import { PageTitle } from "@/components/dashboard-shell";
import { db } from "@/db";
import { profiles, trainerProfiles } from "@/db/schema";
import { PLACEHOLDER_PHOTO } from "@/lib/queries";

export const metadata: Metadata = { title: "Trainer applications" };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function ApplicationsPage() {
  await connection(); // always fresh: admins act on the latest queue
  const rows = await db
    .select({
      userId: trainerProfiles.userId,
      name: profiles.displayName,
      city: profiles.city,
      avatar: profiles.avatarUrl,
      headline: trainerProfiles.headline,
      bio: trainerProfiles.bio,
      years: trainerProfiles.yearsExperience,
      specialties: trainerProfiles.specialties,
      price: trainerProfiles.sessionPrice,
      status: trainerProfiles.status,
      createdAt: trainerProfiles.createdAt,
    })
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.userId, trainerProfiles.userId))
    .orderBy(desc(trainerProfiles.createdAt));

  const applications: Application[] = rows.map((r) => ({
    id: r.userId,
    name: r.name,
    city: r.city ?? "",
    avatar: r.avatar ?? PLACEHOLDER_PHOTO,
    headline: r.headline,
    note: r.bio,
    years: r.years,
    specialties: r.specialties,
    price: r.price,
    applied: dateFmt.format(r.createdAt),
    status: r.status,
  }));

  return (
    <>
      <PageTitle title="Trainer applications" body="Review coaches before they go live on Repwise." />
      <ApplicationsBoard initial={applications} />
    </>
  );
}
