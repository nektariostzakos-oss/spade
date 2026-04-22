#!/usr/bin/env node
// Issue a signed Atelier licence code.
//
// Usage:
//   node scripts/issue-license.mjs \
//     --email buyer@example.com \
//     --tier core \
//     --domain salon.com \
//     [--expires 2028-01-01]
//
// Prints the activation code to stdout. Email it to the buyer (or wire this
// into a Lemon Squeezy / Gumroad / Stripe webhook — see scripts/webhook-template.mjs).

import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

function argv(key, fallback) {
  const i = process.argv.indexOf(`--${key}`);
  if (i < 0) return fallback;
  return process.argv[i + 1];
}

const email = argv("email");
const tier = argv("tier", "core");
const domain = argv("domain", "*");
const expires = argv("expires", null); // ISO date or null for perpetual

if (!email) {
  console.error("error: --email is required");
  console.error("usage: node scripts/issue-license.mjs --email buyer@example.com --tier core --domain salon.com");
  process.exit(1);
}

const ALLOWED_TIERS = new Set(["core", "pro", "agency"]);
if (!ALLOWED_TIERS.has(tier)) {
  console.error(`error: --tier must be one of: ${[...ALLOWED_TIERS].join(", ")}`);
  process.exit(1);
}

const privPath = path.join(process.cwd(), "licences", "private.pem");
let privPem;
try {
  privPem = await fs.readFile(privPath, "utf-8");
} catch {
  console.error("error: private key not found at licences/private.pem");
  console.error("run `node scripts/generate-keypair.mjs` first.");
  process.exit(1);
}

const priv = crypto.createPrivateKey(privPem);

const payload = {
  id: `lic_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`,
  tier,
  domain,
  email,
  issuedAt: new Date().toISOString(),
  expiresAt: expires || null,
};

function b64urlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf-8"));
const sig = crypto.sign(null, Buffer.from(payloadB64, "utf-8"), priv);
const sigB64 = b64urlEncode(sig);

const code = `atl_${payloadB64}.${sigB64}`;

console.log("\nLicence issued:");
console.log("  id:      " + payload.id);
console.log("  tier:    " + tier);
console.log("  domain:  " + domain);
console.log("  email:   " + email);
console.log("  expires: " + (expires || "never"));
console.log("\nActivation code (email this to the buyer):");
console.log("  " + code);

// Append to ledger so you can reissue / revoke later.
const ledgerPath = path.join(process.cwd(), "licences", "ledger.jsonl");
await fs.appendFile(ledgerPath, JSON.stringify({ ...payload, code }) + "\n", "utf-8");
console.log("\nLogged to licences/ledger.jsonl\n");
