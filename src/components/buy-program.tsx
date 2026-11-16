"use client";

import { buyProgram } from "@/actions/commerce";
import { PayDialog } from "@/components/pay-dialog";

export function BuyProgramButton({
  slug,
  title,
  coach,
  price,
}: {
  slug: string;
  title: string;
  coach: string;
  price: number;
}) {
  return (
    <PayDialog
      title="Complete your purchase"
      lines={[
        ["Program", title],
        ["Coach", coach],
        ["Access", "Lifetime"],
      ]}
      total={price}
      onPay={(idempotencyKey) => buyProgram({ slug, idempotencyKey })}
      success={{
        title: "You're in",
        body: `${title} is now in your library. Start with lesson 1 whenever you're ready.`,
        href: `/app/programs/${slug}/lessons/1`,
        cta: "Start lesson 1",
      }}
      trigger={
        <button className="eyebrow mt-5 h-12 w-full rounded-sm bg-brand text-brand-foreground hover:bg-brand/85">
          Buy program
        </button>
      }
    />
  );
}
