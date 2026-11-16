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
import { openSlots } from "../src/lib/booking/slots";
import { splitFee } from "../src/lib/payments";
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
    // Keep real (non-demo) users' profiles across re-seeds so they aren't
    // sent back through onboarding. Their orders/bookings are demo data and reset.
    // Accounts on @repwise.test are demo or e2e-test accounts: never preserved.
    const testAccounts = await tx.execute<{ id: string }>(sql`SELECT id::text FROM neon_auth."user" WHERE email LIKE '%@repwise.test'`);
    const demoIds = new Set([...Object.values(ids), ...testAccounts.rows.map((r) => r.id)]);
    const isReal = (userId: string) => !userId.startsWith("seed_") && !demoIds.has(userId);
    const keptProfiles = (await tx.select().from(schema.profiles)).filter((p) => isReal(p.userId));
    const keptCoaches = (await tx.select().from(schema.trainerProfiles)).filter((p) => isReal(p.userId));
    const keptHours = (await tx.select().from(schema.availabilityRules)).filter((r) => isReal(r.trainerId));

    console.log("→ Clearing app tables");
    await tx.execute(sql`TRUNCATE profiles, notifications, orders, enrollments, lesson_progress, bookings, availability_rules CASCADE`);

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

    if (keptProfiles.length) {
      console.log(`→ Restoring ${keptProfiles.length} real user profile(s)`);
      await tx.insert(schema.profiles).values(keptProfiles);
      if (keptCoaches.length) await tx.insert(schema.trainerProfiles).values(keptCoaches);
      if (keptHours.length) await tx.insert(schema.availabilityRules).values(keptHours);
    }

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

    /* ---------------- Availability, orders, enrollments, bookings ---------------- */
    const now = new Date();
    const HOUR = 3_600_000;
    const DAY = 24 * HOUR;
    const at = (h: number, m = 0) => h * 60 + m;

    console.log("→ Availability");
    // [weekday (0 = Sun), start, end] in the coach's timezone (Asia/Karachi).
    const HAMZA_HOURS: [number, number, number][] = [
      [1, at(6), at(9)], [1, at(19), at(22)],
      [2, at(19), at(22)],
      [3, at(6), at(9)], [3, at(19), at(22)],
      [4, at(19), at(22)],
      [5, at(6), at(8)], [5, at(20, 30), at(22)],
      [6, at(6), at(12)], [6, at(17), at(21)],
    ];
    const DEFAULT_HOURS: [number, number, number][] = [
      [1, at(18), at(21)], [2, at(18), at(21)], [3, at(6), at(9)], [4, at(18), at(21)], [6, at(7), at(12)],
    ];
    const rulesFor = (slug: string) => (slug === "hamza-sheikh" ? HAMZA_HOURS : DEFAULT_HOURS);
    await tx.insert(schema.availabilityRules).values(
      trainers.flatMap((t) =>
        rulesFor(t.slug).map(([weekday, startMinute, endMinute]) => ({ trainerId: trainerId(t.slug), weekday, startMinute, endMinute })),
      ),
    );

    // Program + lesson ids by slug/position.
    const programRows = await tx.select({ id: schema.programs.id, slug: schema.programs.slug, price: schema.programs.price, trainerId: schema.programs.trainerId }).from(schema.programs);
    const programBySlug = new Map(programRows.map((p) => [p.slug, p]));
    const lessonRows = await tx.select({ id: schema.lessons.id, programId: schema.lessons.programId, position: schema.lessons.position }).from(schema.lessons);

    let seq = 0;
    const addOrder = async (o: { clientId: string; trainerId: string; type: "program" | "session"; programId?: string; amount: number; createdAt: Date; status?: "paid" | "refunded" }) => {
      const { fee, net } = splitFee(o.amount);
      const [row] = await tx
        .insert(schema.orders)
        .values({ ...o, platformFee: fee, trainerNet: net, idempotencyKey: `seed-${++seq}`, status: o.status ?? "paid" })
        .returning({ id: schema.orders.id });
      return row.id;
    };
    const enroll = async (clientId: string, slug: string, createdAt: Date, lessonsDone: number) => {
      const p = programBySlug.get(slug)!;
      const orderId = await addOrder({ clientId, trainerId: p.trainerId, type: "program", programId: p.id, amount: p.price, createdAt });
      await tx.insert(schema.enrollments).values({ clientId, programId: p.id, orderId, createdAt });
      const done = lessonRows.filter((l) => l.programId === p.id && l.position <= lessonsDone);
      if (done.length) await tx.insert(schema.lessonProgress).values(done.map((l) => ({ clientId, lessonId: l.id, completedAt: createdAt })));
    };
    const book = async (b: { clientId: string; slug: string; startsAt: Date; status?: "confirmed" | "cancelled" | "completed"; orderStatus?: "paid" | "refunded"; paidAt?: Date }) => {
      const t = trainers.find((x) => x.slug === b.slug)!;
      const orderId = await addOrder({
        clientId: b.clientId,
        trainerId: trainerId(b.slug),
        type: "session",
        amount: t.sessionPrice,
        createdAt: b.paidAt ?? new Date(b.startsAt.getTime() - 3 * DAY),
        status: b.orderStatus,
      });
      await tx.insert(schema.bookings).values({
        trainerId: trainerId(b.slug),
        clientId: b.clientId,
        startsAt: b.startsAt,
        endsAt: new Date(b.startsAt.getTime() + t.sessionMinutes * 60_000),
        status: b.status ?? "confirmed",
        orderId,
        cancelledBy: b.status === "cancelled" ? b.clientId : null,
      });
    };
    const futureSlots = (slug: string) => {
      const t = trainers.find((x) => x.slug === slug)!;
      return openSlots({
        rules: rulesFor(slug).map(([weekday, startMinute, endMinute]) => ({ weekday, startMinute, endMinute })),
        booked: [],
        timezone: "Asia/Karachi",
        sessionMinutes: t.sessionMinutes,
        now,
      });
    };
    /** A past start time on the hour, `daysAgo` days back at `hourPkt` Pakistan time. */
    const pastAt = (daysAgo: number, hourPkt: number) => {
      const d = new Date(now.getTime() - daysAgo * DAY);
      d.setUTCHours(hourPkt - 5, 0, 0, 0);
      return d;
    };

    console.log("→ Demo member: programs, progress, bookings");
    await enroll(ids.client, "desi-strength-12", new Date(now.getTime() - 40 * DAY), 6);
    await enroll(ids.client, "desk-back-reset", new Date(now.getTime() - 35 * DAY), 6);
    await enroll(ids.client, "daal-roti-macros", new Date(now.getTime() - 20 * DAY), 2);

    const hamzaSlots = futureSlots("hamza-sheikh");
    await book({ clientId: ids.client, slug: "hamza-sheikh", startsAt: hamzaSlots[1], paidAt: new Date(now.getTime() - DAY) });
    await book({ clientId: ids.client, slug: "usman-tariq", startsAt: futureSlots("usman-tariq")[3], paidAt: new Date(now.getTime() - 2 * HOUR) });
    await book({ clientId: ids.client, slug: "hamza-sheikh", startsAt: pastAt(7, 19), status: "completed" });
    await book({ clientId: ids.client, slug: "rohan-mehta", startsAt: pastAt(17, 8), status: "completed" });
    await book({ clientId: ids.client, slug: "bilal-ahmed", startsAt: pastAt(25, 17), status: "cancelled", orderStatus: "refunded" });

    console.log("→ A month of sales for Hamza");
    const buyers = mockReviews.filter((r) => r.name !== "Ali Raza").map((r) => `seed_${slugify(r.name)}`);
    await book({ clientId: buyers[0], slug: "hamza-sheikh", startsAt: hamzaSlots[0], paidAt: new Date(now.getTime() - 5 * HOUR) });
    await book({ clientId: buyers[3], slug: "hamza-sheikh", startsAt: hamzaSlots[3], paidAt: new Date(now.getTime() - 30 * HOUR) });
    const owned = new Set<string>();
    for (let i = 0; i < 24; i++) {
      const client = buyers[i % buyers.length];
      const daysAgo = ((i * 7) % 28) + 1;
      const program = i % 3 === 0 ? "desi-strength-12" : i % 3 === 2 ? "daal-roti-macros" : null;
      if (program && !owned.has(`${client}:${program}`)) {
        owned.add(`${client}:${program}`);
        await enroll(client, program, new Date(now.getTime() - daysAgo * DAY - (i % 6) * HOUR), 1 + (i % 5));
      } else {
        await book({ clientId: client, slug: "hamza-sheikh", startsAt: pastAt(daysAgo, 6 + (i % 4)), status: "completed" });
      }
    }
  });

  const counts = await db.execute<{ table: string; rows: string }>(sql`
    SELECT 'profiles' AS table, count(*)::text AS rows FROM profiles
    UNION ALL SELECT 'trainer_profiles', count(*)::text FROM trainer_profiles
    UNION ALL SELECT 'programs', count(*)::text FROM programs
    UNION ALL SELECT 'lessons', count(*)::text FROM lessons
    UNION ALL SELECT 'reviews', count(*)::text FROM reviews
    UNION ALL SELECT 'notifications', count(*)::text FROM notifications
    UNION ALL SELECT 'availability_rules', count(*)::text FROM availability_rules
    UNION ALL SELECT 'orders', count(*)::text FROM orders
    UNION ALL SELECT 'enrollments', count(*)::text FROM enrollments
    UNION ALL SELECT 'lesson_progress', count(*)::text FROM lesson_progress
    UNION ALL SELECT 'bookings', count(*)::text FROM bookings
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
