# FlyerForge — Hostinger deploy guide

This folder is a **standalone Next.js build**. It contains everything the app needs to run — you do not need to run `npm install` or `npm run build` on the server.

## What's inside

```
.
├── server.js          ← startup file (Node 18+)
├── package.json
├── node_modules/      ← minimal, includes native sharp binaries for linux x64
├── .next/             ← compiled build
└── public/            ← static assets
```

## Deploy to Hostinger (Node.js hosting)

You need a Hostinger plan with **Node.js support** (Premium Web, Business Web, Cloud, or VPS). On shared plans, Node.js is under **hPanel → Advanced → Node.js**.

### 1. Create the app in hPanel

**hPanel → Advanced → Node.js → Create application**

| Field                       | Value                                                  |
| --------------------------- | ------------------------------------------------------ |
| Node.js version             | **18.x or higher** (20.x recommended)                  |
| Application mode            | Production                                             |
| Application root            | e.g. `flyerforge` (creates `/home/USER/flyerforge/`)   |
| Application URL             | Pick your domain / subdomain                           |
| Application startup file    | `server.js`                                            |

Don't click "Run NPM Install" — dependencies are already bundled.

### 2. Upload this folder's contents

**hPanel → File Manager** → navigate to your **Application root** (e.g. `/home/USER/flyerforge/`).

Upload the contents of this folder (not the folder itself). Easiest way on mobile:

1. Upload the ZIP.
2. Right-click → **Extract**.
3. Move the extracted files into the application root if they landed in a subfolder.

Final layout on the server must look like:

```
/home/USER/flyerforge/
  server.js
  package.json
  node_modules/
  .next/
  public/
```

### 3. Set environment variables (optional)

In the Node.js app settings, add:

- `REMOVE_BG_API_KEY` — [remove.bg](https://www.remove.bg/api) key. Optional — without it, the app falls back to the original photo.
- `ANTHROPIC_API_KEY` — [Anthropic console](https://console.anthropic.com/settings/keys) key. Optional — powers the "Suggest copy" and "Suggest template" AI buttons.
- `OPENAI_API_KEY` — [OpenAI platform](https://platform.openai.com/api-keys) key. Optional — powers the "Generate background" AI image button (~$0.04/image).
- `HOSTNAME=0.0.0.0` — only if Hostinger doesn't set it automatically.

`PORT` is injected by Hostinger's Node.js manager — don't set it manually.

### 4. Start the app

Click **Start** (or Restart) in the Node.js panel. Visit your URL in ~10 seconds.

## Verifying it works

- The homepage should load with the FlyerForge UI in dark mode.
- Upload a small JPG, fill in an event name + date + venue, pick Club Night, click **Generate 6 Assets** — a ZIP should download with 6 PNG files.
- First generation takes a few seconds longer because fonts are fetched from Google Fonts on cold start, then cached in process memory.

## Troubleshooting

**"Application failed to start" / blank page**
- Check the Node.js panel's **logs** tab. Most common: Node version < 18, wrong startup file, or permissions on `node_modules/`.

**"Error: Cannot find module 'sharp'"**
- `node_modules/` didn't fully upload. Re-upload — sharp's native folder is `node_modules/@img/sharp-linux-x64/` and must be intact.

**Image generation hangs or times out on first request**
- Google Fonts CDN is slow/blocked from your host. Drop `.ttf` files into `public/fonts/` (see that folder's README for filenames) to skip the fetch entirely.

**Generation fails with a memory error**
- Increase the app's memory limit in hPanel. The full 6-asset generation (especially A5 1748×2480) needs ~250–400 MB peak.

## Environment specs

- Next.js 15 standalone
- Node 18+ required (tested on Node 22)
- Platform: `linux-x64` (the bundled sharp binary only works on Linux x64 — if your Hostinger VPS is ARM, delete `node_modules/@img/sharp-*` and run `npm install sharp` on the server)
