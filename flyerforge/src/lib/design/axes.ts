/**
 * Four orthogonal design axes. A `Design` is one pick from each axis; the
 * curator either auto-selects picks from user input or the user overrides.
 *
 * Keeping the axes decoupled lets us generate ~1,440 combinations from
 * 6 × 6 × 8 × 5 instead of shipping only 6 hand-tuned presets.
 */

export type Layout =
  | "noir"
  | "brutalist"
  | "memphis"
  | "editorial"
  | "duotone"
  | "swiss";

export type TypePair =
  | "serif-editorial"    // Fraunces display + Inter body
  | "condensed-punch"    // Oswald display + Space Grotesk body
  | "heavy-display"      // Archivo Black display + Space Grotesk body
  | "neutral-sans"       // Inter display + Inter body
  | "classical-mono"     // Bodoni Moda display + Space Mono metadata
  | "tight-condensed";   // Khand display + Inter body

export type Palette =
  | "oxblood"
  | "hazard"
  | "tomato"
  | "cobalt"
  | "gold-ink"
  | "cream-ink"
  | "cream-red"
  | "duo-custom";

export type Treatment =
  | "bw"         // desaturate + contrast
  | "duotone"    // desaturate + tint with palette accent
  | "graded"     // light color grade, slight contrast
  | "untouched"  // photo as-is
  | "none";      // no photo — pure typographic layout

export type Design = {
  layout: Layout;
  typePair: TypePair;
  palette: Palette;
  treatment: Treatment;
};

export type AxisMeta<T extends string> = {
  id: T;
  label: string;
  tagline: string;
};

export const LAYOUTS: AxisMeta<Layout>[] = [
  { id: "noir", label: "Noir", tagline: "A24 cinematic. Subject up, title down." },
  { id: "brutalist", label: "Brutalist", tagline: "032c. Off-grid, bleed off edge." },
  { id: "memphis", label: "Memphis", tagline: "Paula Scher. Stacked, saturated type." },
  { id: "editorial", label: "Editorial", tagline: "Gentlewoman. Masthead, italic deck." },
  { id: "duotone", label: "Duotone", tagline: "Saville. Image speaks, text whispers." },
  { id: "swiss", label: "Swiss", tagline: "Müller-Brockmann. Flush-left, grid-locked." },
];

export const TYPE_PAIRS: AxisMeta<TypePair>[] = [
  { id: "serif-editorial", label: "Editorial serif", tagline: "Fraunces + Inter" },
  { id: "condensed-punch", label: "Condensed punch", tagline: "Oswald + Space Grotesk" },
  { id: "heavy-display", label: "Heavy display", tagline: "Archivo Black + Space Grotesk" },
  { id: "neutral-sans", label: "Neutral sans", tagline: "Inter / Inter" },
  { id: "classical-mono", label: "Classical + mono", tagline: "Bodoni Moda + Space Mono" },
  { id: "tight-condensed", label: "Tight condensed", tagline: "Khand + Inter" },
];

export const PALETTES: AxisMeta<Palette>[] = [
  { id: "oxblood", label: "Oxblood", tagline: "Deep red on ink" },
  { id: "hazard", label: "Hazard", tagline: "Bright red on black" },
  { id: "tomato", label: "Tomato", tagline: "Warm orange on cream" },
  { id: "cobalt", label: "Cobalt", tagline: "Electric blue on bone" },
  { id: "gold-ink", label: "Gold on ink", tagline: "Metallic warm on black" },
  { id: "cream-ink", label: "Cream & ink", tagline: "Editorial newsprint" },
  { id: "cream-red", label: "Cream & red", tagline: "Swiss hazard" },
  { id: "duo-custom", label: "Custom", tagline: "Uses your accent color" },
];

export const TREATMENTS: AxisMeta<Treatment>[] = [
  { id: "bw", label: "Black & white", tagline: "Cinematic desaturation" },
  { id: "duotone", label: "Duotone", tagline: "Two-color halftone" },
  { id: "graded", label: "Color-graded", tagline: "Warm cinematic grade" },
  { id: "untouched", label: "Untouched", tagline: "Photo as-is" },
  { id: "none", label: "Typographic", tagline: "No photo — pure type" },
];

export const DEFAULT_DESIGN: Design = {
  layout: "noir",
  typePair: "neutral-sans",
  palette: "oxblood",
  treatment: "bw",
};

/**
 * Some combinations work; others don't. This returns a soft score (0 = avoid,
 * 1 = okay, 2 = canonical). The curator uses it to break ties; the override
 * UI uses it to label an "unusual pairing" hint, but never blocks.
 */
export function compatibilityScore(d: Design): number {
  let score = 1;
  const { layout, typePair, palette, treatment } = d;

  const canonicalTypePairs: Record<Layout, TypePair[]> = {
    noir: ["neutral-sans", "serif-editorial"],
    brutalist: ["heavy-display", "tight-condensed", "condensed-punch"],
    memphis: ["condensed-punch", "heavy-display"],
    editorial: ["serif-editorial"],
    duotone: ["classical-mono", "neutral-sans"],
    swiss: ["neutral-sans"],
  };
  if (canonicalTypePairs[layout].includes(typePair)) score += 1;

  const canonicalPalettes: Record<Layout, Palette[]> = {
    noir: ["oxblood", "gold-ink", "hazard"],
    brutalist: ["hazard", "cream-red"],
    memphis: ["tomato", "hazard", "cobalt"],
    editorial: ["cream-ink", "cream-red"],
    duotone: ["oxblood", "cobalt", "duo-custom"],
    swiss: ["cream-red", "cream-ink"],
  };
  if (canonicalPalettes[layout].includes(palette)) score += 1;

  const canonicalTreatments: Record<Layout, Treatment[]> = {
    noir: ["bw", "graded"],
    brutalist: ["bw", "untouched"],
    memphis: ["none", "graded"],
    editorial: ["untouched", "graded"],
    duotone: ["duotone"],
    swiss: ["untouched", "none"],
  };
  if (canonicalTreatments[layout].includes(treatment)) score += 1;

  return score;
}
