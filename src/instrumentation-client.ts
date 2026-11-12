import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
  // Free plan: 50 replays/month, so record only sessions that hit an error.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
