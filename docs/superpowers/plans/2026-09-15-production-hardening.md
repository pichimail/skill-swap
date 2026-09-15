# Skill Swap Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden Skill Swap from prototype to a secure, data-backed production application and merge the verified result to `main`.

**Architecture:** Firebase remains the client identity provider but every protected server route verifies Firebase ID tokens with Firebase Admin. Neon becomes the authoritative product store with versioned migrations; Redis protects/cache AI; LiveKit provides realtime media; UI reads real product state instead of hard-coded/demo state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Firebase/Auth + Firebase Admin, Neon Postgres, Upstash Redis, NVIDIA/OpenRouter, LiveKit, Tailwind 4, Framer Motion, Vitest, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-15-production-hardening-design.md`

## Global Constraints
- Never trust a client-supplied user ID for ownership.
- Production demo authentication must fail closed.
- Missing Redis must disable billable AI generation in production.
- Preserve the current yellow/white/black responsive theme.
- Remove fake partner/face-moderation behavior rather than relabel it as real.
- No secret values in source, tests, logs, or responses.

---

### Task 1: Security foundation and deterministic tooling
**Files:** `package.json`, `package-lock.json`, `src/lib/server-auth.ts`, `src/lib/api.ts`, `src/lib/firebase-admin.ts`, `src/context/AuthContext.tsx`, `src/app/auth/signin/page.tsx`, `src/app/api/users/sync/route.ts`, tests.

**Interfaces:** Produce `requireUser(request): Promise<AuthUser>` and `authenticatedFetch(input, init)` used by later tasks.

- [ ] Add Vitest/Playwright scripts and dependencies plus Firebase Admin/LiveKit dependencies.
- [ ] Write failing tests for missing/invalid bearer tokens and production demo-auth rejection.
- [ ] Implement Firebase Admin token verification and sanitized API errors.
- [ ] Update client auth to attach Firebase ID tokens; demo auth only behind explicit non-production flag.
- [ ] Verify tests, lint, and build.

### Task 2: Versioned database migrations and schema-aware health
**Files:** `db/migrations/001_baseline.sql`, `002_product_hardening.sql`, `src/lib/migrations.ts`, `src/app/api/health/route.ts`, tests.

**Interfaces:** Produce `EXPECTED_SCHEMA_VERSION` and `checkSchemaVersion()`.

- [ ] Add migration table/versioned SQL while retaining idempotent baseline compatibility.
- [ ] Add profile lifecycle, match skill/request metadata, notifications, blocks, session feedback/moderation fields.
- [ ] Write tests for health failing when expected schema version/tables are absent.
- [ ] Update health payload to report `schema.ready`, Redis, NVIDIA/OpenRouter configuration accurately.
- [ ] Apply migrations to the intended Neon `skill-swap` project only after validating SQL.

### Task 3: AI spend protection and roadmap integrity
**Files:** `src/app/api/roadmap/route.ts`, `src/lib/rate-limit.ts`, `src/lib/ai.ts`, `src/app/dashboard/roadmap/page.tsx`, tests.

**Interfaces:** Authenticated roadmap POST with server-derived UID and stable `{roadmap, provider, model, cached}` response.

- [ ] Write tests proving unauthenticated calls are rejected and userId spoofing is impossible.
- [ ] Require Redis in production and combine per-user + per-IP limits.
- [ ] Log provider/usage metadata without keys/raw provider failures.
- [ ] Replace duplicate cache-hit persistence with user+skill upsert/version semantics.
- [ ] Add GET current/history route or endpoint behavior so refresh restores persisted roadmap.

### Task 4: Profile and skill CRUD
**Files:** `src/app/api/profile/route.ts`, `src/app/api/skills/route.ts`, `src/app/dashboard/profile/page.tsx`, dashboard onboarding logic, tests.

**Interfaces:** GET/PATCH `/api/profile`, GET/POST/DELETE `/api/skills` scoped to verified UID.

- [ ] Add authorization tests and CRUD tests.
- [ ] Persist bio/location/timezone and teach/learn skills.
- [ ] Derive onboarding completion from persisted data instead of localStorage.
- [ ] Wire profile UI forms/sheets and remove inert buttons.

### Task 5: Matching and blocks
**Files:** `src/app/api/matches/route.ts`, `src/app/api/matches/[id]/route.ts`, `src/app/api/blocks/route.ts`, `src/app/dashboard/matches/page.tsx`, settings blocked-users surface, tests.

**Interfaces:** Candidate list + request/accept/decline/block operations with verified ownership.

- [ ] Test exclusion of self, inactive, and blocked users.
- [ ] Implement reciprocal teach/learn matching and score calculation.
- [ ] Persist request/accept/decline timestamps/status.
- [ ] Wire responsive filter/search/match actions.

### Task 6: Conversations, messages, notifications
**Files:** `src/app/api/conversations/route.ts`, `src/app/api/conversations/[id]/messages/route.ts`, `src/app/api/notifications/route.ts`, `src/app/dashboard/messages/page.tsx`, dashboard notification UI, tests.

**Interfaces:** Only accepted match participants can create/read conversations and send messages.

- [ ] Write membership/authorization tests.
- [ ] Implement paginated conversations/messages and unread/read timestamps.
- [ ] Create notifications on match/message lifecycle actions.
- [ ] Poll lightweight endpoints on the client and render real counts/data.

### Task 7: Real LiveKit session transport
**Files:** `src/lib/livekit.ts`, `src/app/api/sessions/route.ts`, `src/app/api/sessions/[id]/token/route.ts`, `src/app/api/sessions/[id]/route.ts`, `src/app/dashboard/call/page.tsx`, tests.

**Interfaces:** Create session -> issue short-lived LiveKit token -> join room -> end session.

- [ ] Test that only accepted-match participants can obtain room tokens.
- [ ] Implement LiveKit server-token creation using server secrets.
- [ ] Replace fake Alice/timer moderation with real remote participant/media state.
- [ ] Handle camera/mic permission errors and reconnection states.
- [ ] Persist started/ended/duration/end reason and explicit safety reports/check-ins.

### Task 8: Analytics and account lifecycle
**Files:** `src/app/api/analytics/route.ts`, `src/app/api/account/route.ts`, `src/app/dashboard/analytics/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/settings/page.tsx`, tests.

**Interfaces:** Real analytics response plus PATCH deactivate and DELETE account endpoints.

- [ ] Compute session/match/hours/skills metrics from persisted data.
- [ ] Replace hard-coded dashboard/analytics values.
- [ ] Deactivate server-side and exclude inactive profiles from matching.
- [ ] Delete application data transactionally, then remove Firebase user client-side.
- [ ] Persist bug/contact feedback as notifications/support events rather than fake timeout success.

### Task 9: Accessibility, security headers, PWA and cleanup
**Files:** `src/components/ui/AccessibleSheet.tsx`, affected dashboard sheets, `src/app/globals.css`, `next.config.ts`, `src/app/manifest.ts`, root metadata, legacy components.

**Interfaces:** Accessible sheet/dialog primitive with focus management and Escape dismissal.

- [ ] Upgrade interactive targets to >=44px on touch surfaces.
- [ ] Add dialog semantics/focus trap/Escape behavior.
- [ ] Remove legacy global color-rewrite shims and dead old-theme components where unreferenced.
- [ ] Add CSP/security/permissions headers compatible with Firebase/OpenRouter/LiveKit.
- [ ] Add manifest/metadata and retain reduced-motion support.

### Task 10: CI, smoke tests, production verification and merge
**Files:** `.github/workflows/ci.yml`, `vitest.config.ts`, `playwright.config.ts`, `tests/**`, `README.md`, `.env.example`.

**Interfaces:** CI gate runs `npm ci`, lint, unit tests, build, Playwright smoke tests.

- [ ] Add unit/API tests and route smoke tests.
- [ ] Run Vercel preview build from hardening branch; fix compile/type failures.
- [ ] Verify intended Neon schema, `/api/health`, protected 401s, Redis/NVIDIA/LiveKit configuration state.
- [ ] Fast-forward `main` only after verification.
- [ ] Verify final production deployment and report any secrets/Marketplace integrations still requiring user authorization.
