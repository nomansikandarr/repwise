import "server-only";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, orders, profiles, programs } from "@/db/schema";
import { DEFAULT_TIMEZONE, zonedDate, zonedToUtc } from "@/lib/booking/slots";
import { formatMonthYear, formatRecent, formatShortDate } from "@/lib/format";
import { PLACEHOLDER_PHOTO } from "@/lib/queries";
import { toSessionView, type SessionView } from "@/lib/sessions";

/** Per-coach reads. Always called with the signed-in coach's own id. */

const DAY = 86_400_000;

function startOfMonth(now: Date) {
  const { year, month } = zonedDate(now, DEFAULT_TIMEZONE);
  return zonedToUtc(year, month, 1, 0, DEFAULT_TIMEZONE);
}

export type EarningsSummary = {
  monthGross: number;
  monthFee: number;
  monthNet: number;
  lifetimeNet: number;
  split: { programs: number; sessions: number };
  daily: { label: string; value: number }[];
};

export async function earningsSummary(trainerId: string, now = new Date()): Promise<EarningsSummary> {
  const monthStart = startOfMonth(now);
  const since = new Date(now.getTime() - 29 * DAY);
  const paid = and(eq(orders.trainerId, trainerId), eq(orders.status, "paid"));

  const [[month], [lifetime], byType, byDay] = await Promise.all([
    db
      .select({
        gross: sql<number>`coalesce(sum(${orders.amount}), 0)::int`,
        fee: sql<number>`coalesce(sum(${orders.platformFee}), 0)::int`,
        net: sql<number>`coalesce(sum(${orders.trainerNet}), 0)::int`,
      })
      .from(orders)
      .where(and(paid, gte(orders.createdAt, monthStart))),
    db
      .select({ net: sql<number>`coalesce(sum(${orders.trainerNet}), 0)::int` })
      .from(orders)
      .where(paid),
    db
      .select({ type: orders.type, net: sql<number>`coalesce(sum(${orders.trainerNet}), 0)::int` })
      .from(orders)
      .where(and(paid, gte(orders.createdAt, monthStart)))
      .groupBy(orders.type),
    db
      .select({
        day: sql<string>`to_char(${orders.createdAt} at time zone ${DEFAULT_TIMEZONE}, 'YYYY-MM-DD')`,
        net: sql<number>`sum(${orders.trainerNet})::int`,
      })
      .from(orders)
      .where(and(paid, gte(orders.createdAt, since)))
      .groupBy(sql`1`),
  ]);

  const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
  const perDay = new Map(byDay.map((d) => [d.day, d.net]));
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * DAY);
    return { label: formatShortDate(d), value: perDay.get(keyFmt.format(d)) ?? 0 };
  });

  return {
    monthGross: month.gross,
    monthFee: month.fee,
    monthNet: month.net,
    lifetimeNet: lifetime.net,
    split: {
      programs: byType.find((t) => t.type === "program")?.net ?? 0,
      sessions: byType.find((t) => t.type === "session")?.net ?? 0,
    },
    daily,
  };
}

