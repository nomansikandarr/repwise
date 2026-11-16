"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/actions/commerce";

export function CancelSessionButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="eyebrow h-9 rounded-sm border px-3 text-[11px] text-muted-foreground hover:border-destructive hover:text-destructive"
      >
        Cancel
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await cancelBooking(bookingId);
            if (!result.ok) {
              toast.error(result.error);
              setConfirming(false);
              return;
            }
            toast.success("Session cancelled and refunded");
            router.refresh();
          })
        }
        className="eyebrow inline-flex h-9 items-center gap-1.5 rounded-sm bg-destructive px-3 text-[11px] text-white hover:bg-destructive/85 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />} Confirm cancel
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-xs text-muted-foreground hover:text-foreground">
        Keep
      </button>
    </span>
  );
}
