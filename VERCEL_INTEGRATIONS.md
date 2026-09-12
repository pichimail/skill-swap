# Vercel integrations

Target Vercel project: `skill-swap`

## Neon
- Marketplace product: Neon
- Application env contract: `DATABASE_URL`
- Existing Neon project prepared for this app: `skill-swap`
- Schema: `db/schema.sql`

## Upstash Redis
- Marketplace product: Upstash for Redis
- Preferred env contract:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Supported Vercel aliases:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`

## Verification
After connecting both resources and redeploying:

```text
GET /api/health
```

Expected response:

```json
{
  "ok": true,
  "database": { "configured": true, "reachable": true },
  "redis": { "configured": true, "reachable": true }
}
```
