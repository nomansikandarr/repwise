"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { profiles, trainerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { SPECIALTIES } from "@/lib/mock";
import { CATALOG_TAG } from "@/lib/queries";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  city: z.string().trim().min(2, "Enter your city").max(60),
  headline: z.string().trim().min(10, "At least 10 characters").max(90),
  bio: z.string().trim().min(40, "At least 40 characters").max(2000),
  years: z.coerce.number().int().min(0).max(60),
  languages: z.string().trim().max(120),
  specialties: z.array(z.enum(SPECIALTIES)).min(1, "Pick at least one").max(4, "Pick up to 4"),
});

export type ProfileState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | undefined;

/** Save the signed-in coach's own public profile. */
export async function saveCoachProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireRole("trainer");
  const parsed = schema.safeParse({
    name: form.get("name"),
    city: form.get("city"),
    headline: form.get("headline"),
    bio: form.get("bio"),
    years: form.get("years"),
    languages: form.get("languages"),
    specialties: form.getAll("specialties"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const v = parsed.data;

  await db.transaction(async (tx) => {
    await tx.update(profiles).set({ displayName: v.name, city: v.city }).where(eq(profiles.userId, user.id));
    await tx
      .update(trainerProfiles)
      .set({
        headline: v.headline,
        bio: v.bio,
        yearsExperience: v.years,
        specialties: v.specialties,
        languages: v.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 6),
      })
      .where(eq(trainerProfiles.userId, user.id));
  });

  updateTag(CATALOG_TAG); // public profile and directory show the new details
  return { ok: true };
}
