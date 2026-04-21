# Deploy to Hostinger

Atelier ships as a standard Node.js Next.js app. Works on any Hostinger plan that exposes Node.js (Cloud, Business, VPS).

## 1. Pick your variant

| ZIP | When |
|---|---|
| `spade-nextjs-clean.zip` | New customer — first visit triggers the Atelier installer wizard at `/setup` |
| `spade-nextjs.zip` | Demo / preview — pre-seeded with Spade Barber content, ready at `/` |

Both are at the repo root, kept fresh by CI.

## 2. Upload + extract

hPanel → **Files → File Manager** → `public_html/`. Upload the ZIP, right-click → **Extract**.

## 3. Create the Node.js app

hPanel → **Advanced → Node.js → Create application**.

| Field | Value |
|---|---|
| Application mode | Production |
| Node.js version | **22 LTS** (or 20 / 24 — anything ≥ 20.9) |
| Application root | extracted folder, e.g. `public_html/atelier` |
| Application URL | your domain or subdomain |
| Startup file | `node_modules/next/dist/bin/next` · args `start` |

Leave env vars empty — SMTP and analytics are configured later from the admin UI.

## 4. Install + build

In the Node.js panel click **Run NPM Install**. When done, open **Terminal**:

```bash
cd ~/public_html/atelier
npm run build
```

Click **Restart Application**. Site is live.

## 5. First-time setup

- **Clean variant:** visit your URL → the **Atelier wizard** opens. Pick a template (Spade Barber, Verde Cucina), choose demo data or clean install, fill business info, create admin account, install. ~2 minutes.
- **Demo variant:** visit `/admin/login` — default seed `admin@spade.gr` / `spade2026`. Change the password immediately in **Settings → Users**.

## 6. Wire up email + analytics (optional)

Admin → **Settings → General** → SMTP fields (host, port, user, pass, from). Send test. Booking confirmations + 8h reminders start flowing immediately.

GA4 / GTM / Meta Pixel IDs go in **Settings → Analytics**.

## 7. Ongoing

- Edit content with the ✎ pencils (visible only when admin is signed in)
- Backup any time from **Admin → Settings → Tools → Download backup**
- Restore from a `.json` snapshot the same way
- Pull a fresh ZIP from the GitHub Releases / repo root any time you want to upgrade — drop `data/` from the old install into the new one

## Troubleshooting

| Symptom | Fix |
|---|---|
| 502 / app won't start | Hostinger Node.js panel → Logs. Most often missing `npm run build` step. |
| `/admin` infinite-loops to `/setup` | `data/settings.json` has `"onboarded": false`. Run the wizard, or set it to `true`. |
| Photos broken | CSP blocks the host. `next.config.ts` already allows `images.unsplash.com` — add yours to `images.remotePatterns`. |
| Email never arrives | SMTP credentials wrong. Test in Settings → Send test email. Check `data/emails.log.json` for queued items. |
| Logo doesn't appear | Hard refresh — SVG cache pinned 5 min via `next.config.ts`. Or check `data/settings.json.branding.logoUrl` exists. |
