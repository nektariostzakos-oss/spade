# FlyerForge

Generate 6 event-flyer assets from one photo and a short form. Pick a template, fill details, download a ZIP.

## Output sizes

| Asset                   | Size        |
| ----------------------- | ----------- |
| Instagram Story         | 1080×1920   |
| Instagram Reel cover    | 1080×1920   |
| Instagram Feed          | 1080×1350   |
| Facebook event cover    | 1200×628    |
| Printable A5 @ 300dpi   | 1748×2480   |
| WhatsApp status         | 1080×1920   |

## Local setup

```bash
npm install
cp .env.local.example .env.local    # add your REMOVE_BG_API_KEY
npm run dev
```

Open http://localhost:3000.

## Fonts

Place these `.ttf` files in `public/fonts/` before first run:

- `BebasNeue-Regular.ttf`
- `PlayfairDisplay-Regular.ttf`, `PlayfairDisplay-Bold.ttf`
- `Inter-Regular.ttf`, `Inter-Bold.ttf`

All available free on Google Fonts.

## Stack

Next.js 15 (App Router) · Satori (JSX → SVG) · Sharp (SVG → PNG) · JSZip · shadcn/ui primitives · Remove.bg.
