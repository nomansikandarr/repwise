import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { SessionRow } from "@/components/session-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trainerSessions } from "@/lib/mock";

export const metadata: Metadata = { title: "Sessions" };

export default function TrainerBookingsPage() {
  const upcoming = trainerSessions.filter((b) => b.status === "upcoming");
  const past = trainerSessions.filter((b) => b.status !== "upcoming");
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
        {[
          ["upcoming", upcoming],
          ["past", past],
        ].map(([key, list]) => (
          <TabsContent key={key as string} value={key as string} className="mt-4">
            <Panel>
              <ul className="divide-y">
                {(list as typeof trainerSessions).map((b) => (
                  <SessionRow key={b.id} booking={b} view="trainer" />
                ))}
              </ul>
            </Panel>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
