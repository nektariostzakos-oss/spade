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

## Deploy to Vercel (mobile-friendly)

Tap the button, sign in with GitHub, and Vercel gives you a public URL in ~60s. The build fetches the 5 fonts from Google Fonts at runtime — you don't need to commit any `.ttf` files.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnektariostzakos-oss%2Fspade&root-directory=flyerforge&env=REMOVE_BG_API_KEY&envDescription=Get%20a%20free%20key%20from%20remove.bg%20(50%20images%2Fmonth)&envLink=https%3A%2F%2Fwww.remove.bg%2Fapi&project-name=flyerforge&repository-name=flyerforge)

**Important:** the button clones the **default branch**. If FlyerForge still lives on `claude/build-flyerforge-Y9eoN`, either:
- Merge the branch to `main` first, then tap the button, **or**
- On Vercel, **Add New → Project → Import** the repo manually, pick branch `claude/build-flyerforge-Y9eoN`, set **Root Directory** to `flyerforge`, and add the `REMOVE_BG_API_KEY` env var.

`REMOVE_BG_API_KEY` is optional — the app falls back to the original photo if it's missing or invalid.

## Local setup

```bash
npm install
cp .env.local.example .env.local    # optional: add REMOVE_BG_API_KEY
npm run dev
```

Open http://localhost:3000.

## Fonts

Fonts are resolved in this order:

1. Local `.ttf` files in `public/fonts/` — fastest, no network.
2. Google Fonts CDN at runtime — fallback, cached in process memory after first request.

To cache locally (optional), drop these files into `public/fonts/`:

- `BebasNeue-Regular.ttf`
- `PlayfairDisplay-Regular.ttf`, `PlayfairDisplay-Bold.ttf`
- `Inter-Regular.ttf`, `Inter-Bold.ttf`

All free on Google Fonts.

## Stack

Next.js 15 (App Router) · Satori (JSX → SVG) · Sharp (SVG → PNG) · JSZip · shadcn/ui primitives · Remove.bg.
