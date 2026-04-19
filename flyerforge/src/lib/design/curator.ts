import type { Design, Layout, Palette, Treatment, TypePair } from "./axes";
import { compatibilityScore } from "./axes";

/**
 * Smart curator: maps user signals (event name, photo presence, text length)
 * into a Design. Runs entirely client-side, deterministic for the same input.
 *
 * The curator is opinionated but never random — use `shuffleDesign` for
 * randomization. If a signal is missing, we fall through to a sensible
 * default rather than guessing.
 */

export type CuratorInput = {
  eventName: string;
  venueName?: string;
  artistName?: string;
  tagline?: string;
  hasPhoto: boolean;
  /** Rough photo summary. Optional — if absent the curator ignores it. */
  photoStats?: {
    /** 0 = black, 1 = white. */
    luminance: number;
    /** 0 = grayscale, 1 = saturated. */
    saturation: number;
  };
};

type Vibe =
  | "nightclub"
  | "festival"
  | "exhibit"
  | "corporate"
  | "punk"
  | "concert"
  | "casual";

const VIBE_KEYWORDS: Record<Vibe, RegExp> = {
  nightclub: /\b(club|night|rave|after.?hours|techno|house|dj|disco|bass)\b/i,
  festival:  /\b(festival|fest|sunset|sunrise|beach|day|picnic|park|open.?air)\b/i,
  exhibit:   /\b(exhibit|opening|gallery|showing|launch|preview|vernissage|museum|show)\b/i,
  corporate: /\b(summit|conference|keynote|forum|panel|talk|expo|symposium|pitch)\b/i,
  punk:      /\b(underground|warehouse|punk|noise|basement|squat|diy|hardcore|industrial)\b/i,
  concert:   /\b(live|concert|band|tour|acoustic|jazz|orchestra|recital|session)\b/i,
  casual:    /\b(party|birthday|hangout|drinks|meetup|get.?together|bbq|brunch)\b/i,
};

function detectVibe(input: CuratorInput): Vibe {
  const haystack = [
    input.eventName,
    input.venueName ?? "",
    input.artistName ?? "",
    input.tagline ?? "",
  ]
    .join(" ")
    .trim();
  if (!haystack) return "nightclub";
  for (const [vibe, re] of Object.entries(VIBE_KEYWORDS) as [Vibe, RegExp][]) {
    if (re.test(haystack)) return vibe;
  }
  return "nightclub";
}

const VIBE_TO_LAYOUT: Record<Vibe, Layout> = {
  nightclub: "noir",
  festival:  "memphis",
  exhibit:   "editorial",
  corporate: "swiss",
  punk:      "brutalist",
  concert:   "duotone",
  casual:    "memphis",
};

const VIBE_TO_TYPE: Record<Vibe, TypePair> = {
  nightclub: "neutral-sans",
  festival:  "condensed-punch",
  exhibit:   "serif-editorial",
  corporate: "neutral-sans",
  punk:      "heavy-display",
  concert:   "classical-mono",
  casual:    "condensed-punch",
};

const VIBE_TO_PALETTE: Record<Vibe, Palette> = {
  nightclub: "oxblood",
  festival:  "tomato",
  exhibit:   "cream-ink",
  corporate: "cobalt",
  punk:      "hazard",
  concert:   "gold-ink",
  casual:    "cream-red",
};

const VIBE_TO_TREATMENT: Record<Vibe, Treatment> = {
  nightclub: "bw",
  festival:  "graded",
  exhibit:   "untouched",
  corporate: "untouched",
  punk:      "bw",
  concert:   "duotone",
  casual:    "graded",
};

/**
 * Main entry: turn user input into a Design.
 *
 *  1. Keyword scan → vibe
 *  2. Vibe → layout / typePair / palette / treatment
 *  3. Photo gating — if no photo we force a typographic-friendly layout
 *  4. Photo stats — override treatment for high-contrast / desaturated shots
 */
