/**
 * Seeds the Neon database with Repwise demo data.
 *
 *   pnpm db:seed
 *
 * - Creates three real Neon Auth accounts (admin, member, coach) through the
 *   Neon Auth API, so you can sign in as each role.
 * - Wipes and refills the app tables in `public` (never touches `neon_auth`).
 * - Content comes from src/lib/mock.ts so the UI and the DB stay in sync.
 *
 * Safe to re-run: auth accounts are reused, app tables are rebuilt.
 */
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { applications, notifications as mockNotifications, programs, reviews as mockReviews, trainers } from "../src/lib/mock";

config({ path: ".env.local" });

const AUTH_URL = process.env.NEON_AUTH_BASE_URL;
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DB_URL = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!AUTH_URL || !DB_URL) throw new Error("NEON_AUTH_BASE_URL and DATABASE_URL must be set in .env.local");

export const DEMO_PASSWORD = "Repwise#2026demo";
export const DEMO_ACCOUNTS = {
  admin: { email: process.env.ADMIN_EMAIL ?? "admin@repwise.test", name: "Repwise Admin" },
  client: { email: "ali.raza@repwise.test", name: "Ali Raza" },
  trainer: { email: "hamza.sheikh@repwise.test", name: "Hamza Sheikh" },
};

/** Create the auth user, or sign in if it already exists; returns its id. */
async function ensureAuthUser(email: string, name: string): Promise<string> {
  const post = (path: string, body: object) =>
    fetch(`${AUTH_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: APP_ORIGIN },
      body: JSON.stringify(body),
    });

  const signUp = await post("sign-up/email", { email, password: DEMO_PASSWORD, name });
  if (signUp.ok) return ((await signUp.json()) as { user: { id: string } }).user.id;

  const signIn = await post("sign-in/email", { email, password: DEMO_PASSWORD });
  if (signIn.ok) return ((await signIn.json()) as { user: { id: string } }).user.id;

  throw new Error(`Could not create or sign in ${email}: ${signUp.status} ${await signUp.text()}`);
}

const LEVEL = { Beginner: "beginner", Intermediate: "intermediate", Advanced: "advanced" } as const;
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Which coaches each mock review belongs to (bodies mention specific coaches). */
const REVIEW_TARGETS: string[][] = [
  ["hamza-sheikh"],
  ["hamza-sheikh", "imran-butt", "gurpreet-singh"],
  ["ayesha-siddiqui", "zara-khan"],
  ["rohan-mehta", "usman-tariq"],
  ["bilal-ahmed"],
  ["imran-butt", "usman-tariq"],
];

async function main() {
  console.log("→ Ensuring demo auth accounts");
  const ids = {
    admin: await ensureAuthUser(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.name),
    client: await ensureAuthUser(DEMO_ACCOUNTS.client.email, DEMO_ACCOUNTS.client.name),
    trainer: await ensureAuthUser(DEMO_ACCOUNTS.trainer.email, DEMO_ACCOUNTS.trainer.name),
  };

  const pool = new Pool({ connectionString: DB_URL });
  const db = drizzle({ client: pool, schema });

  await db.transaction(async (tx) => {
    console.log("→ Clearing app tables");
    await tx.execute(sql`TRUNCATE profiles, notifications, orders, enrollments, lesson_progress CASCADE`);

    const trainerId = (slug: string) => (slug === "hamza-sheikh" ? ids.trainer : `seed_${slug}`);

    console.log("→ Profiles");
    await tx.insert(schema.profiles).values([
      { userId: ids.admin, role: "admin", displayName: DEMO_ACCOUNTS.admin.name, onboarded: true, city: "Lahore" },
      {
        userId: ids.client,
        role: "client",
        displayName: "Ali Raza",
        avatarUrl: "/images/p-man1.jpg",
        city: "Lahore",
        goals: ["Build strength", "Lose fat"],
        onboarded: true,
      },
      ...trainers.map((t) => ({
        userId: trainerId(t.slug),
        role: "trainer" as const,
        displayName: t.name,
        avatarUrl: t.photo,
        city: t.city,
        onboarded: true,
      })),
      // Reviewers (Ali is a real account; the rest are seed-only people).
      ...mockReviews
        .filter((r) => r.name !== "Ali Raza")
        .map((r) => ({
          userId: `seed_${slugify(r.name)}`,
          role: "client" as const,
          displayName: r.name,
          avatarUrl: r.avatar,
          city: r.city,
          onboarded: true,
        })),
      // Trainer applicants.
      ...applications.map((a) => ({
        userId: `seed_${a.id}`,
        role: "trainer" as const,
        displayName: a.name,
        avatarUrl: a.avatar,
        city: a.city,
        onboarded: true,
      })),
    ]);

    console.log("→ Trainers");
    await tx.insert(schema.trainerProfiles).values([
      ...trainers.map((t) => ({
        userId: trainerId(t.slug),
        slug: t.slug,
        headline: t.headline,
        bio: t.bio,
        specialties: t.specialties,
        languages: t.languages,
        yearsExperience: t.years,
        sessionPrice: t.sessionPrice,
        sessionMinutes: t.sessionMinutes,
        photoUrl: t.photo,
        photoFocus: t.focus ?? null,
        badge: t.badge ?? null,
        clientCount: t.clients,
        status: "approved" as const,
        ratingX100: Math.round(t.rating * 100),
        ratingCount: t.reviews,
        reviewedAt: new Date("2025-01-14T10:00:00Z"),
      })),
      ...applications.map((a) => ({
        userId: `seed_${a.id}`,
        slug: slugify(a.name),
        headline: a.headline,
        bio: a.note,
        specialties: a.specialties,
        languages: ["Urdu", "English"],
        yearsExperience: a.years,
        sessionPrice: a.price,
        sessionMinutes: 60,
        photoUrl: a.avatar,
        status: a.status,
        applicationNote: a.status === "rejected" ? "No certification or references provided." : null,
        reviewedAt: a.status === "pending" ? null : new Date(),
        createdAt: new Date(a.applied),
      })),
    ]);

    console.log("→ Programs & lessons");
    for (const p of programs) {
      const [row] = await tx
        .insert(schema.programs)
        .values({
          slug: p.id,
          trainerId: trainerId(p.trainer),
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          coverUrl: p.cover,
          coverFocus: p.focus ?? null,
          level: LEVEL[p.level],
          price: p.price,
          weeks: p.weeks,
          tags: p.tags,
          studentCount: p.students,
          ratingX100: Math.round(p.rating * 100),
          published: true,
        })
        .returning({ id: schema.programs.id });
      await tx.insert(schema.lessons).values(
        p.lessons.map((l, i) => ({
          programId: row.id,
          position: i + 1,
          title: l.title,
          durationSec: l.minutes * 60,
          isPreview: !!l.preview,
        })),
      );
    }

    console.log("→ Reviews");
    const reviewRows = mockReviews.flatMap((r, i) =>
      REVIEW_TARGETS[i].map((slug) => ({
        trainerId: trainerId(slug),
        clientId: r.name === "Ali Raza" ? ids.client : `seed_${slugify(r.name)}`,
        rating: r.rating,
        body: r.body,
        createdAt: new Date(r.date),
      })),
    );
    await tx.insert(schema.reviews).values(reviewRows);

    console.log("→ Notifications for the demo member");
    await tx.insert(schema.notifications).values(
      mockNotifications.map((n, i) => ({
        userId: ids.client,
        createdAt: new Date(Date.now() - [2, 3, 26, 50, 600, 380][i % 6] * 3_600_000),
        type: n.icon,
        title: n.title,
        body: n.body,
        readAt: n.unread ? null : new Date(),
      })),
    );
  });

  const counts = await db.execute<{ table: string; rows: string }>(sql`
    SELECT 'profiles' AS table, count(*)::text AS rows FROM profiles
    UNION ALL SELECT 'trainer_profiles', count(*)::text FROM trainer_profiles
    UNION ALL SELECT 'programs', count(*)::text FROM programs
    UNION ALL SELECT 'lessons', count(*)::text FROM lessons
    UNION ALL SELECT 'reviews', count(*)::text FROM reviews
    UNION ALL SELECT 'notifications', count(*)::text FROM notifications
    UNION ALL SELECT 'neon_auth users', count(*)::text FROM neon_auth."user"`);
  console.table(counts.rows);

  console.log("\nDemo accounts (password for all: %s)", DEMO_PASSWORD);
  for (const [role, acc] of Object.entries(DEMO_ACCOUNTS)) console.log(`  ${role.padEnd(8)} ${acc.email}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
