# Atelier — Hair Salon / Barber Shop / Beauty Studio Template

A complete, production-ready Next.js website template for a single-location
hair / beauty business. **Unzip it on any Node-capable host, open the URL,
follow the 2-minute setup wizard, and you're live.**

Built by Mindscrollers LLC. Powers real salons in the UK and Greece.

---

## What you get

### Customer-facing
- Hero page with live "next available slot" badge and urgency indicators
- Multi-step **booking flow**: service → stylist → date/time → details → confirm
- **Tokenised self-service link** in every confirmation email — clients cancel or reschedule without calling
- Services menu with **"From £X" pricing** and per-service patch-test flags
- **Add-on upsells** at booking step 4 ("Add Bond Treatment +£35")
- Shop with cart, **Stripe-hosted Checkout**, and gift-card auto-issue
- Per-client **referral codes**, loyalty counter, birthday flag
- Contact page with WhatsApp / Call / Directions buttons
- Blog with RSS feed + SEO-friendly article schema
- Chat concierge (local, no external API keys) with EN + EL knowledge base
- Privacy + Terms pages auto-filled from business settings
- **GDPR cookie banner** — analytics gated behind consent
- EN / EL content, adaptive dark/light theme, WCAG 2.2 AA
- SEO: sitemap, robots, llms.txt, canonical URLs, JSON-LD (LocalBusiness, Service, Article, FAQPage)

### Admin
- **Launch checklist** on /admin that walks the owner through the 8 steps to go-live
- **Forced password change** on first login — no lingering default credentials
- Bookings calendar + list, walk-in modal, 8h reminder cron, 2-24h post-visit review request cron
- **Print-friendly daily schedule** grouped by stylist
- Staff manager with weekly availability, lunch breaks, specialties
- Services manager with buffer time, "From £X" toggle, patch-test flag, add-ons
- Gift cards panel (issued, balance, redemption, order-linked deactivation)
- Coupons wired to order + booking checkout server-side
- Clients directory with profile pages (history, notes, loyalty, birthday, patch-test record, referral code)
- Password reset via HMAC-signed email link
- Audit log, backup/restore, GDPR export per client
- Analytics panel (revenue, top services/stylists/products, day-of-week heatmap, conversion)
- SMTP presets for Gmail / Brevo / Mailgun / SendGrid / Office 365
- Stripe + review-URL + timezone settings
- Role-based scoping: `barber` users see only their own bookings

### Engineering
- Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4
- **Server-side price authority** (client-supplied prices are ignored)
- **Server-side availability enforcement** (buffer-aware, staff-aware, hours-aware)
- File-based storage with **in-process write serialisation** (no lost writes)
- **Two-layer rate limiting** on auth, bookings, orders, uploads (IP + email)
- CSP headers, HSTS in prod, `Cache-Control: no-store` on admin/setup/api
- PBKDF2 password hashing, HMAC tokens for cancel + password reset
- Auto-generated `/icon`, `/apple-icon`, `/opengraph-image` per branding

---

## Install (Hostinger / any Node 20.9+ host)

1. Download the ZIP. Pick **`spade-nextjs-clean.zip`** for a blank install.
2. Upload to your host's file manager, extract into your app root
   (e.g. `public_html/salon/`).
3. Create a Node.js app in your host's panel. Set:
   - Node version: **22 LTS** (20 / 24 also fine)
   - Startup file: `node_modules/next/dist/bin/next`
   - Arguments: `start`
   - Environment variable: `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
4. In the host's Terminal panel: `npm ci && npm run build`.
5. Start the app. Open your domain. Follow the 2-minute wizard.

Full step-by-step with screenshots: [`demo/DEPLOY.md`](demo/DEPLOY.md).

---

## First-login checklist (≈5 minutes total)

The admin dashboard guides you with a live checklist. Steps in order:

1. **Brand** — logo, wordmark, tagline
2. **Business** — address, phone, email, coordinates, timezone, opening hours
3. **Booking rules** — lead time, cancellation window, deposit %, no-show fee %
4. **Staff** — add stylists, weekly availability, lunch breaks
5. **Services** — prices, duration, buffer, add-ons, patch-test flag
6. **SMTP** — pick your provider preset, paste credentials, send a test
7. **Stripe** (optional) — paste keys to accept card payments
8. **Theme** — colour palette and fonts
9. **Analytics** (optional) — GA4 / GTM / Meta Pixel IDs
10. **Go live** — run cron once, mark onboarded, remove seed hint

---

## Included templates

| ID | Brand | Industry |
|---|---|---|
| `barber` | **Oakline Scissors** (default) | Hair salon / barber / beauty studio |
| `restaurant` | Verde Cucina | Italian restaurant (reservation-mode booking) |

Adding your own industry: see [`demo/demos/README.md`](demo/demos/README.md).

---

## For developers

```bash
cd demo
npm install
npm run dev           # http://localhost:3000
npm run build
npm run start
```

Tech: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
Framer Motion · nodemailer · sharp. JSON-file storage (no DB). Signed-cookie
sessions. CSP headers. Rate-limited APIs.

ZIPs are rebuilt by CI on every push that touches `demo/` or `build-zip.py`.

---

## Support

- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- License: [`LICENSE`](LICENSE)
- Issues / feature requests: email hello@mindscrollers.com

---

© Mindscrollers LLC. All rights reserved.
