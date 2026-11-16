import { canCancel, canJoin } from "@/lib/booking/slots";
import { formatDay, formatTime } from "@/lib/format";

/** A booked 1:1 session, shaped for `SessionRow`. */
export type SessionView = {
  id: string;
  day: string;
  time: string;
  minutes: number;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
  joinable: boolean;
  cancellable: boolean;
  /** The other person: the coach for members, the member for coaches. */
  counterpart: { name: string; sub: string; img: string | null; focus?: string | null };
  /** Members: link to review the coach after a completed session. */
  reviewHref?: string;
};

export function toSessionView(
  row: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    status: "confirmed" | "cancelled" | "completed";
    price: number | null;
  },
  counterpart: SessionView["counterpart"],
  now: Date,
  reviewHref?: string,
): SessionView {
  const status =
    row.status === "cancelled" ? "cancelled" : row.status === "completed" || row.endsAt <= now ? "completed" : "upcoming";
  return {
    id: row.id,
    day: formatDay(row.startsAt, now),
    time: formatTime(row.startsAt),
    minutes: Math.round((row.endsAt.getTime() - row.startsAt.getTime()) / 60_000),
    price: row.price ?? 0,
    status,
    joinable: status === "upcoming" && canJoin(row.startsAt, row.endsAt, now),
    cancellable: status === "upcoming" && canCancel(row.startsAt, now),
    counterpart,
    reviewHref: status === "completed" ? reviewHref : undefined,
  };
}
