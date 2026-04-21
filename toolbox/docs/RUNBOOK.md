# Runbook

Last reviewed: 2026-04 (Phase 7).

## Overview

Three long-running services and one web/admin frontend:

| Service | Hosting | Health |
|---|---|---|
| `@toolbox/api` | Railway | `GET /v1/health` |
| `@toolbox/workers` | Railway | BullMQ dashboard on `/admin/queues` |
| `@toolbox/web` | Vercel | `GET /` (200 expected) |
| `@toolbox/admin` | Vercel | `GET /verification` (behind Clerk) |
| Postgres | Neon (prod), Docker (dev) | pg pool + vector extension |
| Redis | Upstash | `redis-cli -u $REDIS_URL ping` |
| Meilisearch | Fly.io | `GET /health` |

## Local development

```bash
cp .env.example .env
pnpm install
pnpm docker:up                # postgres + redis + meili + mailpit
pnpm db:generate
pnpm db:migrate
pnpm db:seed                  # apprenticeships etc
pnpm dev                      # web/admin/api/workers/native in parallel
```

## Deploys

1. Merge to `main`. CI runs typecheck + lint + unit + E2E.
2. Vercel auto-deploys `apps/web` and `apps/admin`.
3. Railway auto-deploys `apps/api` and `apps/workers` (separate services).
4. Run `pnpm --filter @toolbox/db run migrate:deploy` as a Railway release
   command before `apps/api` comes up.

## Rolling back

- **Web/admin:** Vercel → project → Deployments → "Promote" the last green.
- **API/workers:** Railway → service → Deployments → "Redeploy" the last
  green.
- **Database:** Neon PITR. Fall back to last snapshot (24h window) via
  `neon restore <snapshot-id>` before flipping traffic.

## Rotating secrets

1. Generate new value in the provider dashboard (Clerk / Mux / Stripe /
   OpenAI / Resend / Twilio / PostHog / Sentry).
2. Update Vercel project envs and Railway service envs.
3. Trigger a fresh deploy on each service (Vercel "Redeploy", Railway
   "Restart").
4. Revoke the old value in the provider.

## Restoring the DB

```bash
# from a Neon snapshot
neon restore --snapshot <id> --target production
# or pg_restore locally
pg_restore --no-owner --dbname=$DATABASE_URL ./backup.sql
```

## Load test

```bash
k6 run infra/k6/feed.js -e API_URL=https://api.toolbox.dev
k6 run infra/k6/lead-routing.js -e API_URL=https://api.toolbox.dev -e CLERK_JWT=...
```

Targets: feed p95 < 200ms at 500 RPS sustained; lead-routing p95 < 800ms at
50 VUs for 2 minutes.

## Common incidents

| Symptom | First action | Root-cause suspects |
|---|---|---|
| 5xx spike on `/v1/feed` | Check Railway API metrics, Sentry issues | pgvector index bloat, Redis degradation |
| Clerk sessions rejected | Confirm CLERK_SECRET_KEY matches per env | key rotation not propagated |
| Mux webhook 4xx loop | Inspect `/webhooks/mux` logs in Railway | Mux regenerated signing secret |
| Stripe PaymentIntent fails | Check Stripe dashboard for the account | pro's Stripe Express account not fully onboarded |

## On-call rotation

Handled in PagerDuty. Sentry → PagerDuty integration fires on `error.rate
> 2%` over 5 minutes for any API service.
