import { Clock, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusPill } from "@/components/dashboard-shell";
import { getTrainer, type Booking } from "@/lib/mock";
import { formatPrice } from "@/lib/utils";

/** One booked session. `view` decides whose name/photo is shown. */
export function SessionRow({ booking, view }: { booking: Booking; view: "client" | "trainer" }) {
  const trainer = getTrainer(booking.trainer)!;
  const who =
    view === "client"
      ? { name: trainer.name, sub: trainer.headline, img: trainer.photo, focus: trainer.focus }
      : { name: booking.client, sub: `1:1 session · ${booking.minutes} min`, img: booking.clientAvatar, focus: undefined };

  return (
    <li className="flex flex-wrap items-center gap-4 p-4 sm:px-5">
      <div className="w-24 shrink-0">
        <p className="text-sm font-semibold">{booking.time}</p>
        <p className="text-xs text-muted-foreground">{booking.day}</p>
      </div>
      <Image src={who.img} alt="" width={44} height={44} className="size-11 rounded-full object-cover" style={{ objectPosition: who.focus }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{who.name}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Clock className="size-3" /> {booking.minutes} min · {formatPrice(booking.price)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {booking.status !== "upcoming" && <StatusPill status={booking.status} />}
        {booking.status === "upcoming" &&
          (booking.joinable ? (
            <Link
              href={`/call/${booking.id}`}
              className="eyebrow inline-flex h-9 items-center gap-2 rounded-sm bg-brand px-4 text-[11px] text-brand-foreground hover:bg-brand/85"
            >
              <Video className="size-4" /> Join call
            </Link>
          ) : (
            <>
              <span className="hidden text-xs text-muted-foreground sm:block">Opens 10 min before</span>
              <button className="eyebrow h-9 rounded-sm border px-3 text-[11px] text-muted-foreground hover:border-destructive hover:text-destructive">
                Cancel
              </button>
            </>
          ))}
        {booking.status === "completed" && view === "client" && (
          <button className="eyebrow h-9 rounded-sm border px-3 text-[11px] hover:border-brand">Review</button>
        )}
      </div>
    </li>
  );
}
