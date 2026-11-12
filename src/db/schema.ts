import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Auth users live in Neon Auth's `neon_auth` schema (managed by Neon).
 * We reference them by id (`userId: text`) without a cross-schema FK so
 * our tables stay decoupled from Neon's internal layout. Seeded demo
 * people that never sign in use ids prefixed with `seed_`.
 *
 * Money is stored as whole Pakistani rupees (integer).
 * Ratings are stored ×100 as integers (4.85 → 485).
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const roleEnum = pgEnum("role", ["client", "trainer", "admin"]);
export const trainerStatusEnum = pgEnum("trainer_status", ["pending", "approved", "rejected"]);
export const programLevelEnum = pgEnum("program_level", ["beginner", "intermediate", "advanced"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled", "completed"]);
export const orderTypeEnum = pgEnum("order_type", ["program", "session"]);
export const orderStatusEnum = pgEnum("order_status", ["paid", "refunded"]);

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  role: roleEnum("role").notNull().default("client"),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  city: text("city"),
  timezone: text("timezone").notNull().default("Asia/Karachi"),
  goals: text("goals").array().notNull().default(sql`'{}'::text[]`),
  onboarded: boolean("onboarded").notNull().default(false),
  ...timestamps,
});

export const trainerProfiles = pgTable(
  "trainer_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    headline: text("headline").notNull(),
    bio: text("bio").notNull(),
    specialties: text("specialties").array().notNull().default(sql`'{}'::text[]`),
    languages: text("languages").array().notNull().default(sql`'{}'::text[]`),
    yearsExperience: smallint("years_experience").notNull().default(0),
    sessionPrice: integer("session_price").notNull().default(3000),
    sessionMinutes: smallint("session_minutes").notNull().default(60),
    photoUrl: text("photo_url"),
    /** CSS object-position for the photo crop, e.g. "50% 20%". */
    photoFocus: text("photo_focus"),
    badge: text("badge"),
    /** Admin's note on the application (reason for approval/rejection). */
    applicationNote: text("application_note"),
    clientCount: integer("client_count").notNull().default(0),
    status: trainerStatusEnum("status").notNull().default("pending"),
    ratingX100: integer("rating_x100").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("trainer_profiles_slug_idx").on(t.slug),
    index("trainer_profiles_status_idx").on(t.status),
  ],
);

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => trainerProfiles.userId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull(),
    coverUrl: text("cover_url"),
    coverFocus: text("cover_focus"),
    level: programLevelEnum("level").notNull().default("beginner"),
    price: integer("price").notNull(),
    weeks: smallint("weeks").notNull().default(4),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    studentCount: integer("student_count").notNull().default(0),
    ratingX100: integer("rating_x100").notNull().default(0),
    published: boolean("published").notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("programs_slug_idx").on(t.slug), index("programs_trainer_idx").on(t.trainerId)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    imagekitFileId: text("imagekit_file_id"),
    videoPath: text("video_path"),
    durationSec: integer("duration_sec"),
    isPreview: boolean("is_preview").notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("lessons_program_position_idx").on(t.programId, t.position)],
);

export const availabilityRules = pgTable(
  "availability_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => trainerProfiles.userId, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(), // 0 = Sunday, in trainer's timezone
    startMinute: smallint("start_minute").notNull(),
    endMinute: smallint("end_minute").notNull(),
  },
  (t) => [
    index("availability_trainer_idx").on(t.trainerId),
    check("availability_weekday_chk", sql`${t.weekday} between 0 and 6`),
    check(
      "availability_range_chk",
      sql`${t.startMinute} >= 0 and ${t.endMinute} <= 1440 and ${t.startMinute} < ${t.endMinute}`,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: text("client_id").notNull(),
    trainerId: text("trainer_id").notNull(),
    type: orderTypeEnum("type").notNull(),
    programId: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(),
    platformFee: integer("platform_fee").notNull(),
    trainerNet: integer("trainer_net").notNull(),
    status: orderStatusEnum("status").notNull().default("paid"),
    idempotencyKey: text("idempotency_key").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_idempotency_idx").on(t.idempotencyKey),
    index("orders_trainer_idx").on(t.trainerId, t.createdAt),
    index("orders_client_idx").on(t.clientId),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => trainerProfiles.userId, { onDelete: "cascade" }),
    clientId: text("client_id").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: bookingStatusEnum("status").notNull().default("confirmed"),
    streamCallId: text("stream_call_id"),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    cancelledBy: text("cancelled_by"),
    ...timestamps,
  },
  (t) => [
    // Prevents double-booking a trainer's slot.
    uniqueIndex("bookings_trainer_slot_idx")
      .on(t.trainerId, t.startsAt)
      .where(sql`${t.status} = 'confirmed'`),
    index("bookings_client_idx").on(t.clientId, t.startsAt),
  ],
);

export const enrollments = pgTable(
  "enrollments",
  {
    clientId: text("client_id").notNull(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [primaryKey({ columns: [t.clientId, t.programId] })],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    clientId: text("client_id").notNull(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.clientId, t.lessonId] })],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => trainerProfiles.userId, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    body: text("body").notNull().default(""),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("reviews_trainer_client_idx").on(t.trainerId, t.clientId),
    check("reviews_rating_chk", sql`${t.rating} between 1 and 5`),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export type Profile = typeof profiles.$inferSelect;
export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type ProgramRow = typeof programs.$inferSelect;
export type LessonRow = typeof lessons.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
