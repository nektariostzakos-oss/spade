# Runbook

> Populated in Phase 7 (Production hardening). Placeholder so the phases-to-paths map stays stable.

## Local dev

- `pnpm docker:up` — start local Postgres + Redis + Meilisearch + Mailpit.
- `pnpm dev` — run web / admin / api / workers / native in parallel.
- `pnpm db:migrate` — run pending Prisma migrations.

## Incident playbook

TBD.

## Deploy

TBD.

## Rollback

TBD.
