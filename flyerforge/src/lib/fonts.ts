import { promises as fs } from "node:fs";
import path from "node:path";

export type FontFamily = "Bebas Neue" | "Playfair Display" | "Inter";

export type LoadedFont = {
  name: FontFamily;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

type Spec = {
  name: FontFamily;
  weight: 400 | 700;
  file: string; // local filename in public/fonts/
  googleFamily: string; // Google Fonts family name for CSS2 API
};

const SPECS: Spec[] = [
  { name: "Bebas Neue", weight: 400, file: "BebasNeue-Regular.ttf", googleFamily: "Bebas+Neue" },
  { name: "Playfair Display", weight: 400, file: "PlayfairDisplay-Regular.ttf", googleFamily: "Playfair+Display" },
  { name: "Playfair Display", weight: 700, file: "PlayfairDisplay-Bold.ttf", googleFamily: "Playfair+Display" },
  { name: "Inter", weight: 400, file: "Inter-Regular.ttf", googleFamily: "Inter" },
  { name: "Inter", weight: 700, file: "Inter-Bold.ttf", googleFamily: "Inter" },
];

/** Forces Google Fonts to return a TTF (instead of WOFF2) by using an old UA. */
const TTF_UA = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36";

let cached: LoadedFont[] | null = null;
const remoteBytesCache = new Map<string, ArrayBuffer>();

async function readLocal(file: string): Promise<ArrayBuffer | null> {
  try {
    const full = path.join(process.cwd(), "public", "fonts", file);
    const buf = await fs.readFile(full);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

async function fetchGoogleFont(spec: Spec): Promise<ArrayBuffer> {
  const key = `${spec.googleFamily}:${spec.weight}`;
  const hit = remoteBytesCache.get(key);
  if (hit) return hit;

  const cssUrl = `https://fonts.googleapis.com/css2?family=${spec.googleFamily}:wght@${spec.weight}&display=swap`;
  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": TTF_UA } });
  if (!cssRes.ok) {
    throw new Error(`Google Fonts CSS fetch failed: ${cssRes.status} for ${spec.name} ${spec.weight}`);
  }
  const css = await cssRes.text();
  const match = /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/.exec(css);
  if (!match) {
    throw new Error(`Could not find font URL in Google Fonts CSS for ${spec.name} ${spec.weight}`);
  }

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`Font binary fetch failed: ${fontRes.status} for ${spec.name} ${spec.weight}`);
  }
  const bytes = await fontRes.arrayBuffer();
  remoteBytesCache.set(key, bytes);
  return bytes;
}

async function resolveFont(spec: Spec): Promise<ArrayBuffer> {
  const local = await readLocal(spec.file);
  if (local) return local;
  return fetchGoogleFont(spec);
}

export async function loadFonts(): Promise<LoadedFont[]> {
  if (cached) return cached;
  const resolved = await Promise.all(
    SPECS.map(async (spec) => ({
      name: spec.name,
      weight: spec.weight,
      style: "normal" as const,
      data: await resolveFont(spec),
    })),
  );
  cached = resolved;
  return cached;
}
