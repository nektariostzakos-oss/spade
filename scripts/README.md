# Licence toolkit

Atelier ships with offline-verifiable, ed25519-signed activation codes. This
folder holds the tools the **seller** (you) uses to mint them. The **buyer**
never runs anything here — they just paste the code into the wizard.

## One-time setup

```bash
node scripts/generate-keypair.mjs
```

Writes:
- `licences/private.pem` — keep offline, never commit, never email
- `licences/public.b64` — paste into `demo/src/lib/license.ts` (replace the
  `PUBLIC_KEY_B64` constant), or set `ATELIER_LICENSE_PUBKEY` env var before
  building the buyer ZIP

Once the public key is baked into the ZIP, every copy of the template can
verify codes you sign with the private key. No phone-home, no API.

## Issue a code manually (e.g. one-off sale)

```bash
node scripts/issue-license.mjs \
  --email buyer@example.com \
  --tier core \
  --domain salon.com
```

Perpetual codes (no expiry) are the default. Add `--expires 2028-01-01` for
time-limited. Code is printed to stdout + appended to `licences/ledger.jsonl`
so you can reissue or revoke later.

## Fully-automated issuance (zero action from you)

`scripts/webhook-lemonsqueezy.mjs` is a template for a purchase-webhook
handler you deploy once to Cloudflare Worker / Vercel Edge / plain Node.

Flow:

1. Buyer completes checkout on Lemon Squeezy / Gumroad / Paddle / Stripe
2. Store fires webhook → your worker
3. Worker verifies the webhook signature, signs a licence with your private
   key, emails the code to the buyer via Resend
4. Buyer pastes code into the wizard's **Admin → Activation code** field
   (or later under **Settings → Licence**)

Required env vars:

| Var                            | What                                           |
|--------------------------------|------------------------------------------------|
| `LEMONSQUEEZY_WEBHOOK_SECRET`  | HMAC secret configured in LS dashboard         |
| `ATELIER_LICENSE_PRIVATE_PEM`  | Full PEM of `licences/private.pem`             |
| `RESEND_API_KEY`               | Transactional email provider API key           |
| `RESEND_FROM`                  | "Atelier &lt;licences@yourdomain.com&gt;"      |

Swap Resend for Postmark / SES / SMTP by editing `emailLicense()`.

## Revoke a code (refunds, fraud)

1. Host a JSON file somewhere stable: `["lic_abc123", "lic_def456", ...]`
2. Set `ATELIER_LICENSE_DENYLIST_URL=https://licences.you.com/denylist.json`
   in the buyer's environment
3. App refreshes once a week in the background; status drops to `unlicensed`
   with reason "revoked" on the next refresh

If you don't set a deny-list URL, revocation is best-effort (code keeps
working). That's fine for low-fraud markets; enable it once sales volume
warrants the extra infra.

## Why this design

- **Offline verification** → buyers on shitty hosts, behind corporate
  firewalls, or on airgapped networks can still activate.
- **No license server to keep alive** → zero ongoing infra for you.
- **Revocation is opt-in** → when you want it, flip the env var.
- **ed25519** → tiny signatures (64 bytes), fast to verify, no RSA key-size
  drama.
- **Payload is JSON** → you can add tier/domain/expiry fields later without
  re-signing existing codes — just bump a version field and handle both.
