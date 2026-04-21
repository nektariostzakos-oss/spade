import type { TypePair } from "./axes";

/**
 * Resolves a TypePair into concrete font family + weight strings for each
 * role. Satori needs `fontFamily` strings that match the `name` on a loaded
 * font; weights must match a `weight` we actually load.
 */

export type FontRole = "display" | "subhead" | "body" | "caption";

export type TypeRoleSpec = {
  family: string;
  weight: 400 | 500 | 700 | 900;
  /** CSS-style letter spacing (em units). Negative tightens display; positive
   *  opens small caps. */
  tracking: number;
  italic?: boolean;
  /** Whether this role is commonly rendered in all caps for this pair. */
  upper?: boolean;
};

export type TypePairSpec = {
  display: TypeRoleSpec;
  subhead: TypeRoleSpec;
  body: TypeRoleSpec;
  caption: TypeRoleSpec;
};

export const TYPE_PAIR_SPECS: Record<TypePair, TypePairSpec> = {
  "serif-editorial": {
    display: { family: "Fraunces", weight: 900, tracking: -0.01 },
    subhead: { family: "Fraunces", weight: 400, tracking: 0, italic: true },
    body:    { family: "Inter",    weight: 400, tracking: 0 },
    caption: { family: "Inter",    weight: 500, tracking: 0.12, upper: true },
  },
  "condensed-punch": {
    display: { family: "Oswald",        weight: 700, tracking: 0, upper: true },
    subhead: { family: "Oswald",        weight: 500, tracking: 0.04, upper: true },
    body:    { family: "Inter",         weight: 400, tracking: 0 },
    caption: { family: "Space Grotesk", weight: 500, tracking: 0.1, upper: true },
  },
  "heavy-display": {
    display: { family: "Archivo Black", weight: 400, tracking: -0.02, upper: true },
    subhead: { family: "Space Grotesk", weight: 700, tracking: 0.02, upper: true },
    body:    { family: "Inter",         weight: 400, tracking: 0 },
    caption: { family: "Space Grotesk", weight: 500, tracking: 0.12, upper: true },
  },
  "neutral-sans": {
    display: { family: "Inter", weight: 900, tracking: -0.01, upper: true },
    subhead: { family: "Inter", weight: 700, tracking: 0, upper: true },
    body:    { family: "Inter", weight: 400, tracking: 0 },
    caption: { family: "Inter", weight: 500, tracking: 0.14, upper: true },
  },
  "classical-mono": {
    display: { family: "Bodoni Moda", weight: 900, tracking: -0.005 },
    subhead: { family: "Bodoni Moda", weight: 700, tracking: 0, italic: true },
    body:    { family: "Inter",       weight: 400, tracking: 0 },
    caption: { family: "Space Mono",  weight: 400, tracking: 0.08, upper: true },
  },
  "tight-condensed": {
    display: { family: "Khand", weight: 700, tracking: -0.01, upper: true },
    subhead: { family: "Khand", weight: 500, tracking: 0.02, upper: true },
    body:    { family: "Inter", weight: 400, tracking: 0 },
    caption: { family: "Inter", weight: 500, tracking: 0.12, upper: true },
  },
};

export function typeRole(pair: TypePair, role: FontRole): TypeRoleSpec {
  return TYPE_PAIR_SPECS[pair][role];
}
