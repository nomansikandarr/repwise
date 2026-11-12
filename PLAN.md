# Repwise — Spec Summary (v1 demo)

## Context
Greenfield project in `d:\repwise` (empty). Build a demo-grade, full-stack personal-training marketplace on Next.js using free tiers that work from Pakistan. Focus on core features + integrations (Neon, Stream, ImageKit, Sentry), not a hardened production system. UI must look modern/premium.

## Product & users
- **Client**: discovers trainers, buys course-style programs, watches lessons, chats with trainers, books paid 1:1 video sessions, leaves reviews.
- **Trainer**: applies → admin approves → manages profile, programs/lessons, weekly availability, clients, bookings, chat, earnings.
- **Admin**: approves/rejects trainer applications (single small page).
- **Out of scope v1**: real payments/payouts, email, subscriptions, rescheduling, structured weeks/days/sets programs, group chats/classes, mobile apps, i18n.

## Decisions (from interview)
| Area | Decision |
|---|---|
| Hosting | Vercel Hobby (Cloudways dropped: no free tier) |
| DB | Neon Postgres + Drizzle ORM (Neon serverless driver) |
| Auth | Neon Auth (Better Auth) — email/password + Google |
| Real-time | Stream owns all real-time (chat, presence, unread, video). Neon has no realtime layer. |
| Chat | Stream Chat — 1:1 channels client↔trainer, reactions, replies, threads; any signed-in client can message any approved trainer |
| Video calls | Stream Video — call per booking, joinable from booking page around start time |
| Media | ImageKit — uploads (avatars, covers, lesson videos), transforms, video player; paid lessons via server-signed short-lived URLs; lesson 1 can be free preview |
| Payments | Mock checkout behind a `PaymentProvider` interface (orders marked paid immediately) |
| Trainer onboarding | Apply + admin approval |
| Booking | Trainer weekly availability + session length/price → client picks open slot → mock pay → confirmed |
| Cancellation | Either side ≥24h before; slot reopens; order → refunded. No reschedule. UTC storage, local display |
| Discovery | Search + filters (specialty, price, rating) + verified 1–5★ reviews (one per client per trainer) |
| UI | Tailwind + shadcn/ui, dark-first premium look with theme toggle, subtle motion |
| Earnings | 10% platform fee; gross/fee/net; totals + 30-day chart; programs vs sessions |
| Notifications | In-app notifications table + Stream unread badges; no email |
| Observability | Sentry (@sentry/nextjs) errors + tracing + source maps |
| Seed data | Script: admin, ~6 trainers, programs+lessons (sample ImageKit videos), availability, reviews, demo client |
| Testing | Playwright smoke (signup, buy program, watch lesson, book slot) + unit tests for slot/booking logic |

## Verified stack (docs checked 2026-11-12)
- **Next.js 16.4.x** (latest patch, 2026-11-03 security release), React 19.3, Turbopack default, Cache Components on by default in new apps. Route protection file is **`proxy.ts`** (not middleware.ts).
- **Neon Auth** = managed Better Auth, package **`@neon/auth`** (`createNeonAuth` from `@neon/auth/next/server`, `createAuthClient` from `@neon/auth/next`), route `app/api/auth/[...path]/route.ts`, env `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`. Users in `neon_auth` schema → custom roles live in our own `profiles` table. Free: 60k auth MAU, 100 CU-h, 0.5–1 GB storage. AWS regions only.
- **Stream**: `stream-chat` + `stream-chat-react`, `@stream-io/video-react-sdk` (v1 stable), server tokens via `@stream-io/node-sdk`. Free Build plan: chat 1,000 MAU / 100 concurrent; video $100/mo free usage.
- **ImageKit**: `@imagekit/next` (`getUploadAuthParams` server, `upload()` client), `@imagekit/video-player`. Free: ~20 GB bandwidth, ~3 GB storage, **100 MB max video upload**, 500 video processing units/mo.
- **Sentry**: `@sentry/nextjs` via `npx @sentry/wizard@latest -i nextjs`; free Developer plan (5k errors, 50 replays). **Seer (AI autofix) is paid (Team plan) — not in v1.**
- **Vercel Hobby**: non-commercial only, 300s functions.

