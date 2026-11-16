import { Clock, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CancelSessionButton } from "@/components/cancel-session";
import { StatusPill } from "@/components/dashboard-ui";
import { PLACEHOLDER_PHOTO } from "@/lib/queries";
import type { SessionView } from "@/lib/sessions";
import { formatPrice } from "@/lib/utils";

/** One booked 1:1 session (member or coach view). */
export function SessionRow({ session: s }: { session: SessionView }) {
  return (
    <li className="flex flex-wrap items-center gap-4 p-4 sm:px-5" data-testid="session-row">
      <div className="w-28 shrink-0">
        <p className="text-sm font-semibold">{s.time}</p>
        <p className="text-xs text-muted-foreground">{s.day}</p>
      </div>
      <Image
        src={s.counterpart.img ?? PLACEHOLDER_PHOTO}
        alt=""
        width={44}
        height={44}
        className="size-11 rounded-full object-cover"
        style={{ objectPosition: s.counterpart.focus ?? undefined }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{s.counterpart.name}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Clock className="size-3" /> {s.minutes} min · {formatPrice(s.price)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {s.status !== "upcoming" && <StatusPill status={s.status} />}
        {s.status === "upcoming" &&
          (s.joinable ? (
            <Link
              href={`/call/${s.id}`}
              className="eyebrow inline-flex h-9 items-center gap-2 rounded-sm bg-brand px-4 text-[11px] text-brand-foreground hover:bg-brand/85"
            >
              <Video className="size-4" /> Join call
            </Link>
          ) : (
            <>
              <span className="hidden text-xs text-muted-foreground sm:block">Opens 10 min before</span>
              {s.cancellable ? (
                <CancelSessionButton bookingId={s.id} />
              ) : (
                <span className="text-xs text-muted-foreground" title="Cancellation closes 24 hours before the start">
                  Within 24h
                </span>
              )}
            </>
          ))}
        {s.reviewHref && (
          <Link href={s.reviewHref} className="eyebrow inline-flex h-9 items-center rounded-sm border px-3 text-[11px] hover:border-brand">
            Review
          </Link>
        )}
      </div>
    </li>
  );
}
