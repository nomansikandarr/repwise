import { connection } from "next/server";

/**
 * Verification endpoint: GET /api/debug/sentry throws so you can confirm the
 * error shows up in Sentry. Requires a signed-in session (enforced by proxy).
 */
export async function GET() {
  await connection(); // run at request time, never prerender
  throw new Error("Repwise Sentry test error — safe to ignore");
}
