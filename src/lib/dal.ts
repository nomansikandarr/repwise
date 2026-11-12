import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { profiles, trainerProfiles, type Profile, type TrainerProfile } from "@/db/schema";
import { authDisabledInDev, getAuth } from "@/lib/auth/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  profile: Profile;
};

/**
 * Data Access Layer: the single place that reads the session.
 * Returns null when signed out. Creates the app profile on first sight
 * (role `client`, or `admin` when the email matches ADMIN_EMAIL).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Touch request data first so Cache Components never tries to prerender this.
  await cookies();
  if (authDisabledInDev()) return null;
  const { data } = await getAuth().getSession();
  const user = data?.user;
  if (!user) return null;

  let [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

  if (!profile) {
    const isAdmin =
      !!process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    [profile] = await db
      .insert(profiles)
      .values({
        userId: user.id,
        displayName: user.name || user.email.split("@")[0],
        avatarUrl: user.image ?? null,
        role: isAdmin ? "admin" : "client",
        onboarded: isAdmin,
      })
      .onConflictDoNothing()
      .returning();
    // Lost a race with a parallel request: read the row that won.
    profile ??= (await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1))[0];
  }

  return { id: user.id, email: user.email, name: user.name, image: user.image ?? null, profile };
});

export const getMyTrainerProfile = cache(async (userId: string): Promise<TrainerProfile | null> => {
  const [row] = await db.select().from(trainerProfiles).where(eq(trainerProfiles.userId, userId)).limit(1);
  return row ?? null;
});

/** Where a signed-in user belongs. */
export function homePath(user: CurrentUser) {
  if (!user.profile.onboarded) return "/onboarding";
  if (user.profile.role === "admin") return "/admin/applications";
  if (user.profile.role === "trainer") return "/trainer";
  return "/app";
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

/** Signed in, onboarded, and holding one of `roles`; otherwise sent to their own home. */
export async function requireRole(...roles: Profile["role"][]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.profile.onboarded || !roles.includes(user.profile.role)) redirect(homePath(user));
  return user;
}
