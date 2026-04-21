# Toolbox

TikTok-style vertical video for the trades. Three-sided marketplace: pros post
work, homeowners book jobs, apprentices discover careers.

> **Status:** Phase 0 · Foundation. See [`CLAUDE_BRIEF.md`](./CLAUDE_BRIEF.md)
> for the phased delivery plan.

## Stack

Monorepo (Turborepo + pnpm) · Next.js 15 (web, admin) · Expo (native) ·
Fastify (api) · BullMQ (workers) · PostgreSQL 16 + pgvector · Redis ·
Meilisearch · Clerk · Mux · Stripe Connect · OpenAI (embeddings +
moderation).

## Layout

```
apps/
  web/      Next.js 15 — public web app
  admin/    Next.js 15 — internal ops + verification queue
  native/   Expo + Expo Router — iOS/Android
  api/      Fastify + zod — HTTP API
  workers/  BullMQ — background jobs
packages/
  db/              Prisma schema + client (pgvector)
  shared/          zod schemas, enums, Result<T>, logger
  design-tokens/   canonical color/type/spacing/motion tokens
  ui-web/          shadcn-themed web components
  ui-native/       React Native components
  ai/              OpenAI embeddings + moderation wrappers
  config/          shared tsconfig presets + Tailwind preset
infra/
  docker-compose.yml
  postgres/init.sql   pgvector + pg_trgm enabled at container init
```

## Prerequisites

- **Node 22** (`.nvmrc`) · **pnpm 9+** · **Docker** (for Postgres / Redis /
  Meilisearch / Mailpit).

## One-command setup

```bash
cp .env.example .env
pnpm install
pnpm docker:up          # postgres + redis + meilisearch + mailpit
pnpm db:migrate         # creates schema, generates prisma client
pnpm dev                # web, admin, api, workers, native (Metro) in parallel
```

Then open:

| URL | What |
|---|---|
| http://localhost:3000 | web app |
| http://localhost:3100 | admin console |
| http://localhost:4000/v1/health | api health probe |
| http://localhost:8025 | Mailpit (captured outbound email) |
| http://localhost:7700 | Meilisearch |

For the native app, `pnpm --filter @toolbox/native dev` opens Expo; scan the
QR code with the Expo Go app or press `i`/`a` for a simulator.

## Common scripts

```bash
pnpm dev                 # everything in parallel
pnpm build               # turbo build all apps + packages
pnpm typecheck           # strict TS across the repo
pnpm lint                # eslint across the repo
pnpm test                # vitest across the repo
pnpm format              # prettier --write .

pnpm docker:up           # start local services
pnpm docker:down         # stop local services
pnpm docker:logs         # tail all service logs

pnpm db:migrate          # prisma migrate dev
pnpm db:studio           # open Prisma Studio
pnpm db:seed             # seed demo data
```

## Environment variables

Every env var is documented in `.env.example`. `turbo.json` declares the full
`globalEnv` allowlist so Turborepo caches correctly across processes.

## Code quality

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`.
- Every API route validates input with zod schemas from `@toolbox/shared` and
  returns a typed `Result<T>` — errors never cross the wire as thrown
  exceptions.
- No `console.log` in committed code — use the Pino logger from
  `@toolbox/shared`.
- Conventional Commits, PRs squashed. Husky + lint-staged gate each commit.

## Phase checkpoints

See [`CLAUDE_BRIEF.md §6`](./CLAUDE_BRIEF.md). Work stops at the end of each
phase for review before the next starts.
