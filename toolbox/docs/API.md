# API

> Fastify + zod + typed routes. Populated as phases land.

## Conventions

- **Base:** `/v1`
- **Auth:** Clerk JWT in `Authorization: Bearer <token>` (Phase 1+).
- **Validation:** every body/query/params validated with a zod schema from
  `@toolbox/shared`.
- **Responses:** every handler returns `Result<T>`. Success → `data`, error
  → `{ code, message, details? }`. HTTP status comes from
  `httpStatusFor(code)`.

## Phase 0 endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/v1/health` | liveness probe (service, version, uptime) |
