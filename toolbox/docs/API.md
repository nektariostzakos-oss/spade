# API

Fastify + zod type provider. Base: `/v1`. Webhooks under `/webhooks`.

## Conventions

- **Auth:** Clerk JWT in `Authorization: Bearer <token>`. `request.auth`
  is non-null when valid; routes that need it call `request.requireAuth()`.
- **Validation:** body / query / params parsed by a zod schema from
  `@toolbox/shared`. Failures become `{ ok: false, error: { code:
  'VALIDATION', ... } }` with HTTP 400.
- **Responses:** every handler returns `Result<T>` — `{ ok: true, data }`
  or `{ ok: false, error: { code, message, details? } }`. HTTP status
  comes from `httpStatusFor(code)`.
- **Rate limiting:** 600 req/min per IP via `@fastify/rate-limit`.
- **CSP + helmet:** default-src self, Mux + Stripe explicitly whitelisted.

## Catalog

### Auth

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/v1/auth/bootstrap` | Yes | — |
| GET | `/v1/auth/me` | Yes | — |

### Pro onboarding + profiles

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/v1/pros/onboard` | Yes | `proOnboardingInput` |
| GET | `/v1/pros/me` | Yes | — |
| GET | `/v1/users/:id` | No | — |
| GET | `/v1/users/:id/reviews` | No | — |

### Videos + feed

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/v1/videos/upload` | Yes | `createVideoInput` |
| GET | `/v1/videos/:id` | No | — |
| GET | `/v1/feed?cursor&limit&city` | Optional | — |
| POST | `/v1/videos/:id/like` | Yes | — |
| POST | `/v1/videos/:id/save` | Yes | — |
| POST | `/v1/users/:id/follow` | Yes | — |

### Jobs + leads + payouts

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/v1/jobs` | Yes | `createJobInput` |
| GET | `/v1/jobs/mine` | Yes | — |
| GET | `/v1/leads/inbox` | Yes (Pro) | — |
| POST | `/v1/leads/:id/viewed` | Yes (Pro) | — |
| POST | `/v1/leads/:id/respond` | Yes (Pro) | `{ accept: boolean }` |
| POST | `/v1/payouts/connect-link` | Yes (Pro) | — |

### Reviews + analytics + library

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/v1/reviews` | Yes (Homeowner) | `createReviewInput` |
| GET | `/v1/me/analytics` | Yes (Pro) | — |
| GET | `/v1/me/saves` | Yes | — |

### Live + apprenticeships

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/v1/live/start` | Yes (Pro, paid tier) | — |
| GET | `/v1/live/active` | No | — |
| GET | `/v1/apprenticeships?trade&state&paidOnly&limit` | No | — |

### Admin

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/v1/admin/verifications` | Yes (Admin) | — |
| POST | `/v1/admin/verifications/:proId` | Yes (Admin) | `{ decision: 'approve' \| 'reject' }` |

### Webhooks

| Path | Notes |
|---|---|
| `POST /webhooks/mux` | `video.asset.ready` → marks Video READY + writes embedding; `video.asset.errored` → FAILED |
| `POST /webhooks/stripe` | `account.updated` keeps Stripe Express status in sync |
