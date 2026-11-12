import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CallRoom } from "@/components/call-room";
import { bookings, getTrainer, me, trainerSessions } from "@/lib/mock";

type Props = { params: Promise<{ bookingId: string }> };

export const metadata: Metadata = { title: "Live session" };

export function generateStaticParams() {
  const ids = new Set([...bookings, ...trainerSessions].map((b) => b.id));
  return [...ids].map((bookingId) => ({ bookingId }));
}

export default async function CallPage({ params }: Props) {
  const { bookingId } = await params;
  const booking = bookings.find((b) => b.id === bookingId) ?? trainerSessions.find((b) => b.id === bookingId);
  if (!booking) notFound();
  const trainer = getTrainer(booking.trainer)!;

  return (
    <CallRoom
      title={`1:1 session with ${trainer.name} · ${booking.time}`}
      remote={{ name: trainer.name, img: trainer.photo, focus: trainer.focus }}
      local={{ name: me.name, img: me.avatar }}
      exitHref="/app/bookings"
    />
  );
}
