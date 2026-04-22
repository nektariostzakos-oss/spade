#!/usr/bin/env node
// Auto-issuance webhook for Lemon Squeezy (swap easily for Gumroad / Paddle / Stripe).
//
// Deploy this as a Cloudflare Worker, Vercel Edge Function, or plain Node server.
// Lemon Squeezy will POST here on every successful purchase. The handler signs
// a licence with the private key you generated and emails it to the buyer via
// Resend (swap for Postmark / SES / SMTP as you prefer).
//
// Required env vars:
//   LEMONSQUEEZY_WEBHOOK_SECRET    — set in LS dashboard, used to verify signature
//   ATELIER_LICENSE_PRIVATE_PEM    — full PEM string of your private key
//   RESEND_API_KEY                 — transactional email provider
//   RESEND_FROM                    — e.g. "Atelier <licences@mindscrollers.com>"
//
// Result: zero manual action. Buyer pays → receives code in their inbox
// within seconds → pastes into the wizard.

import crypto from "crypto";

function b64urlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signLicense({ email, tier, domain = "*", expiresAt = null }) {
  const priv = crypto.createPrivateKey(process.env.ATELIER_LICENSE_PRIVATE_PEM);
  const payload = {
    id: `lic_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`,
    tier,
    domain,
    email,
    issuedAt: new Date().toISOString(),
    expiresAt,
  };
  const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf-8"));
  const sig = crypto.sign(null, Buffer.from(payloadB64, "utf-8"), priv);
  return { code: `atl_${payloadB64}.${b64urlEncode(sig)}`, payload };
}

function verifyLemonSqueezySig(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signatureHeader, "hex"));
  } catch {
    return false;
  }
}

async function emailLicense({ to, code, tier }) {
  const body = {
    from: process.env.RESEND_FROM,
    to,
    subject: "Your Atelier activation code",
    text: [
      `Thanks for buying Atelier (${tier}).`,
      "",
      "Paste the code below into the Activation step of the install wizard,",
      "or into Admin → Settings → Licence after install:",
      "",
      code,
      "",
      "The code is perpetual and works offline — you never need to talk to our",
      "server again. Keep this email somewhere safe; you'll need it if you",
      "reinstall.",
      "",
      "— Mindscrollers",
    ].join("\n"),
  };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`resend: ${res.status} ${await res.text()}`);
}

// ======================================================================
// Plain Node handler. Wrap in express / Next route / Cloudflare Worker
// as convenient.
// ======================================================================
export async function handleWebhook(req, res) {
  const raw = await readRaw(req);
  const sig = req.headers["x-signature"];
  if (!verifyLemonSqueezySig(raw, sig)) {
    res.writeHead(401).end("bad sig");
    return;
  }

  const event = JSON.parse(raw.toString("utf-8"));
  const name = event?.meta?.event_name;
  if (name !== "order_created") {
    res.writeHead(200).end("ignored");
    return;
  }

  const buyer = event?.data?.attributes?.user_email;
  const product = event?.data?.attributes?.first_order_item?.product_name || "";
  // Simple tier mapping — tweak to your product names.
  const tier = /pro/i.test(product) ? "pro" : /agency/i.test(product) ? "agency" : "core";

  const { code, payload } = signLicense({ email: buyer, tier });
  await emailLicense({ to: buyer, code, tier });

  // Append to your ledger store (S3, KV, DO, Postgres, whatever).
  console.log("issued", payload.id, "→", buyer);
  res.writeHead(200).end("ok");
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