export function curate(input: CuratorInput): Design {
  const vibe = detectVibe(input);

  const base: Design = {
    layout: VIBE_TO_LAYOUT[vibe],
    typePair: VIBE_TO_TYPE[vibe],
    palette: VIBE_TO_PALETTE[vibe],
    treatment: VIBE_TO_TREATMENT[vibe],
  };

  // No photo → layouts that don't rely on one, treatment forced to none.
  if (!input.hasPhoto) {
    base.treatment = "none";
    if (base.layout === "duotone" || base.layout === "noir") {
      base.layout = "memphis";
      base.typePair = "condensed-punch";
    }
  }

  // Photo analysis: dark+desaturated shots look canonical as B&W noir;
  // already-saturated shots look silly duotoned on top.
  if (input.photoStats && input.hasPhoto) {
    const { luminance, saturation } = input.photoStats;
    if (saturation < 0.15 && base.treatment === "duotone") {
      base.treatment = "bw";
    }
    if (luminance < 0.25 && base.treatment === "untouched") {
      // Very dark photo — keep untouched only if the layout is noir-family.
      if (base.layout !== "noir" && base.layout !== "duotone") {
        base.treatment = "graded";
      }
    }
  }

  return base;
}

/**
 * Returns a new randomized Design. Unlike `curate`, this ignores inputs and
 * just rolls the dice — but biases away from incompatible combinations using
 * compatibilityScore.
 */
export function shuffleDesign(seed?: Design): Design {
  const layouts: Layout[] = ["noir", "brutalist", "memphis", "editorial", "duotone", "swiss"];
  const typePairs: TypePair[] = ["serif-editorial", "condensed-punch", "heavy-display", "neutral-sans", "classical-mono", "tight-condensed"];
  const palettes: Palette[] = ["oxblood", "hazard", "tomato", "cobalt", "gold-ink", "cream-ink", "cream-red"];
  const treatments: Treatment[] = ["bw", "duotone", "graded", "untouched", "none"];

  // Pick the layout first (biggest aesthetic lever), avoiding the previous.
  const layout = pickDifferent(layouts, seed?.layout) as Layout;

  // Try 8 candidates for the rest; keep the highest-scoring.
  let best: Design = {
    layout,
    typePair: typePairs[Math.floor(Math.random() * typePairs.length)],
    palette: palettes[Math.floor(Math.random() * palettes.length)],
    treatment: treatments[Math.floor(Math.random() * treatments.length)],
  };
  let bestScore = compatibilityScore(best);

  for (let i = 0; i < 8; i++) {
    const candidate: Design = {
      layout,
      typePair: typePairs[Math.floor(Math.random() * typePairs.length)],
      palette: palettes[Math.floor(Math.random() * palettes.length)],
      treatment: treatments[Math.floor(Math.random() * treatments.length)],
    };
    const s = compatibilityScore(candidate);
    if (s > bestScore) {
      best = candidate;
      bestScore = s;
    }
  }

  return best;
}

function pickDifferent<T>(xs: T[], avoid?: T): T {
  const others = avoid ? xs.filter((x) => x !== avoid) : xs;
  return others[Math.floor(Math.random() * others.length)];
}

/**
 * Short human-readable explanation of why the curator picked this design.
 * Used in the UI toast after an Auto pick so the user knows what changed.
 */
export function explainDesign(input: CuratorInput, d: Design): string {
  const vibe = detectVibe(input);
  const vibeLabel: Record<Vibe, string> = {
    nightclub: "club night",
    festival: "daytime festival",
    exhibit: "gallery / opening",
    corporate: "corporate",
    punk: "underground",
    concert: "live music",
    casual: "social gathering",
  };
  return `Read your event as ${vibeLabel[vibe]}. Matched with ${d.layout} layout, ${d.palette} palette, ${d.treatment === "none" ? "typographic (no photo)" : d.treatment} image treatment.`;
}
