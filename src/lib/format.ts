import { DEFAULT_TIMEZONE } from "@/lib/booking/slots";

/** Date/time formatting for the UI. All times display in Pakistan time for now. */

const tz = DEFAULT_TIMEZONE;
const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
const shortDateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });

/** "Today, 12 Nov" / "Tomorrow, 13 Nov" / "Sat, 14 Nov" */
export function formatDay(d: Date, now = new Date()): string {
  const key = keyFmt.format(d);
  const short = shortDateFmt.format(d);
  if (key === keyFmt.format(now)) return `Today, ${short}`;
  if (key === keyFmt.format(new Date(now.getTime() + 86_400_000))) return `Tomorrow, ${short}`;
  if (key === keyFmt.format(new Date(now.getTime() - 86_400_000))) return `Yesterday, ${short}`;
  return dayFmt.format(d);
}

export const formatTime = (d: Date) => timeFmt.format(d);
export const formatShortDate = (d: Date) => shortDateFmt.format(d);
export const formatMonthYear = (d: Date) => monthYearFmt.format(d);

/** "Today" / "Yesterday" / "3 Nov" — for "last active" style columns. */
export function formatRecent(d: Date, now = new Date()): string {
  const key = keyFmt.format(d);
  if (key === keyFmt.format(now)) return "Today";
  if (key === keyFmt.format(new Date(now.getTime() - 86_400_000))) return "Yesterday";
  return shortDateFmt.format(d);
}
