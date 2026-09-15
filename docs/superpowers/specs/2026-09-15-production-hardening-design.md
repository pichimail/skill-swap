# Skill Swap Production Hardening Design

## Goal
Turn the current polished prototype into a production-safe Skill Swap application with authenticated server APIs, correct Neon persistence, Redis-backed abuse controls, a real matching/messaging/session data layer, LiveKit-compatible realtime calling, accurate analytics/account lifecycle, accessible mobile sheets, and deterministic CI/deployments.

## Architecture
- Firebase remains the browser authentication provider. Every protected API requires a Firebase ID token in `Authorization: Bearer <token>` and derives the user ID from the verified token; client-supplied ownership IDs are rejected/ignored.
- Firebase Admin verification uses server-only service-account environment variables. Production never falls back to demo auth. Demo auth is allowed only when `NODE_ENV !== 'production'` and `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`.
- Neon is the sole application database. Schema changes are versioned under `db/migrations/` and tracked in `schema_migrations`. `/api/health` validates both connectivity and the latest migration version.
- Upstash Redis provides per-user and per-IP AI rate limiting, roadmap cache, and lightweight notification fanout metadata. Missing Redis makes protected AI generation unavailable in production rather than silently unbounded.
- NVIDIA is primary for roadmap generation when configured; OpenRouter is fallback. Provider errors are logged server-side but the client receives stable sanitized errors.
- Product APIs are grouped by resource: profile/skills, matches, conversations/messages, sessions/analytics, notifications, account lifecycle. Every query scopes rows to the verified user.
- LiveKit is the realtime transport. The server creates short-lived room tokens after verifying the authenticated user and a valid/accepted match/session. The client uses `livekit-client`; local-only fake partner/moderation timers are removed. Safety UI is explicit check-in/reporting only until a real moderation provider is connected.
- Frontend state comes from APIs rather than hard-coded metrics. Mobile uses the existing black/white/yellow responsive shell and draggable sheets, upgraded to accessible dialogs with 44px minimum targets.
- CI runs install from lockfile, lint, unit tests, build, and Playwright smoke tests before main is considered releasable.

## Data model additions
1. `schema_migrations(version text primary key, applied_at timestamptz)`
2. `user_profiles(user_id, bio, location, timezone, is_active, deactivated_at, updated_at)` or equivalent additions on `users`; implementation will prefer additions on `users` to keep joins simple.
3. `matches.skill_id`, `matches.requested_by`, accepted/declined timestamps.
4. `notifications(id, user_id, type, payload, read_at, created_at)`.
5. `user_blocks(blocker_id, blocked_id, created_at)`.
6. `session_feedback(id, session_id, author_id, rating, comment, created_at)`.
7. `moderation_events(id, session_id, actor_id, event_type, metadata, created_at)` for explicit reports/check-ins only.
8. `learning_sessions.livekit_room`, `duration_seconds`, `ended_reason`.

## Security rules
- Protected APIs return 401 when no token is present and 403 when authenticated but not authorized for the target resource.
- No request body field determines ownership.
- Database writes use parameterized Neon template queries.
- Account deletion runs server-side and deletes/deactivates database state before Firebase account deletion is finalized from the client.
- AI usage is limited by verified UID and remote IP. Redis absence in production returns 503 for AI generation.
- Health output exposes booleans/model labels only, never secrets or connection details.
- Security headers include CSP, Referrer-Policy, X-Content-Type-Options, frame-ancestors/anti-framing, and a restrictive Permissions-Policy that still permits same-origin camera/microphone for calls.

## Product behavior
### Profile and skills
Users can read/update their profile, add/remove teach/learn skills, and onboarding completion is derived from persisted profile/skill data.

### Matching
Candidate matching joins teach/learn skill pairs in both directions, excludes blocked/self/inactive users, returns a compatibility score, and supports request/accept/decline.

### Messaging and notifications
Accepted matches can create a conversation. Only conversation members can list/send messages. Sending a message creates a notification for the other participant. Polling is used initially for messages/notifications to stay within the existing stack; LiveKit is reserved for realtime media.

### Calls and sessions
Authenticated accepted matches can create a session and receive a LiveKit access token. UI handles permission denied, connecting, reconnecting, remote participant join/leave, mute/camera toggles, and end-session persistence. No fake identity/AI moderation claims remain.

### Analytics
Analytics are computed from completed sessions, matches, and persisted events. Dashboard and analytics pages show real totals; empty state is shown when there is no data.

### Account lifecycle
Deactivate sets the user inactive and signs them out. Delete performs transactional app-data cleanup, then the client deletes its Firebase auth user. Blocking is persistent and affects matching/messages.

## Operational constraints
- Existing Next.js 16 / React 19 / Tailwind 4 / Firebase / Neon / Vercel architecture remains.
- Existing yellow/white/black responsive product theme remains.
- Add only necessary dependencies: `firebase-admin`, `livekit-client`, `livekit-server-sdk`, `vitest` and Playwright tooling.
- Do not expose secrets in source or responses.
- Vercel Marketplace integrations/secrets that require user authorization are wired and health-checked; code must fail safely when absent.
