import type { Metadata } from "next";
import { PageTitle, Panel, StatCard, StatusPill } from "@/components/dashboard-shell";
import { EarningsChart } from "@/components/earnings-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { earningsSummary, recentOrders } from "@/lib/coach";
import { requireUser } from "@/lib/dal";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const user = await requireUser();
  const [summary, orders] = await Promise.all([earningsSummary(user.id), recentOrders(user.id)]);
  const splitTotal = summary.split.programs + summary.split.sessions;
  const split = [
    { label: "Programs", amount: summary.split.programs },
    { label: "1:1 sessions", amount: summary.split.sessions },
  ].map((s) => ({ ...s, pct: splitTotal ? Math.round((s.amount / splitTotal) * 100) : 0 }));

  return (
    <>
      <PageTitle title="Earnings" body="Repwise keeps a 10% platform fee. Everything else is yours." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net this month" value={formatPrice(summary.monthNet)} hint="After platform fee" accent />
        <StatCard label="Gross sales" value={formatPrice(summary.monthGross)} hint="This month" />
        <StatCard label="Platform fee (10%)" value={formatPrice(summary.monthFee)} hint="This month" />
        <StatCard label="Lifetime earnings" value={formatPrice(summary.lifetimeNet)} hint="Net, all time" />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Net earnings, last 30 days">
          <div className="p-5 pt-10">
            <EarningsChart data={summary.daily} height={220} />
          </div>
        </Panel>
        <Panel title="This month by source">
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
              Payouts are simulated in this demo. Refunded orders don&apos;t count towards your earnings.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Recent orders">
        {orders.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
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
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="pl-5 font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="font-medium">{o.client}</TableCell>
                  <TableCell className="text-muted-foreground">{o.item}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(o.gross)}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{o.fee ? `− ${formatPrice(o.fee)}` : "Rs 0"}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatPrice(o.net)}</TableCell>
                  <TableCell className="pr-5">
                    <StatusPill status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </>
  );
}