## Pages & routing (App Router)
- **Public**: `/` landing, `/trainers` (search/filters), `/trainers/[slug]` (profile, programs, reviews, availability, "Message"/"Book"), `/programs/[id]` (overview + free preview), `/sign-in`, `/sign-up`.
- **Onboarding**: `/onboarding` (choose Client or "Apply as trainer" → application form).
- **Client** (`/app/...`): dashboard (my programs + progress, upcoming sessions), `/app/programs/[id]/lessons/[lessonId]` player, `/app/bookings`, `/app/messages`, `/app/notifications`.
- **Trainer** (`/trainer/...`): overview (earnings KPIs, upcoming sessions), `/trainer/programs` (CRUD, lesson upload/reorder), `/trainer/availability`, `/trainer/clients`, `/trainer/bookings`, `/trainer/earnings`, `/trainer/messages`, `/trainer/profile`. Pending trainers see a "under review" state.
- **Admin**: `/admin/applications`.
- **Shared**: `/call/[bookingId]` (Stream video, only booking participants, window: 10 min before → end).
- Route protection via auth session check in layout/proxy + **server-side authorization in every action**.

## Data model (Drizzle; auth tables managed by Neon Auth)
- `profiles` (userId PK→auth user, role: client|trainer|admin, displayName, avatarUrl, timezone)
- `trainer_profiles` (userId PK, slug unique, headline, bio, specialties text[], yearsExp, sessionPrice, sessionMinutes, status: pending|approved|rejected, ratingAvg, ratingCount)
- `programs` (id, trainerId, title, description, coverUrl, level, price, published)
- `lessons` (id, programId, position, title, description, imagekitFileId, videoPath, durationSec, isPreview)
- `availability_rules` (id, trainerId, weekday 0–6, startMinute, endMinute) — in trainer's timezone
- `bookings` (id, trainerId, clientId, startsAt UTC, endsAt UTC, status: confirmed|cancelled|completed, streamCallId, orderId) — **unique (trainerId, startsAt) where status=confirmed** to prevent double-booking
- `orders` (id, clientId, trainerId, type: program|session, programId?, bookingId?, amount, platformFee, trainerNet, status: paid|refunded, idempotencyKey unique)
- `enrollments` (clientId, programId, PK both)
- `lesson_progress` (clientId, lessonId, completedAt)
- `reviews` (id, trainerId, clientId, rating 1–5, body; unique (trainerId, clientId)) — allowed only if client has an order with trainer
- `notifications` (id, userId, type, payload jsonb, readAt)
- Deletion: soft-unpublish programs with buyers (never hard-delete purchased content); cascade lessons on unpublished-without-buyers delete.

## Architecture
- Server Components for reads; **Server Actions** for mutations, validated with **Zod**, each doing auth + ownership checks. Route handlers only for: ImageKit upload auth, signed video URL, Stream token, and (dev) seed.
- `lib/payments` → `PaymentProvider` interface; `MockPaymentProvider` creates `orders` in a DB transaction (enrollment or booking) with idempotency key from form.
- `lib/booking/slots.ts` → pure function: availability rules + existing bookings + timezone → open UTC slots for next 14 days (unit-tested).
- `lib/stream` → server client: upsert users on profile changes, create 1:1 channel `trainer-<id>-client-<id>` on "Message", create video call per booking, token endpoint.
- `lib/imagekit` → upload auth params endpoint (trainer-only), signed URL generator (enrollment or preview check).
- Revalidation via `revalidatePath` after mutations; no extra client cache lib needed (TanStack Query only if a page needs polling).
- Env: server-only secrets (Stream secret, ImageKit private key, DB URL, auth secret, Sentry auth token) never prefixed `NEXT_PUBLIC_`.

