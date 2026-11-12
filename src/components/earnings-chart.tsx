import { earnings30 } from "@/lib/mock";

/** Simple CSS bar chart: net earnings per day, last 30 days (Rs thousands). */
export function EarningsChart({ height = 180 }: { height?: number }) {
  const max = Math.max(...earnings30);
  return (
    <div>
      <div className="flex items-end gap-1 sm:gap-1.5" style={{ height }}>
        {earnings30.map((v, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t-sm transition-colors ${i === earnings30.length - 1 ? "bg-brand" : "bg-brand/30 group-hover:bg-brand/70"}`}
              style={{ height: `${(v / max) * 100}%` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] whitespace-nowrap text-background group-hover:block">
              Rs {v}k
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>14 Oct</span>
        <span>28 Oct</span>
        <span>12 Nov</span>
      </div>
    </div>
  );
}
