import { MessageSquare, Search } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageTitle, Panel, StatCard } from "@/components/dashboard-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trainerClients } from "@/lib/mock";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <PageTitle title="Clients" body="Everyone who has bought a program, booked a session or messaged you." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active clients" value="64" hint="Trained in the last 30 days" />
        <StatCard label="New this month" value="6" />
        <StatCard label="Repeat rate" value="78%" hint="Booked more than once" />
      </div>
      <Panel>
        <div className="border-b p-4">
          <label className="relative block max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search clients" className="h-10 w-full rounded-sm border bg-background pr-3 pl-9 text-sm outline-none focus:border-brand" />
          </label>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Client</TableHead>
              <TableHead>Since</TableHead>
              <TableHead className="text-right">Programs</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Total spent</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainerClients.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <Image src={c.avatar} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.city}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.since}</TableCell>
                <TableCell className="text-right tabular-nums">{c.programs}</TableCell>
                <TableCell className="text-right tabular-nums">{c.sessions}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatPrice(c.spent)}</TableCell>
                <TableCell className="text-muted-foreground">{c.last}</TableCell>
                <TableCell className="pr-5 text-right">
                  <Link href="/trainer/messages" aria-label={`Message ${c.name}`} className="inline-grid size-8 place-items-center rounded-md border hover:border-brand">
                    <MessageSquare className="size-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
}
