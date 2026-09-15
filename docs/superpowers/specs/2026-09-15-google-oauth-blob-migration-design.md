# Google OAuth + Vercel Blob Migration Design

## Goal
Remove Firebase completely from Skill Swap and replace it with Google-only OAuth sessions, while preserving the hardened server authorization boundary and existing Neon-backed product APIs. Use Vercel Blob only for user-uploaded avatar images.

## Authentication architecture
- Use stable `next-auth@4.24.15` with the Google provider.
- Use encrypted/signed HTTP-only JWT sessions; no Firebase client/admin SDK and no bearer ID-token plumbing.
- Server identity is resolved centrally in `src/lib/server-auth.ts` using `getServerSession(authOptions)`.
- Existing APIs continue calling `requireUser(request)`, so authorization semantics remain centralized.
- The stable application user ID is `google:<google-sub>` and is persisted in Neon through the existing `users` table.
- `/api/users/sync` remains the post-login profile synchronization path.
- Google OAuth is the only sign-in surface; email/password and demo auth are removed.
- Account deletion removes Skill Swap application data and signs the user out. It does not delete the user's Google account.

## Client architecture
- `AuthProvider` wraps NextAuth `SessionProvider` and exposes the existing `useAuth()` shape needed by the dashboard.
- `authenticatedFetch()` becomes a same-origin credentialed fetch helper; authorization comes from the secure session cookie.
- Dashboard and Settings sign-out paths use `next-auth/react` `signOut()`.

## Vercel Blob
- Add `@vercel/blob`.
- Add authenticated `POST /api/profile/avatar` accepting one image file up to 5 MB.
- Store images under `avatars/<user-id>/...` and persist the returned Blob URL in `users.avatar_url`.
- On replacement, best-effort delete the previous Vercel Blob URL when it belongs to the Blob store.
- On account deletion, best-effort delete the persisted avatar Blob before deleting Neon data.

## Environment
Required authentication variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=https://skill-swap-nine-green.vercel.app`

Required Blob variable when using avatar uploads:
- `BLOB_READ_WRITE_TOKEN` (normally injected by the Vercel Blob integration)

All Firebase variables are removed.

## Google OAuth redirect
Production redirect URI:
`https://skill-swap-nine-green.vercel.app/api/auth/callback/google`

## Verification
- Unit tests cover session-to-user normalization and missing-session rejection.
- Repository search must show no runtime Firebase imports or Firebase env names.
- `npm run lint`, `npm run test:run`, and `npm run build` must pass before completion.
- Production Vercel deployment must reach READY and `/api/health` must report Google OAuth configuration rather than Firebase Admin.