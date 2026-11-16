import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { SessionRow } from "@/components/session-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coachSessions } from "@/lib/coach";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Sessions" };

export default async function TrainerBookingsPage() {
  const user = await requireUser();
  const sessions = await coachSessions(user.id);
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const past = sessions.filter((s) => s.status !== "upcoming").reverse();

  const list = (items: typeof sessions, empty: string) =>
    items.length ? (
      <ul className="divide-y">
        {items.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </ul>
    ) : (
      <p className="p-10 text-center text-sm text-muted-foreground">{empty}</p>
    );

  return (
    <>
      <PageTitle
        title="Sessions"
        body="Your booked 1:1 sessions. Join opens 10 minutes before the start time."
        action={
          <Link href="/trainer/availability" className="eyebrow inline-flex h-11 items-center rounded-sm border px-5 text-[11px] hover:border-brand">
            Edit availability
          </Link>
        }
      />
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <Panel>{list(upcoming, "No upcoming sessions.")}</Panel>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <Panel>{list(past, "No past sessions yet.")}</Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
