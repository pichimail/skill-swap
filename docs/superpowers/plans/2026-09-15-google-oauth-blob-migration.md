# Google OAuth + Vercel Blob Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Firebase from Skill Swap, replace it with Google-only NextAuth sessions, add Vercel Blob avatar storage, and keep all protected APIs authorized through one server session boundary.

**Architecture:** Stable `next-auth@4.24.15` provides Google OAuth and HTTP-only JWT sessions. Existing API routes retain `requireUser(request)`, but `requireUser` resolves the NextAuth session instead of a Firebase bearer token. Vercel Blob is used only for authenticated avatar uploads.

**Tech Stack:** Next.js 16 App Router, React 19, NextAuth 4.24.15, Google OAuth, Neon Postgres, Vercel Blob, Upstash Redis, LiveKit.

**Spec:** `docs/superpowers/specs/2026-09-15-google-oauth-blob-migration-design.md`

## Global Constraints
- Modify and push `main` only.
- Google OAuth is the only login method.
- Remove Firebase client/admin packages, files, environment variables, and runtime references.
- Preserve the existing Neon user/profile/matching/messaging/session data model.
- Preserve existing `requireUser(request)` API call sites where possible.
- Use Blob only for user-uploaded avatar images.
- Do not expose OAuth, Blob, LiveKit, AI, Redis, or database secrets to the client.

---

### Task 1: Add Google session contract

**Files:**
- Modify: `package.json`
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`
- Modify: `tests/server-auth.test.ts`

**Interfaces:**
- Produces `authOptions: NextAuthOptions`.
- Produces session user `id`, `email`, `name`, `image`.
- Stable Neon ID is `google:<Google sub>`.

- [ ] Add tests for stable Google IDs and missing-session rejection.
- [ ] Add `next-auth@4.24.15`, remove `firebase` and `firebase-admin`.
- [ ] Implement Google provider, JWT/session callbacks, custom sign-in page and secret validation.
- [ ] Add NextAuth route handler and TypeScript augmentation.
- [ ] Run tests/build.

### Task 2: Replace Firebase server/client identity plumbing

**Files:**
- Modify: `src/lib/server-auth.ts`
- Modify: `src/lib/api.ts`
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/app/auth/signin/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/components/Nav.tsx`
- Delete: `src/lib/firebase.ts`
- Delete: `src/lib/firebase-admin.ts`
- Modify: `src/app/api/health/route.ts`

**Interfaces:**
- `requireUser(request)` continues returning `{ uid, email, displayName }`.
- `authenticatedFetch()` uses same-origin session cookies.

- [ ] Replace bearer-token verification with `getServerSession(authOptions)`.
- [ ] Replace Firebase client state with `SessionProvider`/`useSession`.
- [ ] Replace all Firebase sign-out/delete actions with NextAuth sign-out and server account deletion.
- [ ] Replace sign-in screen with Google-only OAuth button.
- [ ] Update health reporting to `auth.googleOAuth`.
- [ ] Delete Firebase runtime files and env references.

### Task 3: Add authenticated Vercel Blob avatar storage

**Files:**
- Modify: `package.json`
- Create: `src/app/api/profile/avatar/route.ts`
- Modify: `src/app/dashboard/profile/page.tsx`
- Modify: `src/app/api/account/route.ts`

**Interfaces:**
- `POST /api/profile/avatar` accepts multipart `file` and returns `{ url }`.
- Max upload size 5 MB; MIME must start with `image/`.

- [ ] Add `@vercel/blob`.
- [ ] Implement authenticated upload, deterministic user prefix, collision-safe filename.
- [ ] Persist returned URL to Neon and delete replaced Blob best-effort.
- [ ] Replace manual avatar URL input with file upload UI.
- [ ] Delete avatar Blob best-effort during account deletion.

### Task 4: Clean environment/docs and verify production

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `VERCEL_INTEGRATIONS.md`

- [ ] Remove all Firebase envs and docs.
- [ ] Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `BLOB_READ_WRITE_TOKEN`.
- [ ] Repository-search for remaining Firebase runtime references.
- [ ] Run lint, unit tests and production build.
- [ ] Verify Vercel main deployment READY.
- [ ] Verify `/api/health` and `/api/auth/providers`.
- [ ] Report Google redirect URI and current LiveKit CLI setup commands.