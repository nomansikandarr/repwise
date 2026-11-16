/**
 * Booking slot engine (pure, no I/O, unit-tested).
 *
 * Coaches set weekly hours in their own timezone. We turn those rules into
 * concrete UTC start times for the next N days, skipping anything already
 * booked or too soon to book.
 */

export type AvailabilityRule = { weekday: number; startMinute: number; endMinute: number };

export const DEFAULT_TIMEZONE = "Asia/Karachi";
export const BOOKING_DAYS_AHEAD = 14;
export const BOOKING_LEAD_HOURS = 12;
export const CANCEL_WINDOW_HOURS = 24;

/** Offset (minutes) of `timeZone` from UTC at the given instant. */
function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/** Wall-clock time in `timeZone` → UTC instant (DST-safe two-pass). */
export function zonedToUtc(year: number, month: number, day: number, minuteOfDay: number, timeZone: string): Date {
  const naive = Date.UTC(year, month - 1, day, 0, minuteOfDay);
  let guess = naive - offsetMinutes(new Date(naive), timeZone) * 60_000;
  guess = naive - offsetMinutes(new Date(guess), timeZone) * 60_000;
  return new Date(guess);
}

/** Calendar date (y, m, d, weekday) of an instant in `timeZone`. */
export function zonedDate(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")), weekday };
}

export function openSlots(opts: {
  rules: AvailabilityRule[];
  /** Start times of confirmed bookings. */
  booked: Date[];
  timezone: string;
  sessionMinutes: number;
  now: Date;
  days?: number;
  leadHours?: number;
}): Date[] {
  const { rules, timezone, sessionMinutes, now, days = BOOKING_DAYS_AHEAD, leadHours = BOOKING_LEAD_HOURS } = opts;
  if (sessionMinutes <= 0) return [];
  const taken = new Set(opts.booked.map((d) => d.getTime()));
  const earliest = now.getTime() + leadHours * 3_600_000;
  const today = zonedDate(now, timezone);
  const slots: Date[] = [];

  for (let i = 0; i < days; i++) {
    // Noon UTC of the i-th calendar day avoids landing on the wrong date.
    const ref = new Date(Date.UTC(today.year, today.month - 1, today.day + i, 12));
    const { year, month, day } = { year: ref.getUTCFullYear(), month: ref.getUTCMonth() + 1, day: ref.getUTCDate() };
    const weekday = ref.getUTCDay();
    for (const rule of rules.filter((r) => r.weekday === weekday)) {
      for (let m = rule.startMinute; m + sessionMinutes <= rule.endMinute; m += sessionMinutes) {
        const start = zonedToUtc(year, month, day, m, timezone);
        if (start.getTime() >= earliest && !taken.has(start.getTime())) slots.push(start);
      }
    }
  }
  return slots.sort((a, b) => a.getTime() - b.getTime());
}

/** Either side may cancel only while the session is ≥24h away. */
export function canCancel(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() - now.getTime() >= CANCEL_WINDOW_HOURS * 3_600_000;
}

/** Join window: 10 minutes before start until the end. */
export function canJoin(startsAt: Date, endsAt: Date, now: Date): boolean {
  return now.getTime() >= startsAt.getTime() - 10 * 60_000 && now.getTime() <= endsAt.getTime();
}

export type SlotDay = { key: string; label: string; date: string; slots: { iso: string; label: string }[] };

/** Groups slots by calendar day in `timezone`, always returning `days` entries. */
export function groupByDay(slots: Date[], timezone: string, now: Date, days = 7): SlotDay[] {
  const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, weekday: "short" });
  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, day: "numeric", month: "short" });
  const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" });

  const result: SlotDay[] = [];
  for (let i = 0; i < days; i++) {
    const ref = new Date(now.getTime() + i * 86_400_000);
    result.push({ key: keyFmt.format(ref), label: dayFmt.format(ref), date: dateFmt.format(ref), slots: [] });
  }
  const byKey = new Map(result.map((d) => [d.key, d]));
  for (const s of slots) byKey.get(keyFmt.format(s))?.slots.push({ iso: s.toISOString(), label: timeFmt.format(s) });
  return result;
}

/** Short timezone label for the UI, e.g. "PKT". */
export function zoneLabel(timezone: string): string {
  return timezone === "Asia/Karachi" ? "PKT" : timezone === "Asia/Kolkata" ? "IST" : timezone;
}
