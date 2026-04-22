import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * License verification — offline, ed25519.
 *
 * The public key below is compiled into every buyer's copy of the template.
 * Private key lives on the seller's side and never ships. Verifying a code
 * therefore never phones home: we decode the payload, verify the signature
 * against the embedded public key, and check expiry. The only time we touch
 * the network is the weekly deny-list refresh, which is best-effort and can
 * be disabled with ATELIER_LICENSE_DENYLIST=0.
 *
 * Code format:
 *   atl_<base64url(payload)>.<base64url(signature)>
 *
 * Payload is a JSON object:
 *   { tier, domain, email, issuedAt, expiresAt | null, id }
 *
 * `domain` "*" means unlocked for any hostname. `expiresAt: null` means
 * perpetual (standard single-purchase model). `id` is the unique licence ID
 * the seller keeps in their ledger so it can be revoked via deny-list.
 */

// === PUBLIC KEY ===
// ed25519 public key, raw 32 bytes, base64-encoded. Replace this value ONCE
// when you first generate your keypair (see scripts/generate-keypair.mjs).
// The placeholder below means "no valid licences exist yet"; every activation
// attempt will fail cleanly until you rotate it.
const PUBLIC_KEY_B64 =
  process.env.ATELIER_LICENSE_PUBKEY ||
  "REPLACE_WITH_YOUR_ED25519_PUBLIC_KEY_BASE64";

const LICENSE_FILE = path.join(process.cwd(), "data", "license.json");
const DENYLIST_CACHE = path.join(process.cwd(), "data", "license-denylist.json");

// Remote deny-list URL — seller hosts a stable JSON endpoint listing revoked
// licence IDs. Refunded buyers land here. Empty / 404 means "no revocations".
const DENYLIST_URL = process.env.ATELIER_LICENSE_DENYLIST_URL || "";
const DENYLIST_TTL_MS = 7 * 24 * 60 * 60 * 1000; // refresh weekly

export type LicensePayload = {
  id: string;
  tier: "core" | "pro" | "agency";
  domain: string; // "*" = any host
  email: string;
  issuedAt: string; // ISO
  expiresAt: string | null; // ISO or null for perpetual
};

export type LicenseRecord = {
  code: string;
  payload: LicensePayload;
  installedAt: string;
  lastVerifiedAt: string;
};

export type LicenseStatus =
  | { state: "licensed"; payload: LicensePayload; installedAt: string }
  | { state: "unlicensed"; reason: string; graceDaysLeft?: number; installedAt?: string };

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function verifyCode(code: string): LicensePayload | null {
  if (!code || typeof code !== "string") return null;
  if (!code.startsWith("atl_")) return null;

  const body = code.slice(4);
  const dot = body.indexOf(".");
  if (dot < 1) return null;

  const payloadB64 = body.slice(0, dot);
  const sigB64 = body.slice(dot + 1);

  let payload: LicensePayload;
  try {
    const raw = b64urlDecode(payloadB64).toString("utf-8");
    payload = JSON.parse(raw) as LicensePayload;
  } catch {
    return null;
  }

  if (
    !payload ||
    typeof payload.id !== "string" ||
    typeof payload.tier !== "string" ||
    typeof payload.domain !== "string" ||
    typeof payload.issuedAt !== "string"
  ) return null;

  // Signature verification via embedded public key.
  let pubKey: crypto.KeyObject;
  try {
    pubKey = crypto.createPublicKey({
      key: Buffer.concat([
        // SPKI header for ed25519
        Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
        Buffer.from(PUBLIC_KEY_B64, "base64"),
      ]),
      format: "der",
      type: "spki",
    });
  } catch {
    return null;
  }

  const signedBytes = Buffer.from(payloadB64, "utf-8");
  const sigBytes = b64urlDecode(sigB64);
  const ok = crypto.verify(null, signedBytes, pubKey, sigBytes);
  if (!ok) return null;

  // Expiry (perpetual if null)
  if (payload.expiresAt) {
    if (new Date(payload.expiresAt).getTime() < Date.now()) return null;
  }

  return payload;
}

async function readDenylist(): Promise<Set<string>> {
  // Try cache first
  try {
    const raw = await fs.readFile(DENYLIST_CACHE, "utf-8");
    const parsed = JSON.parse(raw) as { fetchedAt: string; ids: string[] };
    if (Date.now() - new Date(parsed.fetchedAt).getTime() < DENYLIST_TTL_MS) {
      return new Set(parsed.ids);
    }
  } catch {}

  // Refresh from remote (best-effort)
  if (!DENYLIST_URL || process.env.ATELIER_LICENSE_DENYLIST === "0") {
    return new Set();
  }
  try {
    const res = await fetch(DENYLIST_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return new Set();
    const ids = (await res.json()) as string[];
    if (!Array.isArray(ids)) return new Set();
    await fs.mkdir(path.dirname(DENYLIST_CACHE), { recursive: true });
    await fs.writeFile(
      DENYLIST_CACHE,
      JSON.stringify({ fetchedAt: new Date().toISOString(), ids }, null, 2),
      "utf-8"
    );
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export async function activateLicense(
  code: string
): Promise<{ ok: true; payload: LicensePayload } | { ok: false; error: string }> {
  const payload = verifyCode(code);
  if (!payload) return { ok: false, error: "Invalid or tampered licence code." };

  const denylist = await readDenylist();
  if (denylist.has(payload.id)) return { ok: false, error: "This licence has been revoked." };

  const record: LicenseRecord = {
    code,
    payload,
    installedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
  };
  await fs.mkdir(path.dirname(LICENSE_FILE), { recursive: true });
  await fs.writeFile(LICENSE_FILE, JSON.stringify(record, null, 2), "utf-8");
  return { ok: true, payload };
}

export async function readLicense(): Promise<LicenseRecord | null> {
  try {
    return JSON.parse(await fs.readFile(LICENSE_FILE, "utf-8")) as LicenseRecord;
  } catch {
    return null;
  }
}

const GRACE_DAYS = 14;

export async function getStatus(): Promise<LicenseStatus> {
  const rec = await readLicense();
  if (rec) {
    // Re-verify the stored code every read — if the public key was rotated or
    // the payload tampered with on disk, we catch it here.
    const payload = verifyCode(rec.code);
    if (payload) {
      const denylist = await readDenylist();
      if (!denylist.has(payload.id)) {
        return { state: "licensed", payload, installedAt: rec.installedAt };
      }
      return { state: "unlicensed", reason: "Licence revoked." };
    }
    return { state: "unlicensed", reason: "Licence is no longer valid." };
  }

  // Unlicensed — how long is the grace period?
  // Use the app's settings creation time as "install time".
  let installedAt: string | undefined;
  try {
    const st = await fs.stat(path.join(process.cwd(), "data", "settings.json"));
    installedAt = st.mtime.toISOString();
  } catch {}

  const daysSince = installedAt
    ? (Date.now() - new Date(installedAt).getTime()) / (24 * 60 * 60 * 1000)
    : 0;
  const graceDaysLeft = Math.max(0, Math.ceil(GRACE_DAYS - daysSince));
  return { state: "unlicensed", reason: "No activation code installed.", graceDaysLeft, installedAt };
}
