# Claude Code Brief: Toolbox

> Paste this entire file into Claude Code at the root of an empty project directory. Then say: **"Read CLAUDE_BRIEF.md and start Phase 0. Stop after each phase and wait for my confirmation before proceeding."**

---

## 0. Mission

Build **Toolbox** — a TikTok-style vertical-video platform for skilled trades. Three-sided marketplace: trades pros, homeowners booking work, apprentices discovering careers. Production-grade code, mobile-first, designed to ship an investable MVP in 8 weeks.

You are the senior engineer. Make architectural decisions confidently when the brief is silent. When a decision has business implications I should weigh in on, **stop and ask**. Don't ask permission for things that are obviously code-quality choices (linting, file structure, test framework).

---

## 1. Product positioning (read this — it shapes every decision)

**Audience:**
- **Pros** (primary revenue source): plumbers, electricians, HVAC techs, carpenters, roofers, painters, landscapers, handymen. Mostly 25–55, mobile-only, allergic to friction.
- **Homeowners** (demand side): 28–65, want a pro they can trust, hate phone calls, want to see work before booking.
- **Apprentices** (growth flywheel): 16–24, on TikTok all day, looking at trade careers as alternative to college.

**Core loop:**
Pro posts work → algorithm shows it to local homeowners + nationwide apprentices → homeowner taps "Get Quote" → pro pays per qualified lead → pro reinvests in more content.

**Non-negotiables:**
- Mobile-first. Desktop is a courtesy view, not the primary experience.
- Trust layer is a feature, not a checkbox. License + insurance + reviews must be visible everywhere a pro is shown.
- Local relevance > viral reach. A homeowner in Athens, GA doesn't care about a roofer in Athens, Greece.
- Pros must be able to operate the app one-handed on a job site with dirty hands.

---

## 2. Tech stack — locked in, don't deviate without asking

| Layer | Pick | Notes |
|---|---|---|
| Monorepo | Turborepo + pnpm | |
| Web | Next.js 15 App Router + TypeScript (strict) | |
| Mobile | **Expo (React Native) with Expo Router** | Day-1 native — trades pros won't install a PWA |
| Shared UI | Tamagui or React Native Web + custom design tokens | Code share between web and native |
| Styling (web only) | Tailwind v4 + shadcn/ui (latest) | |
| API | Fastify + TypeScript on Node 22 | Separate service, deployed independently |
| Database | PostgreSQL 16 via Prisma | |
| Cache / queue | Upstash Redis + BullMQ | |
| Auth | Clerk | Buy, don't build. Includes phone OTP, critical for trades pros |
| Video pipeline | Mux (Video + Live) | |
| Storage | Cloudflare R2 | |
| Search | Meilisearch | self-hosted on Fly.io |
| Realtime | Pusher Channels | Cheaper than running Socket.io infra |
| Payments | Stripe Connect (Express accounts) | Pros are connected accounts; we platform-fee on transactions |
| Lead routing | OpenAI embeddings + pgvector | Match homeowner job description → best-fit pros |
| Moderation | Hive.ai for video, OpenAI moderation for text | |
| License verification | State CSLB APIs (US) where available; manual upload fallback | |
| Maps | Mapbox | |
| Analytics | PostHog (self-hosted on Hetzner) | |
| Errors | Sentry | |
| Email | Resend | |
| SMS | Twilio | |
| Push | Expo Push for native, Web Push for browser | |
| CI/CD | GitHub Actions + Turbo Remote Cache | |
| Hosting (web) | Vercel | |
| Hosting (api/workers) | Railway | |
| Hosting (db) | Neon (production), local Docker (dev) | |
| Domain/CDN | Cloudflare | |

---

## 3. Improvements over a "standard" TikTok-clone build

1. **AI lead matching, not blind blast.** Embed job description with `text-embedding-3-small`, query pgvector for top-5 nearest pros within radius, score by (recency × rating × response time × distance), notify only those 5.
2. **Verified-only by default.** Pros can post without verification but can't receive paid leads until license + insurance are verified.
3. **First-frame moderation.** Every uploaded video goes through Hive on the first 3 frames + audio transcript before going live.
4. **Two-tower recommendation model.** Ship heuristic first, swap to embedding model later behind the same interface.
5. **Live job streams.** Mux Live, gated behind subscription.
6. **One-handed UX.** Thumb-reachable primary actions, 56pt tap targets, voice-to-text, no dropdowns.
7. **Outdoor-readable design.** Default dark theme, #000 backgrounds, ≥7:1 contrast primary.
8. **Offline-tolerant uploads.** Resumable chunked uploads via UpChunk.
9. **Multi-language from day 1.** `next-intl` + Crowdin. Greek + English at launch.
10. **Stripe Connect Express.** Pros onboard in 4 minutes; KYC handled by Stripe.

---

## 4. Design system — "Worksite Premium"

See `packages/design-tokens/src/index.ts` for the canonical token file.

Aesthetic: the lovechild of Linear and a Milwaukee Tool catalog. Confident, industrial, expensive-feeling.

Reference: Linear (typography, density, motion), Cash App (CTA confidence), Strava (data-viz), Milwaukee Tool packaging (palette).

---

## 5. Monorepo structure

```
toolbox/
├── apps/
│   ├── web/          # Next.js 15
│   ├── native/       # Expo
│   ├── api/          # Fastify
│   ├── workers/      # BullMQ jobs
│   └── admin/        # Internal moderation + verification queue
├── packages/
│   ├── db/           # Prisma schema + client
│   ├── shared/       # zod schemas, types, business logic
│   ├── design-tokens/
│   ├── ui-web/
│   ├── ui-native/
│   ├── ai/           # embedding, matching, moderation wrappers
│   └── config/       # tsconfig, eslint, prettier, tailwind preset
├── infra/
│   ├── docker-compose.yml
│   └── github-actions/
└── docs/
```

---

## 6. Phased delivery — STOP at each checkpoint

**Phase 0 — Foundation** · **Phase 1 — Auth + pro onboarding** · **Phase 2 — Video upload + playback** · **Phase 3 — Vertical feed** · **Phase 4 — Discovery + lead routing** · **Phase 5 — Trust + retention** · **Phase 6 — Live + apprentice mode** · **Phase 7 — Production hardening**

At the end of each phase: stop, summarize, wait for approval.

---

## 7. Database schema

See `packages/db/prisma/schema.prisma` for the authoritative schema.

---

## 8. Code quality standards

- `strict: true`, `noUncheckedIndexedAccess: true`. Zero `any` without `// @ts-expect-error: <reason>`.
- Every API route validates input with zod schemas from `packages/shared`.
- Every API route returns a typed `Result<T>` — no thrown errors crossing the wire.
- No business logic in React components. No direct Prisma in route handlers — go through a service layer.
- Vitest for unit, Playwright for E2E web, Detox for E2E native. 70%+ on `packages/shared`, 100% on payment + lead-routing logic.
- Conventional Commits. PRs squashed.
- No `console.log` in committed code — use Pino.
- Every env var in `.env.example` with a comment.

---

## 9. Ask before deciding

- Launch market · lead-fee pricing · platform fee % · subscription tiers · homeowner ID verification · final brand name · referral program · anything > $50/mo in SaaS

## 10. Definition of done

Sign up as pro, post a video in <60s, homeowner books, pro gets paid via Stripe Connect, review given, analytics visible. Handle 500 concurrent users. Then: TestFlight, 50 pros in one city, 30 days, iterate.
