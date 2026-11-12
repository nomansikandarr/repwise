import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

type NeonAuth = ReturnType<typeof createNeonAuth>;

let instance: NeonAuth | undefined;

/**
 * Next aborts speculative prerenders (link prefetches, static-shell renders)
 * once the shell is done; Neon Auth then logs the cancelled session fetch as
 * an "unexpected fetch error". Drop only those; forward everything else.
 */
const isAbortedPrerender = (meta?: Record<string, unknown>) =>
  (meta?.err as { digest?: string } | undefined)?.digest === "HANGING_PROMISE_REJECTION";

const authLogger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    if (!isAbortedPrerender(meta)) console.error(`[neon-auth] ${message}`, meta ?? "");
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (!isAbortedPrerender(meta)) console.warn(`[neon-auth] ${message}`, meta ?? "");
  },
};

export function isAuthConfigured() {
  return !!process.env.NEON_AUTH_BASE_URL && !!process.env.NEON_AUTH_COOKIE_SECRET;
}

/** In local dev only, run without auth (signed-out) until .env.local is filled in. */
export function authDisabledInDev() {
  if (isAuthConfigured() || process.env.NODE_ENV === "production") return false;
  console.warn("[repwise] Neon Auth env vars missing — running signed-out. See .env.example.");
  return true;
}

/**
 * Lazily created so importing this module (e.g. during `next build`) doesn't
 * require auth secrets. `createNeonAuth` validates the cookie secret eagerly.
 */
export function getAuth(): NeonAuth {
  if (!instance) {
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    const secret = process.env.NEON_AUTH_COOKIE_SECRET;
    if (!baseUrl || !secret) {
      throw new Error(
        "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET in .env.local.",
      );
    }
    instance = createNeonAuth({ baseUrl, cookies: { secret }, logger: authLogger });
  }
  return instance;
}
