import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * 7 font families sourced from Google Fonts via TTF (for Satori). Locally
 * mirrored TTFs in `public/fonts/` take precedence; missing files fall back
 * to a live fetch against the Google Fonts CSS2 API using an old-Chrome UA
 * trick that forces a TTF response (the modern WOFF2 response can't be fed
 * to Satori).
 *
 * Net TTF payload: ~2.8MB across 18 weight files. Fetched once per process
 * and cached in module scope.
 */

export type FontFamily =
  | "Inter"
  | "Fraunces"
  | "Oswald"
  | "Archivo Black"
  | "Space Grotesk"
  | "Space Mono"
  | "Bodoni Moda"
  | "Khand";

export type FontWeight = 400 | 500 | 700 | 900;

export type LoadedFont = {
  name: FontFamily;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal" | "italic";
};

type Spec = {
  name: FontFamily;
  weight: FontWeight;
  style: "normal" | "italic";
  file: string;
  googleFamily: string;
};

const SPECS: Spec[] = [
  // Inter — universal workhorse sans
  { name: "Inter", weight: 400, style: "normal", file: "Inter-Regular.ttf", googleFamily: "Inter" },
  { name: "Inter", weight: 500, style: "normal", file: "Inter-Medium.ttf",  googleFamily: "Inter" },
  { name: "Inter", weight: 700, style: "normal", file: "Inter-Bold.ttf",    googleFamily: "Inter" },
  { name: "Inter", weight: 900, style: "normal", file: "Inter-Black.ttf",   googleFamily: "Inter" },

  // Fraunces — editorial serif w/ real italic
  { name: "Fraunces", weight: 400, style: "normal", file: "Fraunces-Regular.ttf",     googleFamily: "Fraunces" },
  { name: "Fraunces", weight: 400, style: "italic", file: "Fraunces-Italic.ttf",      googleFamily: "Fraunces" },
  { name: "Fraunces", weight: 700, style: "normal", file: "Fraunces-Bold.ttf",        googleFamily: "Fraunces" },
  { name: "Fraunces", weight: 900, style: "normal", file: "Fraunces-Black.ttf",       googleFamily: "Fraunces" },

  // Oswald — condensed humanist (Knockout substitute)
  { name: "Oswald", weight: 500, style: "normal", file: "Oswald-Medium.ttf", googleFamily: "Oswald" },
  { name: "Oswald", weight: 700, style: "normal", file: "Oswald-Bold.ttf",   googleFamily: "Oswald" },

  // Archivo Black — brutalist heavy display
  { name: "Archivo Black", weight: 400, style: "normal", file: "ArchivoBlack-Regular.ttf", googleFamily: "Archivo+Black" },

  // Space Grotesk — brutalist/Swiss accent
  { name: "Space Grotesk", weight: 500, style: "normal", file: "SpaceGrotesk-Medium.ttf", googleFamily: "Space+Grotesk" },
  { name: "Space Grotesk", weight: 700, style: "normal", file: "SpaceGrotesk-Bold.ttf",   googleFamily: "Space+Grotesk" },

  // Space Mono — Factory catalog numbers
  { name: "Space Mono", weight: 400, style: "normal", file: "SpaceMono-Regular.ttf", googleFamily: "Space+Mono" },

  // Bodoni Moda — high-contrast Didone (Saville direction)
  { name: "Bodoni Moda", weight: 700, style: "normal", file: "BodoniModa-Bold.ttf",  googleFamily: "Bodoni+Moda" },
  { name: "Bodoni Moda", weight: 900, style: "normal", file: "BodoniModa-Black.ttf", googleFamily: "Bodoni+Moda" },

  // Khand — tight condensed (Druk substitute)
  { name: "Khand", weight: 500, style: "normal", file: "Khand-Medium.ttf", googleFamily: "Khand" },
  { name: "Khand", weight: 700, style: "normal", file: "Khand-Bold.ttf",   googleFamily: "Khand" },
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
  const key = `${spec.googleFamily}:${spec.weight}:${spec.style}`;
  const hit = remoteBytesCache.get(key);
  if (hit) return hit;

  // Google's CSS2 API uses `ital,wght@0,400;1,400` syntax for italic.
  const axis = spec.style === "italic"
    ? `ital,wght@1,${spec.weight}`
    : `wght@${spec.weight}`;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${spec.googleFamily}:${axis}&display=swap`;
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
      style: spec.style,
      data: await resolveFont(spec),
    })),
  );
  cached = resolved;
  return cached;
}
