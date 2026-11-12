import { Skeleton } from "@/components/ui/skeleton";

/** Presentational dashboard building blocks. No server imports, so client components can use them too. */

/** Placeholder shown while an area's role gate checks the session. */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-lg" />
    </div>
  );
}

export function PageTitle({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-3xl sm:text-4xl">{title}</h1>
        {body && <p className="mt-2 text-muted-foreground">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={accent ? "rounded-lg bg-brand p-5 text-brand-foreground" : "rounded-lg border bg-card p-5"}>
      <p className={`eyebrow text-[11px] ${accent ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>
      <p className="display mt-3 text-3xl">{value}</p>
      {hint && <p className={`mt-2 text-xs ${accent ? "opacity-80" : "text-muted-foreground"}`}>{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border bg-card ${className ?? ""}`}>
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="eyebrow text-xs">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    {
      upcoming: "bg-brand/15 text-lime",
      paid: "bg-brand/15 text-lime",
      approved: "bg-brand/15 text-lime",
      published: "bg-brand/15 text-lime",
      completed: "bg-muted text-muted-foreground",
      draft: "bg-muted text-muted-foreground",
      pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      cancelled: "bg-destructive/15 text-destructive",
      refunded: "bg-destructive/15 text-destructive",
      rejected: "bg-destructive/15 text-destructive",
    }[status.toLowerCase()] ?? "bg-muted text-muted-foreground";
  return <span className={`eyebrow inline-flex rounded-sm px-2 py-1 text-[10px] ${tone}`}>{status}</span>;
}
