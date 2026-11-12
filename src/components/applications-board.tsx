"use client";

import { Check, Loader2, MapPin, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { decideApplication } from "@/app/admin/applications/actions";
import { Tag } from "@/components/bits";
import { StatusPill } from "@/components/dashboard-ui";
import { cn, formatPrice } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected";

export type Application = {
  id: string;
  name: string;
  city: string;
  avatar: string;
  headline: string;
  note: string;
  years: number;
  specialties: string[];
  price: number;
  applied: string;
  status: Status;
};

const FILTERS: Status[] = ["pending", "approved", "rejected"];

export function ApplicationsBoard({ initial }: { initial: Application[] }) {
  const [apps, setApps] = useState(initial);
  const [filter, setFilter] = useState<Status>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const visible = apps.filter((a) => a.status === filter);

  function decide(app: Application, decision: "approved" | "rejected") {
    setBusy(app.id);
    startTransition(async () => {
      const result = await decideApplication({ userId: app.id, decision });
      setBusy(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setApps((list) => list.map((a) => (a.id === app.id ? { ...a, status: decision } : a)));
      toast.success(`${app.name} ${decision}`);
    });
  }

  return (
    <>
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "eyebrow h-9 rounded-sm border px-3 text-[11px]",
              filter === f ? "border-brand bg-brand text-brand-foreground" : "text-muted-foreground hover:border-foreground/40",
            )}
          >
            {f} ({apps.filter((a) => a.status === f).length})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-20 text-center">
          <p className="display text-xl">All caught up</p>
          <p className="mt-2 text-sm text-muted-foreground">No {filter} applications.</p>
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {visible.map((a) => (
            <li key={a.id} className="rounded-lg border bg-card p-5" data-testid="application">
              <div className="flex items-start gap-4">
                <Image src={a.avatar} alt="" width={64} height={64} className="size-16 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="display text-lg">{a.name}</h2>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{a.headline}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {a.city || "City not set"} · Applied {a.applied}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-y py-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Experience</dt>
                  <dd className="mt-0.5 font-medium">{a.years} years</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Session price</dt>
                  <dd className="mt-0.5 font-medium">{formatPrice(a.price)}</dd>
                </div>
              </dl>
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{a.note}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.specialties.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
              {a.status === "pending" && (
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => decide(a, "approved")}
                    disabled={busy === a.id}
                    className="eyebrow inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-brand text-[11px] text-brand-foreground hover:bg-brand/85 disabled:opacity-60"
                  >
                    {busy === a.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Approve
                  </button>
                  <button
                    onClick={() => decide(a, "rejected")}
                    disabled={busy === a.id}
                    className="eyebrow inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border text-[11px] hover:border-destructive hover:text-destructive disabled:opacity-60"
                  >
                    <X className="size-4" /> Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
