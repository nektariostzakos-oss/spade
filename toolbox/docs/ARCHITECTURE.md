# Architecture

> High-level view. Deeper docs land as phases complete.

## Topology

```
            ┌────────────┐    ┌────────────┐
  Web App   │  Next 15   │    │  Admin     │  Next 15 · internal ops
 (Vercel)   └─────┬──────┘    └─────┬──────┘
                  │                  │
                  └─────┬────────────┘
                        │ HTTPS (typed fetch)
                  ┌─────▼──────┐
                  │  Fastify   │  @toolbox/api · zod-validated routes
                  │   API      │  · Result<T> responses
                  └─────┬──────┘
                        │
         ┌──────────────┼─────────────────────────────┐
         │              │                              │
   ┌─────▼─────┐  ┌─────▼──────┐               ┌──────▼──────┐
   │ Postgres  │  │  Redis     │               │  Mux        │
   │ + pgvector│  │  + BullMQ  │               │  + Live     │
   └───────────┘  └─────┬──────┘               └─────────────┘
                        │
                  ┌─────▼──────┐
                  │  Workers   │  embeddings, matching, moderation,
                  │  (BullMQ)  │  notifications, webhooks
                  └────────────┘

              ┌────────────┐
   Native app │  Expo      │  Same Fastify API · Clerk auth · Expo Push
  (iOS/Droid) └────────────┘
```

## Package boundaries

- `@toolbox/db` — Prisma client + schema. No route handlers import Prisma
  directly; everything goes through a service in `@toolbox/shared` or the
  app-local service layer.
- `@toolbox/shared` — zod schemas, enums, `Result<T>`, Pino logger. Imported
  by every app.
- `@toolbox/ai` — embeddings, moderation, matching heuristics. Callable from
  both the API (sync endpoints) and workers (async jobs).
- `@toolbox/design-tokens` — single source for color / type / spacing / motion.
  Consumed by `@toolbox/ui-web` (Tailwind preset) and `@toolbox/ui-native`
  (StyleSheet).

## Data flow: lead routing (Phase 4 preview)

1. Homeowner submits a job → `POST /v1/jobs`.
2. API validates with zod, persists `Job` with status `MATCHING`, enqueues
   `lead-routing:<jobId>` on BullMQ.
3. Worker embeds the description (`text-embedding-3-small`), queries pgvector
   for the top-5 pros within `serviceRadiusKm`, scores by
   `recency × rating × response time × distance`.
4. Worker creates `Lead` rows with 60s `expiresAt`, enqueues
   `notifications:lead.sent`.
5. Notifications worker fans out Expo Push + SMS + email.
6. Pro accepts → API charges lead fee via Stripe Connect, sets `Lead.status =
   ACCEPTED`, creates chat channel on Pusher.
