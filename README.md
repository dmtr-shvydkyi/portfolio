# Dmytro Shvydkyi Portfolio

Personal portfolio website built with Next.js App Router.

## Source Of Truth

The canonical product and technical documentation lives in `docs/website-prd.md`.

Policy:
- Every change to UI, behavior, content, state, API, analytics, SEO, or infrastructure must include a matching update to `docs/website-prd.md` in the same PR.
- If code and docs conflict, treat docs as stale and update docs immediately before merge.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- Redis (snake leaderboard)
- Vercel Analytics and Speed Insights

## Getting Started

Install dependencies:

```bash
npm install
```

Run local development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start dev server on port 3000
- `npm run clean` - remove `.next` cache
- `npm run dev:clean` - clean then run dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Environment Variables

Leaderboard API requires Redis connection. Supported environment variable names:
- `REDIS_URL`
- `REDIS_TLS_URL`
- `VERCEL_REDIS_URL`
- `VERCEL_REDIS_TLS_URL`

If Redis is not configured, the site still renders, but leaderboard reads and writes will fail gracefully.
