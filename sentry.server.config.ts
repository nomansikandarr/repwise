import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  // Free plan has 5M spans/month; 20% sampling in prod is plenty for a demo.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
});
