#!/usr/bin/env node
// One-time keypair generator for the Atelier licence system.
//
// Run ONCE. Keep the private key safe (never commit it). Paste the public key
// into demo/src/lib/license.ts (PUBLIC_KEY_B64) or set ATELIER_LICENSE_PUBKEY
// in the seller's environment.
//
// Usage:
//   node scripts/generate-keypair.mjs
//
// Output:
//   licences/private.pem   (private key — DO NOT COMMIT)
//   licences/public.b64    (paste into lib/license.ts)

import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "licences");
await fs.mkdir(outDir, { recursive: true });

const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");

const privPem = privateKey.export({ format: "pem", type: "pkcs8" });
const pubDer = publicKey.export({ format: "der", type: "spki" });
// Strip the 12-byte SPKI header → raw 32-byte public key
const rawPub = Buffer.from(pubDer).slice(12);
const pubB64 = rawPub.toString("base64");

await fs.writeFile(path.join(outDir, "private.pem"), privPem, { mode: 0o600 });
await fs.writeFile(path.join(outDir, "public.b64"), pubB64 + "\n");

console.log("\nKeypair generated in ./licences/\n");
console.log("Public key (paste into demo/src/lib/license.ts PUBLIC_KEY_B64):");
console.log("  " + pubB64);
console.log("\nPrivate key saved to: licences/private.pem");
console.log("  → never commit this. Add `licences/` to .gitignore.\n");
