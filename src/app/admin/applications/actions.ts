"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { notifications, trainerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { CATALOG_TAG } from "@/lib/queries";

const input = z.object({
  userId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(500).optional(),
});

export type DecisionResult = { ok: true } | { ok: false; error: string };

/** Approve or reject a pending coach application. Admins only. */
export async function decideApplication(raw: z.input<typeof input>): Promise<DecisionResult> {
  await requireRole("admin");
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const { userId, decision, note } = parsed.data;

  const updated = await db.transaction(async (tx) => {
    const rows = await tx
      .update(trainerProfiles)
      .set({ status: decision, reviewedAt: new Date(), applicationNote: note || null })
      // Only pending applications can be decided (prevents double clicks flipping state).
      .where(and(eq(trainerProfiles.userId, userId), eq(trainerProfiles.status, "pending")))
      .returning({ slug: trainerProfiles.slug });
    if (!rows.length) return null;
    await tx.insert(notifications).values({
      userId,
      type: decision === "approved" ? "check" : "refund",
      title: decision === "approved" ? "You're approved as a coach" : "Coach application not approved",
      body:
        decision === "approved"
          ? "Your profile is now live. Add availability and your first program from the coach dashboard."
          : note || "Our team could not approve your application this time.",
      payload: { slug: rows[0].slug },
    });
    return rows[0];
  });

  if (!updated) return { ok: false, error: "This application was already decided." };
  // Newly approved coaches must appear in the public directory right away.
  updateTag(CATALOG_TAG);
  return { ok: true };
}
