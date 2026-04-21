# Atelier · Next.js template installer

Premium multi-industry Next.js template system with a first-install wizard.
Ships two downloadable ZIPs at the repo root, kept fresh on every push:

| File | When to use |
|---|---|
| **`spade-nextjs-clean.zip`** | First-time customer install — triggers the Atelier setup wizard on first visit. |
| **`spade-nextjs.zip`** | Demo / preview variant — seeded with full Spade Barber content. |
| `spade-nextjs-clean.tar.gz` / `spade-nextjs.tar.gz` | Same payloads, gzip tarballs for SCP workflows. |

## Local development

```bash
cd demo
npm install
npm run dev
# open http://localhost:3000
```

## Rebuild the deploy ZIPs

```bash
# from the repo root
python build-zip.py
# or, from inside demo/
npm run zip
```

Artifacts land at the repo root — the four files above.

## Auto-rebuild on push

`.github/workflows/build-zip.yml` runs on every push to `main` that touches
`demo/`, `build-zip.py`, or the workflow itself. It regenerates the four
artifacts and commits them back with message `ci: rebuild deployment ZIPs`,
so the downloadable files at the repo root are always in sync with the
source.

## Deploying to Hostinger

See [`demo/DEPLOY.md`](demo/DEPLOY.md) for the full hPanel + Node.js walkthrough.
Short version: unzip into `public_html/`, create a Node.js app (Node 20+),
run `npm install && npm run build`, start the app.

## Repo layout

```
code/
├── build-zip.py                  # Reproducible ZIP builder
├── spade-nextjs.zip              # Auto-generated (do not hand-edit)
├── spade-nextjs-clean.zip        # Auto-generated
├── spade-nextjs.tar.gz           # Auto-generated
├── spade-nextjs-clean.tar.gz     # Auto-generated
├── demo/                         # The actual Next.js app
│   ├── src/                      # App router, libs, components, APIs
│   ├── public/                   # Static assets (uploads excluded from zip)
│   ├── data/                     # JSON-file storage (bookings, products…)
│   ├── demos/barber/             # Template bundle used by the installer
│   ├── package.json
│   └── DEPLOY.md
└── .github/workflows/build-zip.yml
```