## Build phases
1. Scaffold Next.js + Tailwind + shadcn + theme, Drizzle/Neon, Neon Auth, Sentry, deploy to Vercel.
2. Profiles, onboarding, trainer application + admin approval.
3. Trainer directory, profiles, search/filters.
4. Programs + lessons CRUD, ImageKit uploads, player with signed URLs, mock checkout, enrollments, progress.
5. Availability, slot engine, booking + cancellation, Stream Video call page.
6. Stream Chat (messages pages, unread badges).
7. Reviews, notifications, earnings dashboard + chart.
8. Seed script, polish (loading/empty/error states, responsive), Playwright smoke tests.

## Verification
- `pnpm test` (unit: slot generation, fee math, cancellation window).
- `pnpm exec playwright test` smoke: sign up client → buy program → open locked lesson → watch; book slot → appears for trainer; chat message round-trip visible.
- Manual on Vercel preview: two browsers (client + trainer) join the same Stream call; trigger a test error and confirm it appears in Sentry.

## ASSUMPTIONS
- App name "Repwise" (folder name). Package manager pnpm. Currency USD for display.
- Admin account created by seed/env (`ADMIN_EMAIL`), not via UI.
- Session length/price is one per trainer (no multiple session types).
- Slots shown 14 days ahead; min 12h lead time to book.
- Password reset not available in v1 (no email); Google sign-in covers recovery for demo.
- Reviews editable, not deletable; no moderation.
- "Clients" list for a trainer = anyone with an order or chat with them.
- Booking video window: join from 10 min before start until end time.
- Sentry: errors + traces + session replay + source maps only; Seer skipped (paid).
- Lesson videos ≤100 MB (ImageKit free cap), enforced client-side before upload.
- Signed lesson URL is passed as `src` to ImageKit's video player; if the player can't take a pre-signed URL, fall back to a styled native `<video>` player.

## OPEN RISKS
- Free-tier limits (Stream video minutes/MAU, ImageKit video processing/bandwidth, Neon compute sleep → cold starts).
- Neon Auth maturity/API surface may differ from Better Auth docs; custom role stored in our `profiles` table to stay decoupled.
- Vercel Hobby is non-commercial only — fine for demo, must upgrade or move to go live.
- Mock payments mean no real money flow; swapping to Safepay/other later goes through `PaymentProvider`.
- Timezone/DST edge cases in slot engine.
- ImageKit free-plan support for signed URLs is unconfirmed — check in the dashboard early (phase 4 spike).
- Vercel signup from Pakistan may hit SMS verification; fallback is Netlify or Render.
- Neon Auth custom fields/admin plugin are limited — role logic stays in our tables.
- Large video uploads from browser on slow networks (direct-to-ImageKit upload mitigates server limits).

## UI preview stage (added 2026-11-12)
The whole interface is built on hardcoded data before any integration work.
- `src/lib/preview.ts` ? `UI_PREVIEW = true` turns off auth checks; every page is reachable directly. Set it to `false` when wiring real auth/data.
- `src/lib/mock.ts` holds all demo data (trainers, programs, bookings, chats, earnings, applications). Replace it page by page with real queries in phases 2�7.
- Checkout, booking, chat, the video call and the lesson player are static mock-ups with the final layout.

### Design direction (from `design/design-ref.jpg`)
- Near-black background, white type, electric lime accent, wide heavy uppercase headings (Archivo), small-radius buttons with arrows, photo-led cards.
- Audience is Pakistan / South Asia: men-first imagery, women shown only in modest dress, local names and cities, prices in PKR (`Rs`), Urdu touches, cricket / desi diet / Ramadan-aware content.
- Photos are free Pexels stock, checked by eye and stored in `public/images`.

### Changes to earlier decisions
- Currency is PKR, not USD.
- Client area lives under `/app`, trainer under `/trainer`, admin under `/admin`; added `/programs` (listing) and `/app/programs` (library).
