import type { Palette } from "./axes";

/**
 * Each palette is a small tuned set of colors. Layouts read these values
 * to pick background, ink, accent, and muted tones. A `duo-custom` palette
 * falls back to the user-provided accent color at render time.
 */
export type PaletteTokens = {
  /** Primary canvas background. */
  bg: string;
  /** Primary ink / headline color. */
  ink: string;
  /** Accent / secondary color (strips, hairlines, kicker). */
  accent: string;
  /** Muted ink for metadata, billing block. */
  muted: string;
  /** Whether this palette reads as "light" (cream bg) or "dark" (ink bg). */
  mode: "light" | "dark";
};

export const PALETTE_TOKENS: Record<Palette, PaletteTokens> = {
  oxblood: {
    bg: "#0a0a0a",
    ink: "#f4efe7",
    accent: "#7A1E1E",
    muted: "#9a9590",
    mode: "dark",
  },
  hazard: {
    bg: "#0a0a0a",
    ink: "#f4efe7",
    accent: "#ff2d16",
    muted: "#a8a39c",
    mode: "dark",
  },
  tomato: {
    bg: "#f4e6c3",
    ink: "#141413",
    accent: "#e8502a",
    muted: "#6b6459",
    mode: "light",
  },
  cobalt: {
    bg: "#f4efe7",
    ink: "#0a0a0a",
    accent: "#2b5cff",
    muted: "#6b6459",
    mode: "light",
  },
  "gold-ink": {
    bg: "#0e0d0c",
    ink: "#f4efe7",
    accent: "#c4a96a",
    muted: "#8a857e",
    mode: "dark",
  },
  "cream-ink": {
    bg: "#f6f1e7",
    ink: "#141413",
    accent: "#141413",
    muted: "#6b6459",
    mode: "light",
  },
  "cream-red": {
    bg: "#fbfaf7",
    ink: "#141413",
    accent: "#d7281d",
    muted: "#6b6459",
    mode: "light",
  },
  "duo-custom": {
    // Placeholder — replaced at render time with user's accent color.
    bg: "#0a0a0a",
    ink: "#f4efe7",
    accent: "#ff3b6b",
    muted: "#a8a39c",
    mode: "dark",
  },
};

/** Apply a user-supplied accent on top of the palette; useful for Duotone. */
export function resolvePalette(
  palette: Palette,
  userAccent: string | undefined,
): PaletteTokens {
  const base = PALETTE_TOKENS[palette];
  if (palette === "duo-custom" && userAccent) {
    return { ...base, accent: userAccent };
  }
  return base;
}
