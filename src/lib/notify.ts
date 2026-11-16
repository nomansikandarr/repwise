import "server-only";
import { notifications } from "@/db/schema";
import type { db } from "@/db";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type NotificationType = "calendar" | "message" | "check" | "play" | "refund" | "star";

/** Insert an in-app notification inside the caller's transaction. */
export function notify(
  tx: Tx,
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  payload: Record<string, unknown> = {},
) {
  return tx.insert(notifications).values({ userId, type, title, body, payload });
}
