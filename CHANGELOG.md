# Changelog

All notable changes to Atelier, in reverse-chronological order. Versions
follow [semver](https://semver.org): MAJOR.MINOR.PATCH.

---

## 1.0.0 — Production-ready

First release intended for third-party resale. Everything a single-location
hair / barber / beauty business needs to go live on a Node-capable host.

### Added — customer-facing
- Multi-step booking flow with service buffer, per-stylist availability,
  lunch breaks, split-day sessions (morning / afternoon).
- Tokenised `/b/[id]?t=…` self-service page — cancel or reschedule via
  email link, no login.
- Add-on upsells at booking step 4 (service.addOnIds).
- "From £X" variable pricing flag.
- Patch-test gate for chemical services (enforced server-side).
- Per-client referral codes (deterministic HMAC, never leaves the server).
- Shop with Stripe-hosted Checkout and auto-issued digital gift cards.
- Gift-card deactivation when parent order is cancelled.
- Privacy + Terms pages auto-filled from business settings.
- GDPR cookie banner (analytics gated behind consent).
- RSS feed at `/blog/rss.xml`.
- llms.txt, sitemap, robots.txt, JSON-LD for LocalBusiness / Service /
  Article / FAQPage / BreadcrumbList.
- Auto-generated `/icon`, `/apple-icon`, `/opengraph-image`.
- Chat concierge with EN + EL knowledge base (local, no external API).
- Trust signals: star rating, review count, "only N spots left today".
- WhatsApp + Call + Directions CTAs on Contact.

### Added — admin
- Launch checklist card on `/admin` with deep links to each setup step.
- Forced password change on first login (mustChangePassword flag).
- Password reset flow via HMAC-signed email link, 1h TTL, timing-safe.
- Numbered setup flow (1. Setup → 9. Tools).
- Walk-in booking modal (bypasses public validation).
- Print-friendly daily schedule at `/admin/schedule`.
- Client profile pages with history, loyalty, birthday, patch-test record,
  referral code.
- Gift cards redemption panel.
- Coupons wired to orders + bookings server-side.
- Booking CSV export (admin-full or barber-scoped).
- Audit log viewer.
- Stripe + timezone + review-URL + booking-rules settings UI.
- SMTP presets for Gmail / Brevo / Mailgun / SendGrid / Office 365.
- Role scoping — `barber` users see only their own bookings.

### Added — engineering
- Server-side price authority on `/api/orders` (client prices ignored).
- Server-side availability enforcement on `/api/bookings` POST
  (buffer-aware, staff-aware, hours-aware, interval-overlap).
- File-write serialisation via in-memory mutex (`lib/fileLock.ts`) on
  bookings / orders / products / gift cards.
- Two-layer rate limiting on `/api/auth`, `/api/bookings`, `/api/orders`
  (IP + email buckets with 1h idle sweep).
- `walkIn: true` blocked for anonymous callers.
- Terminal-state protection — cancelled / completed can't be resurrected.
- PBKDF2 password hashing with 16-byte salt + 100k iterations.
- Per-install secret generation for booking tokens, referral codes,
  password-reset tokens, session cookies.
- Minimum password length 8 chars.
- Cache-Control: no-store on admin / setup / api responses.
- Business-timezone support (IANA string) — all date math flows through
  `lib/tz.ts` with DST-aware wall-clock ↔ UTC conversion.

---

## 0.x — Pre-release

Internal iterations on the Spade Barber demo. No commitment to
backwards compatibility. See `git log` on the `main` branch.
