# Atelier · Next.js Template System

**© Mindscrollers LLC.** Premium multi-industry website template engine with a first-install wizard. Built and maintained by Mindscrollers LLC.

---

## What ships at the repo root

| File | Use case |
|---|---|
| `spade-nextjs-clean.zip` | **First-time install** — boots the Atelier wizard |
| `spade-nextjs.zip` | **Demo preview** — pre-seeded with full Spade Barber content |
| `*.tar.gz` siblings | Same payloads for SCP / Linux servers |

CI rebuilds all four on every push that touches `demo/` or `build-zip.py` — see [`.github/workflows/build-zip.yml`](.github/workflows/build-zip.yml).

---

## Templates included

| ID | Brand | Industry | Booking | Palette |
|---|---|---|---|---|
| `barber` | Spade | Barber shop | Appointment | Dark gold-on-black |
| `restaurant` | Verde Cucina | Italian restaurant | Reservation | Premium dark trattoria |

Adding a third: see [`demos/README.md`](demo/demos/README.md).

---

## Local dev

```bash
cd demo
npm install
npm run dev          # http://localhost:3000
```

Two side-by-side instances? Duplicate `demo/` → `demo-barber/`, swap `data/`, `npx next dev -p 3001`.

---

## Deploy to Hostinger

Walkthrough: [`demo/DEPLOY.md`](demo/DEPLOY.md). Short version — unzip into `public_html/`, hPanel → Node.js (v22 LTS), `npm install && npm run build`, Start.

---

## Rebuild ZIPs

```bash
python build-zip.py        # from repo root
npm --prefix demo run zip  # or via npm
```

Outputs: `spade-nextjs.zip`, `spade-nextjs-clean.zip`, plus tarballs.

---

## Repo layout

```
code/
├── README.md                       you are here
├── build-zip.py                    reproducible bundle builder
├── spade-nextjs{,-clean}.{zip,tar.gz}    auto-generated (CI)
├── .github/workflows/build-zip.yml CI
├── demo/                           Next.js 16 app (App Router)
│   ├── DEPLOY.md                   Hostinger guide
│   ├── data/                       runtime JSON storage
│   ├── demos/<id>/                 template bundles (barber, restaurant)
│   ├── public/brand/               per-template logo + favicon SVGs
│   ├── public/{products,menu,blog,restaurant-blog}/   themed icon SVGs
│   └── src/{app,lib}/              routes, components, API, libs
└── docker/                         optional Apache + PHP-WP host (legacy)
```

---

## Stack

Next.js 16 · App Router · React 19 · TypeScript strict · Tailwind v4 · Framer Motion · Sharp · Nodemailer · `@anthropic-ai/sdk` (optional copy generator only)

JSON-file storage (no DB), signed-cookie sessions (PBKDF2), CSP headers, rate-limited APIs, WCAG 2.2 AA.
