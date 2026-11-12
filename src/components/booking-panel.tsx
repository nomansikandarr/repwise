"use client";

import { CalendarDays, Clock, ShieldCheck, Video } from "lucide-react";
import { useState } from "react";
import { PayDialog } from "@/components/pay-dialog";
import { slotDays, type Trainer } from "@/lib/mock";
import { cn, formatPrice } from "@/lib/utils";

export function BookingPanel({ trainer }: { trainer: Trainer }) {
  const [day, setDay] = useState(slotDays[0].key);
  const [slot, setSlot] = useState<string | null>(null);
  const active = slotDays.find((d) => d.key === day)!;

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <p>
          <span className="display text-2xl">{formatPrice(trainer.sessionPrice)}</span>
          <span className="text-sm text-muted-foreground"> / session</span>
        </p>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" /> {trainer.sessionMinutes} min
        </span>
      </div>

      <p className="eyebrow mt-6 mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <CalendarDays className="size-3.5" /> Pick a day
      </p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {slotDays.map((d) => (
          <button
            key={d.key}
            onClick={() => {
              setDay(d.key);
              setSlot(null);
            }}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center rounded-md border py-2 transition-colors",
              day === d.key ? "border-brand bg-brand text-brand-foreground" : "hover:border-foreground/40",
              !d.slots.length && day !== d.key && "opacity-45",
            )}
          >
            <span className="eyebrow text-[10px]">{d.label}</span>
            <span className="mt-1 text-sm font-semibold">{d.date.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <p className="eyebrow mt-5 mb-3 text-[11px] text-muted-foreground">Available times (PKT)</p>
      {active.slots.length ? (
        <div className="grid grid-cols-3 gap-2">
          {active.slots.map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={cn(
                "h-10 rounded-md border text-sm transition-colors",
                slot === s ? "border-brand bg-brand/15 font-semibold" : "hover:border-foreground/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          No slots on this day. Try another.
        </p>
      )}

      {slot ? (
        <PayDialog
          title="Confirm your session"
          lines={[
            ["Coach", trainer.name],
            ["When", `${active.label} ${active.date}, ${slot}`],
            ["Length", `${trainer.sessionMinutes} min live video`],
          ]}
          total={trainer.sessionPrice}
          successTitle="Session booked"
          successBody={`${active.label} ${active.date} at ${slot} with ${trainer.name}. You can join from your bookings 10 minutes before.`}
          successHref="/app/bookings"
          successCta="View my bookings"
          trigger={
            <button className="eyebrow mt-5 h-12 w-full rounded-sm bg-brand text-brand-foreground hover:bg-brand/85">
              Book {slot}
            </button>
          }
        />
      ) : (
        <button disabled className="eyebrow mt-5 h-12 w-full rounded-sm bg-muted text-muted-foreground">
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
