import { formatPrice } from "@/lib/utils";

/** CSS bar chart of net earnings per day (oldest → today). */
export function EarningsChart({ data, height = 180 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const empty = data.every((d) => d.value === 0);
  return (
    <div>
      <div className="relative flex items-end gap-1 sm:gap-1.5" style={{ height }}>
        {empty && (
          <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">No sales in the last 30 days yet.</p>
        )}
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t-sm transition-colors ${i === data.length - 1 ? "bg-brand" : "bg-brand/30 group-hover:bg-brand/70"}`}
              style={{ height: `${Math.max(d.value ? 3 : 0, (d.value / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] whitespace-nowrap text-background group-hover:block">
              {d.label}: {formatPrice(d.value)}
            </span>
          </div>
        ))}
      </div>
      {data.length > 0 && (
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{data[0].label}</span>
          <span>{data[Math.floor(data.length / 2)].label}</span>
          <span>{data[data.length - 1].label}</span>
        </div>
      )}
    </div>
  );
}
