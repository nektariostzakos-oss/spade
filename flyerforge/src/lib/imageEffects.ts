import sharp from "sharp";

/** Parse a data URL into a raw Buffer. Returns null for non-data-URL inputs. */
function decodeDataUrl(dataUrl: string): Buffer | null {
  const m = /^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return Buffer.from(m[1], "base64");
}

/** Desaturates the source and tints it with the given color, then returns a
 *  fresh `data:image/png;base64,...` URL. Used by the Duotone Photographic
 *  template because Satori has no `mix-blend-mode` support.
 *
 *  If the input is not a usable data URL, the original string is returned
 *  unchanged. */
export async function duotone(
  photoDataUrl: string,
  tintHex: string,
): Promise<string> {
  const raw = decodeDataUrl(photoDataUrl);
  if (!raw) return photoDataUrl;

  try {
    const out = await sharp(raw)
      .modulate({ saturation: 0 })
      .linear(1.1, -10)
      .tint(tintHex)
      .png({ compressionLevel: 9 })
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return photoDataUrl;
  }
}

let cachedGrain: string | null = null;

/** Returns a data URL for a 256x256 tileable film-grain tile. Generated once
 *  per process and reused — Satori has no `feTurbulence` equivalent, so the
 *  grain has to be pre-rasterized. */
export async function grainDataUrl(): Promise<string> {
  if (cachedGrain) return cachedGrain;

  const size = 256;
  const pixels = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = Math.floor(Math.random() * 256);
    pixels[i * 4 + 0] = v;
    pixels[i * 4 + 1] = v;
    pixels[i * 4 + 2] = v;
    pixels[i * 4 + 3] = 255;
  }

  const png = await sharp(pixels, {
    raw: { width: size, height: size, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  cachedGrain = `data:image/png;base64,${png.toString("base64")}`;
  return cachedGrain;
}

/** Cheap B&W pass — used by Noir Cinematic which wants deep contrast
 *  before Satori renders the photo. */
export async function blackAndWhite(photoDataUrl: string): Promise<string> {
  const raw = decodeDataUrl(photoDataUrl);
  if (!raw) return photoDataUrl;

  try {
    const out = await sharp(raw)
      .modulate({ saturation: 0 })
      .linear(1.15, -12)
      .png({ compressionLevel: 9 })
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return photoDataUrl;
  }
}

/** Subtle cinematic grade — lifts warmth & contrast without desaturating. */
export async function colorGraded(photoDataUrl: string): Promise<string> {
  const raw = decodeDataUrl(photoDataUrl);
  if (!raw) return photoDataUrl;

  try {
    const out = await sharp(raw)
      .modulate({ saturation: 1.15, brightness: 1.02 })
      .linear(1.08, -6)
      .png({ compressionLevel: 9 })
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return photoDataUrl;
  }
}
