# Atelier app — `demo/`

The Next.js 16 application that powers every Atelier template. Owned by Mindscrollers LLC.

> 📦 Repo overview & ZIP downloads → [`../README.md`](../README.md)
> 🚀 Hostinger deploy → [`DEPLOY.md`](DEPLOY.md)
> 🧱 Add a new template → [`demos/README.md`](demos/README.md)

---

## Quickstart

```bash
npm install
npm run dev      # http://localhost:3000
```

First visit hits `/setup` (Atelier installer wizard) when `data/settings.json.onboarded` is `false`. Pick a template, fill business info, install — you're live.

Already onboarded? Sign in at `/admin/login` (default seed: `admin@spade.gr` / `spade2026` if `users.json` is empty on boot).

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Turbopack dev on `:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve `.next/` on `${PORT:-3000}` |
| `npm run lint` | ESLint (advisory) |
| `npm run zip` | Rebuild deploy ZIPs at repo root |

---

## Folder map

```
src/
├── app/                            Next.js App Router
│   ├── page.tsx                    home — switches by industryId
│   ├── admin/, setup/              private surfaces (no Nav/Footer)
│   ├── menu/, experiences/         restaurant aliases for /shop, /services
│   ├── api/                        REST endpoints (install, templates, products…)
│   └── components/
│       ├── Nav, Footer, Hero, ...  base components (theme-aware via CSS vars)
│       └── restaurant/             industry-specific section variants
├── lib/                            data access + helpers
│   ├── settings.ts                 type defs + load* helpers
│   ├── bookings, orders, products, ...   JSON-store CRUD
│   └── industryPresets.ts          legacy preset list
└── proxy.ts                        Next middleware: /setup gate + preview cookie

data/                               runtime storage (gitignored selectively)
demos/<id>/                         template bundles (meta.json + data/)
public/
├── brand/                          per-template logos + favicons
├── products/, menu/, blog/, restaurant-blog/   themed icon SVGs
├── demos/<id>/cover.svg            template card art for the wizard
└── uploads/                        user-uploaded images (never committed)
```

---

## Data files (`data/*.json`)

| File | Holds | Cleared on clean install |
|---|---|---|
| `bookings.json` | Appointments / reservations | ✓ |
| `orders.json` | Shop orders | ✓ |
| `clients.json` | Derived client list | ✓ |
| `views.json`, `audit.json` | Telemetry | ✓ |
| `waitlist.json`, `reviews.json` | Operational | ✓ |
| `emails.log.json` | Sent-mail log | ✓ |
| `users.json` | Admin/staff accounts | ✓ (re-seeds on first boot) |
| `settings.json` | Site config (theme, nav, branding, business) | overwritten by template meta |
| `content.json` | Editable copy (hero, gallery, team, FAQ…) | copied from template |
| `products.json` | Catalog | copied from template |
| `pages.json`, `blog-categories.json` | Blog | copied from template |
| `services.json`, `staff.json` | Service-businesses | copied from template if present |
| `secret.json` | Session HMAC secret | auto-generated, **never commit** |

---

## Theme system

CSS custom properties live in `:root` (10 tokens — see `globals.css`). `data/settings.json.theme` overrides at runtime via inlined `<style>` in `layout.tsx`. Light templates auto-apply `data-theme="light"` on `<html>`, which scopes `globals.css` overrides that remap `text-white/X`, `bg-white/X`, `border-white/X` Tailwind utilities to `var(--foreground)`-based equivalents — no per-component refactor required.

Logos: `branding.logoUrl` (cream text, default) + `branding.logoUrlDark` (dark text, used when light theme is active). Nav swaps automatically.

---

## Booking modes

- `appointment` → `<BookingFlow>` — service → barber → date → slot → guest
- `reservation` → `<ReservationFlow>` — party size → date → time → guest

Set per-template in `meta.json.bookingMode`. Read at runtime by `loadBookingMode()` in `src/app/book/page.tsx`.

---

## Industry switching

`src/app/page.tsx` branches on `loadIndustryId()`. Each industry can supply its own `<IndustryHome>` composite of section components in `src/app/components/<id>/`. Default falls through to the generic Hero/InfoStrip/ServicesPreview/ShopPreview/Testimonials/CTA chain.
