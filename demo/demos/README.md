# Atelier — Adding a Template

Each industry ships as a self-contained bundle in `demos/<id>/`. The Atelier installer (`/setup`) discovers them automatically via `GET /api/templates`.

## Bundle layout

```
demos/<id>/
├── meta.json                 spec sheet (theme, fonts, branding, nav, booking, industry)
└── data/
    ├── content.json          hero, info, gallery, about, team, FAQ, testimonials, CTA, contact
    ├── products.json         catalog (with EN/EL + image per item)
    ├── services.json         services / experiences (optional, service-businesses only)
    ├── staff.json            team with bios + portraits (optional)
    ├── pages.json            6+ blog posts (EN/EL, cover, category)
    └── blog-categories.json  taxonomy
```

Plus `public/demos/<id>/cover.svg` (wizard card thumbnail) and `public/brand/<id>-{logo-light,logo-dark,favicon}.svg`.

## meta.json schema

| Key | Required | Notes |
|---|---|---|
| `id`, `name`, `industry`, `tagline`, `description` | yes | Wizard card metadata |
| `cover` | yes | Path to `/demos/<id>/cover.svg` |
| `accentColor` | yes | Hex used in the wizard card |
| `theme` | yes | 10 tokens — `background`, `foreground`, `primary`, `primaryAccent`, `surface`, `surfaceStrong`, `border`, `borderStrong`, `muted`, `muted2` |
| `typography` | yes | `headingFont` + `bodyFont` from `geist`/`inter`/`manrope`/`playfair`/`cormorant`/`fraunces` |
| `branding` | yes | `wordmark`, `tagline_en/el`, `logoUrl`, `logoUrlDark`, `faviconUrl` |
| `nav` | yes | `links[]` (id, label_en, label_el, href, enabled) + `bookLabel_en/el`, `bookHref` |
| `bookingMode` | yes | `"appointment"` (services) or `"reservation"` (tables/seats) |
| `industryId` | yes | Switch key for `src/app/page.tsx` industry routing |
| `features[]`, `stats{}` | yes | Wizard card specs |

## Playbook

1. **Research** (45 min) — five top sites in the industry. Note palette, typography pairing, photography style, hero composition, nav vocabulary, booking flow.
2. **Bundle scaffolding** (30 min) — copy `demos/barber/` to `demos/<id>/`, edit `meta.json` per the schema above.
3. **Brand assets** (20 min) — minimal wordmark logo (light + dark variants) + favicon tile in `public/brand/`. Cover SVG in `public/demos/<id>/`.
4. **Real photography** (30 min) — curate ~25 verified Unsplash IDs (hero, gallery, about, contact, CTA, staff portraits, blog covers, products if not using SVG). Verify each returns 200 before committing.
5. **Copy** (45 min) — write `content.json` with full hero / about / team / FAQ / testimonials / contact blocks in EN + EL.
6. **Catalog** (45 min) — `products.json` (12–18 items), `services.json`, `staff.json`, `pages.json` (6 blog posts), `blog-categories.json`.
7. **Industry-specific layout** (optional, 60 min) — if standard sections don't fit, add `src/app/components/<id>/<Industry>Hero.tsx`, `<Industry>Home.tsx`, etc., and branch in `src/app/page.tsx`:
   ```tsx
   if (industry === "<id>") return <IndustryHome />;
   ```
8. **Route aliases** (optional) — if the industry uses different URLs (`/menu`, `/treatments`, `/rooms`), add `src/app/<alias>/page.tsx` that imports the existing data + a tailored layout component.
9. **Booking variant** (only if neither `appointment` nor `reservation` fits) — extend `BookingMode` union and ship `<NewBookingFlow />`.
10. **Test** — duplicate `demo/` to `demo-<id>/`, swap `data/` to bundled files, run on a separate port.
11. **Ship** — commit. CI rebuilds the four ZIP artefacts at the repo root automatically.

## Estimated effort

~4–6 hours per template. The architecture (install API, wizard, theme engine, light-theme overrides, booking modes, industry switching, logo swapping) is fully in place. Most time goes into **content + photography curation** — not code.

## Light vs dark templates

- Cocoa-on-cream / true light templates: the layout auto-applies `data-theme="light"` on `<html>` based on `theme.background` luminance. Components that hardcoded `text-white/X` get auto-remapped to `var(--foreground)` via scoped CSS overrides in `globals.css`. Nav uses `branding.logoUrlDark`.
- Dark templates: defaults work as-is. Use `branding.logoUrl` (cream text).

## Existing bundles

| ID | Brand | Industry | Booking |
|---|---|---|---|
| `barber` | Oakline | Barber shop | appointment |
| `restaurant` | Verde Cucina | Italian restaurant | reservation |