export async function coachStats(trainerId: string, now = new Date()) {
  const weekAhead = new Date(now.getTime() + 7 * DAY);
  const todayEnd = (() => {
    const { year, month, day } = zonedDate(now, DEFAULT_TIMEZONE);
    return zonedToUtc(year, month, day, 24 * 60, DEFAULT_TIMEZONE);
  })();
  const [[active], [newThisMonth], upcoming] = await Promise.all([
    db
      .select({ n: sql<number>`count(distinct ${orders.clientId})::int` })
      .from(orders)
      .where(and(eq(orders.trainerId, trainerId), eq(orders.status, "paid"), gte(orders.createdAt, new Date(now.getTime() - 30 * DAY)))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(
        db
          .select({ clientId: orders.clientId, first: sql`min(${orders.createdAt})`.as("first") })
          .from(orders)
          .where(eq(orders.trainerId, trainerId))
          .groupBy(orders.clientId)
          .as("firsts"),
      )
      .where(sql`"first" >= ${startOfMonth(now).toISOString()}`),
    db
      .select({ startsAt: bookings.startsAt })
      .from(bookings)
      .where(and(eq(bookings.trainerId, trainerId), eq(bookings.status, "confirmed"), gte(bookings.startsAt, now))),
  ]);
  return {
    activeClients: active.n,
    newClientsThisMonth: newThisMonth.n,
    sessionsThisWeek: upcoming.filter((b) => b.startsAt < weekAhead).length,
    sessionsToday: upcoming.filter((b) => b.startsAt < todayEnd).length,
  };
}

export async function coachSessions(trainerId: string, now = new Date()): Promise<SessionView[]> {
  const rows = await db
    .select({
      id: bookings.id,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
      price: orders.amount,
      clientName: profiles.displayName,
      clientAvatar: profiles.avatarUrl,
    })
    .from(bookings)
    .innerJoin(profiles, eq(profiles.userId, bookings.clientId))
    .leftJoin(orders, eq(orders.id, bookings.orderId))
    .where(eq(bookings.trainerId, trainerId))
    .orderBy(asc(bookings.startsAt));
  return rows.map((r) =>
    toSessionView(r, { name: r.clientName, sub: "1:1 session", img: r.clientAvatar }, now),
  );
}

export async function recentOrders(trainerId: string, limit = 20) {
  const rows = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      type: orders.type,
      amount: orders.amount,
      fee: orders.platformFee,
      net: orders.trainerNet,
      status: orders.status,
      client: profiles.displayName,
      programTitle: programs.title,
    })
    .from(orders)
    .innerJoin(profiles, eq(profiles.userId, orders.clientId))
    .leftJoin(programs, eq(programs.id, orders.programId))
    .where(eq(orders.trainerId, trainerId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id.slice(0, 8),
    date: formatShortDate(r.createdAt),
    client: r.client,
    item: r.type === "program" ? (r.programTitle ?? "Program") : "1:1 session",
    type: r.type,
    gross: r.amount,
    fee: r.status === "paid" ? r.fee : 0,
    net: r.status === "paid" ? r.net : 0,
    status: r.status === "paid" ? "Paid" : "Refunded",
  }));
}

export async function coachClients(trainerId: string, now = new Date()) {
  const rows = await db
    .select({
      clientId: orders.clientId,
      name: profiles.displayName,
      city: profiles.city,
      avatar: profiles.avatarUrl,
      since: sql<Date>`min(${orders.createdAt})`.mapWith((v: string) => new Date(v)),
      last: sql<Date>`max(${orders.createdAt})`.mapWith((v: string) => new Date(v)),
      programs: sql<number>`count(*) filter (where ${orders.type} = 'program' and ${orders.status} = 'paid')::int`,
      sessions: sql<number>`count(*) filter (where ${orders.type} = 'session' and ${orders.status} = 'paid')::int`,
      spent: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} = 'paid'), 0)::int`,
    })
    .from(orders)
    .innerJoin(profiles, eq(profiles.userId, orders.clientId))
    .where(eq(orders.trainerId, trainerId))
    .groupBy(orders.clientId, profiles.displayName, profiles.city, profiles.avatarUrl)
    .orderBy(desc(sql`max(${orders.createdAt})`));
  return rows.map((r) => ({
    ...r,
    avatar: r.avatar ?? PLACEHOLDER_PHOTO,
    city: r.city ?? "",
    since: formatMonthYear(r.since),
    last: formatRecent(r.last, now),
  }));
}

/** Net earned per program (paid orders only), keyed by program slug. */
export async function netByProgram(trainerId: string): Promise<Map<string, number>> {
  const rows = await db
    .select({ slug: programs.slug, net: sql<number>`coalesce(sum(${orders.trainerNet}), 0)::int` })
    .from(orders)
    .innerJoin(programs, eq(programs.id, orders.programId))
    .where(and(eq(orders.trainerId, trainerId), eq(orders.status, "paid"), eq(orders.type, "program")))
    .groupBy(programs.slug);
  return new Map(rows.map((r) => [r.slug, r.net]));
}
