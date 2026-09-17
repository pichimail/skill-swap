# Skill Swap

Peer skill exchange: Google sign-in, reciprocal matching, messaging, LiveKit calls, AI roadmaps, and analytics. Product data lives in Neon Postgres. Redis rate-limits AI. Avatars use Vercel Blob.

## Stack

- Next.js 16 App Router, React 19, NextAuth Google OAuth
- Neon Postgres (`db/migrations`)
- Upstash Redis
- LiveKit Cloud realtime video
- NVIDIA primary / OpenRouter fallback for roadmaps
- Vercel Blob avatars

## Local setup

```bash
cp .env.example .env.local
# Fill DATABASE_URL, Google OAuth, NEXTAUTH_*, LiveKit, AI, and Redis/KV values.
npm ci
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Google, add teach/learn skills, then match, message, and call against live data.

Google redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://skill-swap-nine-green.vercel.app/api/auth/callback/google
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local app |
| `npm run db:migrate` | Apply `db/migrations` to `DATABASE_URL` |
| `npm run test:run` | Unit tests |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm run check` | Lint, tests, build |

Vercel builds run `npm run db:migrate && npm run build`.

## Health

`GET /api/health` reports database, schema version `002_product_hardening`, Redis, Google OAuth, Blob, LiveKit, and AI. Missing required production services return `503`.
