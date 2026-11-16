import type { Metadata } from "next";
import { CtaLink } from "@/components/bits";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { SessionRow } from "@/components/session-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/dal";
import { myBookings } from "@/lib/member";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage() {
  const user = await requireUser();
  const sessions = await myBookings(user.id);
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const past = sessions.filter((s) => s.status !== "upcoming").reverse();

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
            {upcoming.length ? (
              <ul className="divide-y">
                {upcoming.map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </ul>
            ) : (
              <p className="p-10 text-center text-sm text-muted-foreground">No upcoming sessions.</p>
            )}
          </Panel>
          <p className="mt-4 text-sm text-muted-foreground">
            You can cancel free of charge up to 24 hours before a session. The amount is refunded to your original payment method.
          </p>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <Panel>
            {past.length ? (
              <ul className="divide-y">
                {past.map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </ul>
            ) : (
              <p className="p-10 text-center text-sm text-muted-foreground">No past sessions yet.</p>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
