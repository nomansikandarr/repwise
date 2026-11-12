import { Download } from "lucide-react";
import type { Metadata } from "next";
import { PageTitle, Panel, StatCard, StatusPill } from "@/components/dashboard-shell";
import { EarningsChart } from "@/components/earnings-chart";
import { GhostButton } from "@/components/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { payouts, trainerStats } from "@/lib/mock";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Earnings" };

export default function EarningsPage() {
  const split = [
    { label: "Programs", pct: 58, amount: 165996 },
    { label: "1:1 sessions", pct: 42, amount: 120204 },
  ];
  return (
    <>
      <PageTitle
        title="Earnings"
        body="Repwise keeps a 10% platform fee. Everything else is yours."
        action={
          <GhostButton>
            <Download className="size-4" /> Export CSV
          </GhostButton>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net this month" value={formatPrice(trainerStats.monthNet)} hint="+18% vs October" accent />
        <StatCard label="Gross sales" value={formatPrice(trainerStats.monthGross)} hint="This month" />
        <StatCard label="Platform fee (10%)" value={formatPrice(trainerStats.fee)} hint="This month" />
        <StatCard label="Lifetime earnings" value="Rs 24.1 lakh" hint="Since Jan 2025" />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Net earnings, last 30 days">
          <div className="p-5 pt-10">
            <EarningsChart height={220} />
          </div>
        </Panel>
        <Panel title="Where it comes from">
          <div className="space-y-6 p-5">
            {split.map((s) => (
              <div key={s.label}>
                <p className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">
                    {formatPrice(s.amount)} · {s.pct}%
                  </span>
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-brand" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              Next payout of <span className="font-semibold text-foreground">{formatPrice(71550)}</span> goes to your bank account ending
              4471 on Monday, 16 Nov.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Recent orders">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((o) => {
              const fee = Math.round(o.gross * 0.1);
              const refunded = o.status === "Refunded";
              return (
                <TableRow key={o.id}>
                  <TableCell className="pl-5 font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="font-medium">{o.client}</TableCell>
                  <TableCell className="text-muted-foreground">{o.item}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(o.gross)}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{refunded ? "Rs 0" : `− ${formatPrice(fee)}`}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{refunded ? "Rs 0" : formatPrice(o.gross - fee)}</TableCell>
                  <TableCell className="pr-5">
                    <StatusPill status={o.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
}
