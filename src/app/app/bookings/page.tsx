import type { Metadata } from "next";
import { CtaLink } from "@/components/bits";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { SessionRow } from "@/components/session-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookings } from "@/lib/mock";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status !== "upcoming");
  return (
    <>
      <PageTitle
        title="Bookings"
        body="Your live 1:1 sessions. Times are shown in Pakistan Standard Time."
        action={<CtaLink href="/trainers">Book a session</CtaLink>}
      />
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <Panel>
            <ul className="divide-y">
              {upcoming.map((b) => (
                <SessionRow key={b.id} booking={b} view="client" />
              ))}
            </ul>
          </Panel>
          <p className="mt-4 text-sm text-muted-foreground">
            You can cancel free of charge up to 24 hours before a session. The amount is refunded to your original payment method.
          </p>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <Panel>
            <ul className="divide-y">
              {past.map((b) => (
                <SessionRow key={b.id} booking={b} view="client" />
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
