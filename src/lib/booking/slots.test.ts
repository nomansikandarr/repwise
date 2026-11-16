import { describe, expect, it } from "vitest";
import { canCancel, canJoin, groupByDay, openSlots, zonedToUtc } from "./slots";

const KHI = "Asia/Karachi"; // UTC+5, no DST

describe("zonedToUtc", () => {
  it("converts Karachi wall time to UTC", () => {
    expect(zonedToUtc(2026, 11, 12, 19 * 60 + 30, KHI).toISOString()).toBe("2026-11-12T14:30:00.000Z");
  });

  it("handles DST zones on both sides of the switch", () => {
    // London: GMT in winter, BST (UTC+1) in summer.
    expect(zonedToUtc(2026, 1, 15, 9 * 60, "Europe/London").toISOString()).toBe("2026-01-15T09:00:00.000Z");
    expect(zonedToUtc(2026, 7, 15, 9 * 60, "Europe/London").toISOString()).toBe("2026-07-15T08:00:00.000Z");
  });
});

describe("openSlots", () => {
  // Thursday 12 Nov 2026, 09:00 PKT.
  const now = new Date("2026-11-12T04:00:00Z");
  const thursdayEvening = [{ weekday: 4, startMinute: 19 * 60, endMinute: 22 * 60 }];

  it("splits a rule into session-length slots that fit before the range ends", () => {
    const slots = openSlots({ rules: thursdayEvening, booked: [], timezone: KHI, sessionMinutes: 60, now, days: 1, leadHours: 0 });
    expect(slots.map((s) => s.toISOString())).toEqual([
      "2026-11-12T14:00:00.000Z", // 7 PM
      "2026-11-12T15:00:00.000Z", // 8 PM
      "2026-11-12T16:00:00.000Z", // 9 PM (ends exactly at 10 PM)
    ]);
  });

  it("drops slots that don't fit completely", () => {
    const slots = openSlots({ rules: thursdayEvening, booked: [], timezone: KHI, sessionMinutes: 90, now, days: 1, leadHours: 0 });
    expect(slots).toHaveLength(2); // 7:00 and 8:30; 10:00 would overrun
  });

  it("excludes booked slots", () => {
    const booked = [new Date("2026-11-12T15:00:00Z")];
    const slots = openSlots({ rules: thursdayEvening, booked, timezone: KHI, sessionMinutes: 60, now, days: 1, leadHours: 0 });
    expect(slots.map((s) => s.toISOString())).not.toContain("2026-11-12T15:00:00.000Z");
    expect(slots).toHaveLength(2);
  });

  it("respects the minimum lead time", () => {
    const lateNow = new Date("2026-11-12T03:30:00Z"); // 8:30 AM; 12h lead → from 8:30 PM
    const slots = openSlots({ rules: thursdayEvening, booked: [], timezone: KHI, sessionMinutes: 60, now: lateNow, days: 1 });
    expect(slots.map((s) => s.toISOString())).toEqual(["2026-11-12T16:00:00.000Z"]);
  });

  it("repeats weekly across the window", () => {
    const slots = openSlots({ rules: thursdayEvening, booked: [], timezone: KHI, sessionMinutes: 60, now, days: 14, leadHours: 0 });
    expect(slots).toHaveLength(6); // two Thursdays × 3
  });

  it("returns nothing without rules", () => {
    expect(openSlots({ rules: [], booked: [], timezone: KHI, sessionMinutes: 60, now })).toEqual([]);
  });
});

describe("canCancel / canJoin", () => {
  const start = new Date("2026-11-14T14:00:00Z");
  const end = new Date("2026-11-14T15:00:00Z");

  it("allows cancelling only 24h or more before the start", () => {
    expect(canCancel(start, new Date("2026-11-13T14:00:00Z"))).toBe(true);
    expect(canCancel(start, new Date("2026-11-13T14:00:01Z"))).toBe(false);
  });

  it("opens the call 10 minutes early and closes at the end", () => {
    expect(canJoin(start, end, new Date("2026-11-14T13:49:59Z"))).toBe(false);
    expect(canJoin(start, end, new Date("2026-11-14T13:50:00Z"))).toBe(true);
    expect(canJoin(start, end, new Date("2026-11-14T15:00:01Z"))).toBe(false);
  });
});

describe("groupByDay", () => {
  it("returns one entry per day and puts slots on their local date", () => {
    const now = new Date("2026-11-12T04:00:00Z");
    const days = groupByDay([new Date("2026-11-13T14:00:00Z")], KHI, now, 3);
    expect(days.map((d) => d.label)).toEqual(["Thu", "Fri", "Sat"]);
    expect(days[1].slots).toEqual([{ iso: "2026-11-13T14:00:00.000Z", label: "7:00 PM" }]);
  });
});
