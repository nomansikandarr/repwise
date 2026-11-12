# Repwise

A personal-training and coaching marketplace: discover trainers, buy video programs, chat, and book live 1:1 video sessions. Demo-grade, built on free tiers. See [PLAN.md](PLAN.md) for the full spec.

**Stack:** Next.js 16 (App Router, Cache Components) · Tailwind 4 + shadcn/ui · Neon Postgres + Drizzle · Neon Auth · Stream (chat + video) · ImageKit · Sentry · Vercel

## Local setup

```bash
pnpm install
neon login                   # once; opens the browser
neon env pull                # writes the Neon env vars into .env.local
# add NEON_AUTH_COOKIE_SECRET + ADMIN_EMAIL to .env.local (see .env.example)
pnpm db:migrate              # create tables (uses DATABASE_URL_UNPOOLED)
pnpm db:seed                 # demo data + 3 demo logins
pnpm dev                     # http://localhost:3000
```

The project is linked to Neon through `.neon` and `neon.ts`. `neon deploy` provisions the services declared in `neon.ts` (Postgres, Auth, Object Storage, Functions, AI Gateway, Realtime) and pulls their env vars.

### Demo logins (after `pnpm db:seed`)

Password for all three: `Repwise#2026demo`

| Role | Email | Lands on |
|---|---|---|
| Admin | `admin@repwise.test` | `/admin/applications` |
| Member | `ali.raza@repwise.test` | `/app` |
| Coach | `hamza.sheikh@repwise.test` | `/trainer` |

New sign-ups go through `/onboarding`: members start training immediately; coaches submit an application that an admin approves before their dashboard unlocks and their profile goes public.

### What is real vs. demo data

- **Real (Neon Postgres + Neon Auth):** accounts, sessions, roles, onboarding, coach applications and approval, coach profile editing, member notifications, and the public trainer/program/review pages.
- **Still hardcoded (`src/lib/mock.ts`):** bookings, chat, video calls, earnings, program ownership and lesson progress. Later phases in PLAN.md replace these.

### Tests

```bash
npm run build && npm run test:e2e   # Playwright, uses your installed Edge
pnpm db:seed                        # reset demo data afterwards
```
### Sentry

1. Create a free account → new **Next.js** project.
2. Copy the DSN → `NEXT_PUBLIC_SENTRY_DSN`.
3. For readable stack traces in production, set `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` (Settings → Auth Tokens) in Vercel.
4. To verify, sign in and open `/api/debug/sentry`. A test error appears in Sentry.

### Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) (sign up with GitHub).
3. Add every variable from `.env.local` under **Settings → Environment Variables**, with `NEXT_PUBLIC_APP_URL` set to the Vercel URL.
4. Add the Vercel URL to Neon Auth's trusted domains: `neon neon-auth domain add https://your-app.vercel.app` (localhost is already allowed).

Stream and ImageKit keys are needed from phase 4 onward.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm typecheck` / `pnpm lint` | TypeScript / ESLint |
| `pnpm db:generate` | Create a migration from `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` |
| `pnpm db:studio` | Browse the database |
| `pnpm db:seed` | Reset demo data and demo logins |
| `npm run test:e2e` | End-to-end tests (needs a build) |

## Project layout

```
src/
  app/(site)/        public + signed-in pages with the site header
  app/auth/          sign-in / sign-up
  app/api/auth/      Neon Auth proxy route
  db/schema.ts       Drizzle schema (all tables)
  lib/dal.ts         session → user + profile (the only place that reads auth)
  lib/auth/          Neon Auth server/client
  proxy.ts           optimistic route protection
drizzle/             SQL migrations
```
