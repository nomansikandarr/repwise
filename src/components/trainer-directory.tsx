"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { TrainerCard } from "@/components/cards";
import { SPECIALTIES, type Trainer } from "@/lib/mock";
import { cn } from "@/lib/utils";

const PRICE = [
  { label: "Any price", max: Infinity },
  { label: "Under Rs 3,000", max: 2999 },
  { label: "Under Rs 3,500", max: 3499 },
];

const SORT = ["Top rated", "Price: low to high", "Most experienced"] as const;

export function TrainerDirectory({ trainers }: { trainers: Trainer[] }) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [sort, setSort] = useState<(typeof SORT)[number]>("Top rated");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainers
      .filter((t) => !specialty || t.specialties.includes(specialty))
      .filter((t) => t.sessionPrice <= PRICE[price].max)
      .filter((t) => !q || `${t.name} ${t.city} ${t.headline} ${t.specialties.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "Top rated" ? b.rating - a.rating || b.reviews - a.reviews : sort === "Price: low to high" ? a.sessionPrice - b.sessionPrice : b.years - a.years,
      );
  }, [trainers, query, specialty, price, sort]);

  const selectClass = "h-11 rounded-sm border bg-background px-3 text-sm outline-none focus:border-brand";

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city or goal (e.g. Lahore, cricket)"
            className="h-11 w-full rounded-sm border bg-background pr-4 pl-11 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
          />
        </label>
        <div className="flex gap-3">
          <select aria-label="Price" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={cn(selectClass, "flex-1")}>
            {PRICE.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label}
              </option>
            ))}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as (typeof SORT)[number])} className={cn(selectClass, "flex-1")}>
            {SORT.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <SlidersHorizontal className="mt-2 size-4 shrink-0 text-muted-foreground" />
        {[null, ...SPECIALTIES].map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => setSpecialty(s)}
            className={cn(
              "eyebrow h-9 shrink-0 rounded-sm border px-3 text-[11px] transition-colors",
              specialty === s ? "border-brand bg-brand text-brand-foreground" : "text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {s ?? "All"}
          </button>
        ))}
      </div>

      <p className="mt-8 mb-4 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "coach" : "coaches"} available
      </p>

      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((t) => (
            <TrainerCard key={t.slug} trainer={t} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center">
          <p className="display text-xl">No coaches match</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different goal or clear the filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setSpecialty(null);
              setPrice(0);
            }}
            className="eyebrow mt-6 h-10 rounded-sm bg-brand px-5 text-brand-foreground"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
