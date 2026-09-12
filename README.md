This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production data layer: Neon + Upstash on Vercel

### Neon Postgres

Connect **Neon** to the `skill-swap` Vercel project from the Vercel Marketplace. The native integration injects `DATABASE_URL`. The application reads that variable only on the server through `src/lib/db.ts`.

The production schema is tracked in `db/schema.sql` and contains users, skills, matches, conversations, messages, roadmaps, learning sessions and analytics events.

### Upstash Redis

Connect **Upstash for Redis** to the same Vercel project. The app supports the native `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` variables and Vercel `KV_REST_API_URL` / `KV_REST_API_TOKEN` aliases.

Redis is used for AI-roadmap cache and rate limiting. `/api/health` verifies both Postgres and Redis after deployment.

### Environment

Copy `.env.example` for local development. Never commit `.env.local` or production credentials.
