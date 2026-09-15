# Vercel integrations

Target Vercel project: `skill-swap`

## Neon
- Environment: `DATABASE_URL`
- Existing project: `skill-swap`
- Run the versioned migrations in `db/migrations/`.

## Upstash Redis
Preferred environment contract:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Compatibility aliases are also accepted:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Google OAuth / NextAuth
Required:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=https://skill-swap-nine-green.vercel.app`

Google production redirect URI:

```text
https://skill-swap-nine-green.vercel.app/api/auth/callback/google
```

Local redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

## Vercel Blob
Avatar uploads use `@vercel/blob` only.

For a newly connected Vercel Blob store, prefer OIDC authentication. Vercel supplies the deployment credential automatically. Older stores can use:
- `BLOB_READ_WRITE_TOKEN`

## LiveKit
Required:
- `LIVEKIT_URL`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## AI
- `NVIDIA_API_KEY`
- `NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL=openrouter/auto`
- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_NAME=Skill Swap`

## Verification
After connecting resources and redeploying, request:

```text
GET /api/health
GET /api/auth/providers
```

`/api/health` verifies database/schema, Redis, Google OAuth configuration, AI and LiveKit. Blob availability is informational because new Vercel Blob stores can use OIDC without a static read/write token.
