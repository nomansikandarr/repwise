"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAvailability } from "@/actions/learning";
import { Panel } from "@/components/dashboard-ui";
import { Field, PrimaryButton, SelectInput, TextInput } from "@/components/form";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEKDAY = [1, 2, 3, 4, 5, 6, 0]; // UI order → JS weekday

const TIMES = Array.from({ length: 49 }, (_, i) => i * 30); // 00:00 … 24:00
function label(min: number) {
  if (min === 1440) return "12:00 AM (midnight)";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function AvailabilityForm({
  initial,
  sessionMinutes,
  price,
  timezoneLabel,
}: {
  initial: { weekday: number; startMinute: number; endMinute: number }[];
  sessionMinutes: number;
  price: number;
  timezoneLabel: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [minutes, setMinutes] = useState(sessionMinutes);
  const [rupees, setRupees] = useState(price);
  const [days, setDays] = useState(() =>
    WEEKDAY.map((wd) => {
      const ranges = initial
        .filter((r) => r.weekday === wd)
        .sort((a, b) => a.startMinute - b.startMinute)
        .map((r) => ({ start: r.startMinute, end: r.endMinute }));
      return { on: ranges.length > 0, ranges: ranges.length ? ranges : [{ start: 18 * 60, end: 21 * 60 }] };
    }),
  );

  const update = (i: number, fn: (d: (typeof days)[number]) => (typeof days)[number]) =>
    setDays((all) => all.map((d, j) => (j === i ? fn(d) : d)));

  function save() {
    const rules = days.flatMap((d, i) =>
      d.on ? d.ranges.map((r) => ({ weekday: WEEKDAY[i], startMinute: r.start, endMinute: r.end })) : [],
    );
    start(async () => {
      const result = await saveAvailability({ rules, sessionMinutes: minutes, price: rupees });
      if (!result.ok) return void toast.error(result.error);
      toast.success("Availability saved");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title={`Weekly hours (${timezoneLabel})`}
        action={
          <PrimaryButton type="button" onClick={save} disabled={pending} className="h-9 px-4 text-[11px]">
            {pending && <Loader2 className="size-4 animate-spin" />} Save changes
          </PrimaryButton>
        }
      >
        <ul className="divide-y">
          {days.map((d, i) => (
            <li key={DAYS[i]} className="flex flex-wrap items-start gap-4 p-4 sm:px-5">
              <label className="flex w-36 shrink-0 items-center gap-3 pt-1.5">
                <Switch checked={d.on} onCheckedChange={(on) => update(i, (x) => ({ ...x, on }))} aria-label={`${DAYS[i]} available`} />
                <span className={d.on ? "font-medium" : "text-muted-foreground"}>{DAYS[i]}</span>
              </label>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {d.on ? (
                  <>
                    {d.ranges.map((r, k) => (
                      <div key={k} className="flex flex-wrap items-center gap-2">
                        <select
                          aria-label={`${DAYS[i]} start`}
                          value={r.start}
                          onChange={(e) => update(i, (x) => ({ ...x, ranges: x.ranges.map((y, n) => (n === k ? { ...y, start: Number(e.target.value) } : y)) }))}
                          className="h-9 rounded-sm border bg-background px-2 text-sm outline-none focus:border-brand"
                        >
                          {TIMES.slice(0, -1).map((t) => (
                            <option key={t} value={t}>
                              {label(t)}
                            </option>
                          ))}
                        </select>
                        <span className="text-muted-foreground">–</span>
                        <select
                          aria-label={`${DAYS[i]} end`}
                          value={r.end}
                          onChange={(e) => update(i, (x) => ({ ...x, ranges: x.ranges.map((y, n) => (n === k ? { ...y, end: Number(e.target.value) } : y)) }))}
                          className="h-9 rounded-sm border bg-background px-2 text-sm outline-none focus:border-brand"
                        >
                          {TIMES.slice(1).map((t) => (
                            <option key={t} value={t}>
                              {label(t)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label="Remove hours"
                          onClick={() => update(i, (x) => (x.ranges.length > 1 ? { ...x, ranges: x.ranges.filter((_, n) => n !== k) } : { ...x, on: false }))}
                          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        update(i, (x) => {
                          const last = x.ranges[x.ranges.length - 1];
                          const startAt = Math.min(last ? last.end + 60 : 18 * 60, 22 * 60);
                          return { ...x, ranges: [...x.ranges, { start: startAt, end: Math.min(startAt + 120, 1440) }] };
                        })
                      }
                      className="inline-flex h-9 w-fit items-center gap-1 rounded-sm border border-dashed px-3 text-sm text-muted-foreground hover:border-brand hover:text-foreground"
                    >
                      <Plus className="size-3.5" /> Add hours
                    </button>
                  </>
                ) : (
                  <span className="pt-1.5 text-sm text-muted-foreground">Day off</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-6">
        <Panel title="Session settings">
          <div className="space-y-5 p-5">
            <Field label="Session length">
              <SelectInput value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </SelectInput>
            </Field>
            <Field label="Price per session (Rs)" hint="You keep 90%. Clients see this price.">
              <TextInput type="number" min={500} value={rupees} onChange={(e) => setRupees(Number(e.target.value))} />
            </Field>
            <p className="text-xs text-muted-foreground">
              Clients can book from 12 hours ahead, up to 2 weeks out. Slots are cut from your hours by session length.
            </p>
          </div>
        </Panel>
        <Panel title="Prayer & Ramadan breaks">
          <div className="space-y-4 p-5 text-sm opacity-60">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block font-medium">Block Jummah time</span>
                <span className="text-muted-foreground">Coming soon</span>
              </span>
              <Switch disabled />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block font-medium">Ramadan schedule</span>
                <span className="text-muted-foreground">Coming soon</span>
              </span>
              <Switch disabled />
            </label>
          </div>
        </Panel>
      </div>
    </div>
  );
}
