"use client";

import { CalendarDays, Clock, ShieldCheck, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { bookSession } from "@/actions/commerce";
import { PayDialog } from "@/components/pay-dialog";
import type { SlotDay } from "@/lib/booking/slots";
import { cn, formatPrice } from "@/lib/utils";

type Viewer = "member" | "guest" | "other";

export function BookingPanel({
  coach,
  days,
  zone,
  viewer,
}: {
  coach: { slug: string; name: string; sessionPrice: number; sessionMinutes: number };
  days: SlotDay[];
  zone: string;
  viewer: Viewer;
}) {
  const firstOpen = days.find((d) => d.slots.length)?.key ?? days[0]?.key;
  const [dayKey, setDayKey] = useState(firstOpen);
  const [slot, setSlot] = useState<{ iso: string; label: string } | null>(null);
  const active = days.find((d) => d.key === dayKey) ?? days[0];
  const anyOpen = days.some((d) => d.slots.length);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <p>
          <span className="display text-2xl">{formatPrice(coach.sessionPrice)}</span>
          <span className="text-sm text-muted-foreground"> / session</span>
        </p>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" /> {coach.sessionMinutes} min
        </span>
      </div>

      {!anyOpen ? (
        <p className="mt-6 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          {coach.name.split(" ")[0]} has no open slots in the next week. Check back soon.
        </p>
      ) : (
        <>
          <p className="eyebrow mt-6 mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3.5" /> Pick a day
          </p>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                data-testid="slot-day"
                data-open={d.slots.length > 0}
                onClick={() => {
                  setDayKey(d.key);
                  setSlot(null);
                }}
                className={cn(
                  "flex w-14 shrink-0 flex-col items-center rounded-md border py-2 transition-colors",
                  dayKey === d.key ? "border-brand bg-brand text-brand-foreground" : "hover:border-foreground/40",
                  !d.slots.length && dayKey !== d.key && "opacity-45",
                )}
              >
                <span className="eyebrow text-[10px]">{d.label}</span>
                <span className="mt-1 text-sm font-semibold">{d.date.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <p className="eyebrow mt-5 mb-3 text-[11px] text-muted-foreground">Available times ({zone})</p>
          {active?.slots.length ? (
            <div className="grid grid-cols-3 gap-2">
              {active.slots.map((s) => (
                <button
                  key={s.iso}
                  type="button"
                  data-testid="slot-time"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "h-10 rounded-md border text-sm transition-colors",
                    slot?.iso === s.iso ? "border-brand bg-brand/15 font-semibold" : "hover:border-foreground/40",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
              No slots on this day. Try another.
            </p>
          )}
        </>
      )}

      {viewer === "guest" ? (
        <Link
          href={`/auth/sign-in?redirectTo=${encodeURIComponent(`/trainers/${coach.slug}#book`)}`}
          className="eyebrow mt-5 flex h-12 w-full items-center justify-center rounded-sm bg-brand text-brand-foreground hover:bg-brand/85"
        >
          Sign in to book
        </Link>
      ) : viewer === "other" ? (
        <p className="mt-5 rounded-md bg-muted p-3 text-sm text-muted-foreground">Sessions can be booked from a member account.</p>
      ) : slot && active ? (
        <PayDialog
          title="Confirm your session"
          lines={[
            ["Coach", coach.name],
            ["When", `${active.label} ${active.date}, ${slot.label} ${zone}`],
            ["Length", `${coach.sessionMinutes} min live video`],
          ]}
          total={coach.sessionPrice}
          onPay={(idempotencyKey) => bookSession({ slug: coach.slug, startsAt: slot.iso, idempotencyKey })}
          success={{
            title: "Session booked",
            body: `${active.label} ${active.date} at ${slot.label} with ${coach.name}. You can join from your bookings 10 minutes before.`,
            href: "/app/bookings",
            cta: "View my bookings",
          }}
          trigger={
            <button type="button" className="eyebrow mt-5 h-12 w-full rounded-sm bg-brand text-brand-foreground hover:bg-brand/85">
              Book {slot.label}
            </button>
          }
        />
      ) : (
        <button type="button" disabled className="eyebrow mt-5 h-12 w-full rounded-sm bg-muted text-muted-foreground">
          Select a time
        </button>
      )}

      <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <Video className="size-3.5" /> Live video call in your browser
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-3.5" /> Free cancellation up to 24 hours before
        </li>
      </ul>
    </div>
  );
}
