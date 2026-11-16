"use client";

import { CheckCircle2, CreditCard, Lock, Smartphone, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ActionResult } from "@/actions/commerce";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn, formatPrice } from "@/lib/utils";

const METHODS = [
  { id: "jazzcash", label: "JazzCash", icon: Smartphone },
  { id: "easypaisa", label: "Easypaisa", icon: Wallet },
  { id: "card", label: "Debit / credit card", icon: CreditCard },
];

/**
 * Demo checkout. Payment is simulated (mock provider), but `onPay` records the
 * order for real. A fresh idempotency key per dialog opening makes double
 * clicks safe.
 */
export function PayDialog({
  trigger,
  title,
  lines,
  total,
  onPay,
  success,
}: {
  trigger: React.ReactNode;
  title: string;
  lines: [string, string][];
  total: number;
  onPay: (idempotencyKey: string) => Promise<ActionResult>;
  success: { title: string; body: string; href: string; cta: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [method, setMethod] = useState("jazzcash");
  const [state, setState] = useState<"form" | "paying" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState("");

  async function pay() {
    setState("paying");
    setError(null);
    const result = await onPay(key);
    if (result.ok) {
      setState("done");
      router.refresh();
      return;
    }
    if (result.signIn) {
      router.push(`/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setError(result.error);
    setState("form");
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setKey(crypto.randomUUID());
          setState("form");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {state === "done" ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-14 text-brand" strokeWidth={1.5} />
            <DialogTitle className="display mt-5 text-2xl">{success.title}</DialogTitle>
            <DialogDescription className="mt-2">{success.body}</DialogDescription>
            <Link
              href={success.href}
              className="eyebrow mt-7 inline-flex h-11 items-center rounded-sm bg-brand px-6 text-brand-foreground hover:bg-brand/85"
            >
              {success.cta}
            </Link>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="display text-xl">{title}</DialogTitle>
              <DialogDescription>Demo checkout. No real money is taken.</DialogDescription>
            </DialogHeader>

            <dl className="space-y-2 rounded-md border p-4 text-sm">
              {lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <div>
              <p className="eyebrow mb-2 text-[11px] text-muted-foreground">Pay with</p>
              <div className="grid gap-2">
                {METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-md border px-4 text-sm transition-colors",
                      method === id ? "border-brand bg-brand/10" : "hover:border-foreground/30",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                    <span className={cn("ml-auto size-3.5 rounded-full border", method === id && "border-4 border-brand")} />
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

            <button
              onClick={pay}
              disabled={state === "paying" || !key}
              className="eyebrow flex h-12 items-center justify-center gap-2 rounded-sm bg-brand text-brand-foreground hover:bg-brand/85 disabled:opacity-70"
            >
              <Lock className="size-3.5" />
              {state === "paying" ? "Processing…" : `Pay ${formatPrice(total)}`}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
