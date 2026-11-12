import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden px-4 py-24 text-center">
      <div className="bg-glow pointer-events-none absolute inset-0" />
      <div className="relative">
        <p className="font-heading text-7xl font-semibold text-brand">404</p>
        <h1 className="mt-4 text-2xl font-semibold">This page is still warming up</h1>
        <p className="mt-2 text-muted-foreground">It doesn&apos;t exist yet, or it moved.</p>
        <Button asChild className="mt-8">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
