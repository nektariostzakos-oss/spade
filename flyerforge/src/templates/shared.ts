import type { Design } from "@/lib/design/axes";
import { resolvePalette, type PaletteTokens } from "@/lib/design/palettes";
import { typeRole, type FontRole, type TypeRoleSpec } from "@/lib/design/typePairs";
import { headlineBox, logoCorner, safeZone } from "@/lib/safeZones";

/**
 * A layout component receives the content, the design picks from each axis,
 * plus the target canvas (size.id + width + height). Templates consume this
 * through `useLayoutContext` below which pre-computes scaled margins,
 * resolved palette, and font specs per role.
 */
export type LayoutProps = {
  eventName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  artistName?: string;
  tagline?: string;
  /** Pre-treated photo URL (B&W / duotone / etc applied upstream). */
  photoUrl: string;
  logoUrl?: string;
  /** Accent hex, overrides palette.accent when palette is "duo-custom". */
  accentColor?: string;
  /** Data URL for a 256x256 grain tile. */
  grainUrl?: string;

  design: Design;
  sizeId: string;
  width: number;
  height: number;
};

export function formatDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function formatTime(raw: string): string {
  if (!raw) return "";
  const [hh, mm] = raw.split(":");
  const h = Number(hh);
  if (Number.isNaN(h)) return raw;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${mm ?? "00"} ${suffix}`;
}

/** Scale a 1080-baseline px value to the target canvas width. */
export function scale(width: number, px: number): number {
  return Math.max(1, Math.round((px * width) / 1080));
}

/** Same scale but accepts a fractional multiplier (for cap-heights etc). */
export function scaleF(width: number, px: number): number {
  return Math.max(0.5, (px * width) / 1080);
}

/**
 * Build a CSS style object for a role in the current type pair. Callers pass
 * the intended size in 1080-baseline px and we scale it to the canvas.
 */
export function roleStyle(
  pair: Design["typePair"],
  role: FontRole,
  baselinePx: number,
  width: number,
  overrides: Partial<TypeRoleSpec> = {},
): Record<string, string | number> {
  const spec = { ...typeRole(pair, role), ...overrides };
  const size = scale(width, baselinePx);
  return {
    fontFamily: spec.family,
    fontWeight: spec.weight,
    fontStyle: spec.italic ? "italic" : "normal",
    letterSpacing: `${spec.tracking}em`,
    fontSize: size,
    lineHeight: 1,
    textTransform: spec.upper ? "uppercase" : "none",
  };
}

/**
 * Per-layout context: caches palette + safe zones + margins scaled to the
 * canvas width. Layouts use this instead of computing piecewise.
 */
export type LayoutContext = {
  palette: PaletteTokens;
  margins: { top: number; right: number; bottom: number; left: number };
  headlineBox: { x: number; y: number; w: number; h: number };
  logoCorner: ReturnType<typeof logoCorner>;
  hasPhoto: boolean;
};

export function buildContext(props: LayoutProps): LayoutContext {
  const palette = resolvePalette(props.design.palette, props.accentColor);
  const margins = safeZone(props.sizeId);
  const box = headlineBox(props.sizeId, props.width, props.height);
  const corner = logoCorner(props.sizeId);
  return {
    palette,
    margins,
    headlineBox: box,
    logoCorner: corner,
    hasPhoto: Boolean(props.photoUrl) && props.design.treatment !== "none",
  };
}
