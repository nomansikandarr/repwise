"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { profiles, trainerProfiles } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { SPECIALTIES } from "@/lib/mock";

export type ActionState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

/** New member: save goals and finish onboarding. */
export async function finishAsMember(goals: string[]) {
  const user = await requireUser();
  if (user.profile.onboarded) redirect("/dashboard");
  await db
    .update(profiles)
    .set({ role: "client", onboarded: true, goals: goals.slice(0, 10).map((g) => g.slice(0, 60)) })
    .where(eq(profiles.userId, user.id));
  redirect("/app");
}

const applicationSchema = z.object({
  city: z.string().trim().min(2, "Enter your city").max(60),
  years: z.coerce.number().int().min(0, "Must be 0 or more").max(60),
  headline: z.string().trim().min(10, "Write at least 10 characters").max(90),
  bio: z.string().trim().min(40, "Tell clients a bit more (40+ characters)").max(2000),
  specialties: z
    .array(z.enum(SPECIALTIES))
    .min(1, "Pick at least one specialty")
    .max(4, "Pick up to 4 specialties"),
  price: z.coerce.number().int().min(500, "Minimum Rs 500").max(100_000),
  minutes: z.coerce.number().int().refine((m) => [30, 45, 60, 90].includes(m), "Choose 30, 45, 60 or 90"),
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "coach";

/** Coach application: creates a pending trainer profile for admin review. */
export async function applyAsCoach(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.profile.role === "admin") return { error: "Admin accounts cannot apply as coaches." };

  const parsed = applicationSchema.safeParse({
    city: form.get("city"),
    years: form.get("years"),
    headline: form.get("headline"),
    bio: form.get("bio"),
    specialties: form.getAll("specialties"),
    price: form.get("price"),
    minutes: form.get("minutes"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const v = parsed.data;

  const existing = await db
    .select({ status: trainerProfiles.status })
    .from(trainerProfiles)
    .where(eq(trainerProfiles.userId, user.id))
    .limit(1);
  if (existing.length) redirect("/trainer");

  // Unique, readable slug: name, then name-2, name-3...
  const base = slugify(user.profile.displayName);
  const taken = new Set(
    (await db.select({ slug: trainerProfiles.slug }).from(trainerProfiles)).map((r) => r.slug),
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

  await db.transaction(async (tx) => {
    await tx
      .update(profiles)
      .set({ role: "trainer", onboarded: true, city: v.city })
      .where(eq(profiles.userId, user.id));
    await tx.insert(trainerProfiles).values({
      userId: user.id,
      slug,
      headline: v.headline,
      bio: v.bio,
      specialties: v.specialties,
      languages: ["Urdu", "English"],
      yearsExperience: v.years,
      sessionPrice: v.price,
      sessionMinutes: v.minutes,
      photoUrl: user.profile.avatarUrl,
      status: "pending",
    });
  });

  redirect("/trainer");
}
