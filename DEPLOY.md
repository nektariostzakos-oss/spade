# Deploying Spade Next.js to Hostinger

## Prerequisites

Your Hostinger plan must support Node.js:
- **Cloud Hosting** ✅
- **Business Hosting** ✅
- **VPS** ✅
- Premium / Single shared ❌ (PHP only)

Check in hPanel → **Advanced → Node.js** — if the menu appears, you're good.

## Steps (Cloud / Business hosting via hPanel)

### 1. Upload the files

1. hPanel → **Files → File Manager**
2. Open the `public_html` folder (or create a subfolder for the app)
3. Upload `spade-nextjs.zip`
4. Right-click the zip → **Extract** → into the current folder
5. You should now have `demo/` (or whatever you named it) with `package.json`, `src/`, `public/`, `data/`, etc.

### 2. Create the Node.js app

1. hPanel → **Advanced → Node.js**
2. Click **Create app**
3. **Application mode:** Production
4. **Node.js version:** 20 or 22 (latest LTS)
5. **Application root:** the path to the extracted folder (e.g. `public_html/demo`)
6. **Application URL:** your domain or subdomain
7. **Application startup file:** `node_modules/next/dist/bin/next` with args `start` — or use the npm script (see below)
8. **Environment variables:** leave empty for now (SMTP is configured via the admin UI)
9. Click **Create**

### 3. Install dependencies + build

In the Node.js app panel, click **Run NPM Install**. Wait for it to complete.

Then open the terminal (hPanel → Advanced → Terminal, or SSH):

```bash
cd ~/public_html/demo     # (or your path)
npm run build
```

This creates the `.next/` production build.

### 4. Start the app

Back in hPanel → Node.js → click **Start Application** (or **Restart** if it was running).

Your site is live at the domain you configured.

### 5. First-time setup

1. Visit `yourdomain.com/admin/login`
2. Login: `admin@spade.gr` / `spade2026`
3. Go to **Settings → SMTP** → enter your email provider details → save → send test email
4. Change your admin password in **Users** tab
5. Edit content from any page via the ✎ Edit pills (logged-in admin only sees them)

## What's in the zip

- `src/` — all app code (React components, API routes, lib helpers)
- `public/` — static assets + `public/uploads/` for image uploads
- `data/` — JSON data: bookings, orders, products, users, content, settings. **Back up regularly!**
- `package.json`, `package-lock.json` — dependency manifest
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` — config
- `src/instrumentation.ts` — boots the 8-hour reminder cron on server start
- `DEPLOY.md` — this file

## Updating the site later

Edit files locally, rebuild the zip (excluding `node_modules` + `.next`), upload via File Manager, extract, then:

```bash
npm install   # only if dependencies changed
npm run build
# Then restart the Node.js app in hPanel
```

## Backups

Download `data/` periodically — it holds every booking, order, user, and piece of editable content.

## Troubleshooting

- **Port conflict** → Hostinger sets the PORT env var; our `npm start` reads it automatically.
- **Images not loading** → make sure `public/uploads/` is writable (permission 755 on dir, 644 on files).
- **Email not sending** → Settings tab shows SMTP status. Use **Send test email** button.
- **Cron reminders not firing** → the scheduler runs in-process. If the Node app sleeps (free-tier hosts), you'd need an external cron job hitting `GET /api/cron/reminders` every 5 minutes.

## Alternative: deploy on Vercel (free + easier)

If you'd rather skip Hostinger setup, push this folder to a GitHub repo and import it on **vercel.com**. Deploys in ~90 seconds, free SSL, automatic redeploys on git push. Only the `data/` folder needs handling — Vercel's serverless functions don't persist files between requests, so for production use on Vercel you'd need to move data to a database. For Hostinger Cloud/Business (persistent filesystem), the JSON storage works fine.
