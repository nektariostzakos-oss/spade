/**
 * Per-size safe zones for text placement. Numbers from Meta Business Help
 * Center (Stories/Reels/Feed/Event), ISO 216 (A5) with commercial-print
 * bleed (3mm) and safe area (5mm), and WhatsApp status UI inspection.
 *
 * SAFE_ZONES — margin in px from each edge that text must avoid.
 * HEADLINE_BOX — preferred rectangle (in px) for the main headline. Guarantees
 *                the headline survives the most aggressive crop for that size.
 * LOGO_CORNERS — recommended logo corner (avoids platform chrome collisions).
 */

export type Box = { x: number; y: number; w: number; h: number };
export type Margins = { top: number; right: number; bottom: number; left: number };
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export const SAFE_ZONES: Record<string, Margins> = {
  "ig-story":      { top: 270, right: 60,  bottom: 250, left: 40  },
  "ig-reel-cover": { top: 240, right: 150, bottom: 400, left: 40  },
  "ig-feed":       { top: 160, right: 60,  bottom: 160, left: 60  },
  "fb-event":      { top: 90,  right: 60,  bottom: 90,  left: 400 },
  "print-a5":      { top: 70,  right: 70,  bottom: 70,  left: 70  },
  "wa-status":     { top: 230, right: 40,  bottom: 220, left: 40  },
  // Preview renders smaller — just use generous 5% margins.
  preview:         { top: 24,  right: 24,  bottom: 24,  left: 24  },
};

export const HEADLINE_BOX: Record<string, Box> = {
  "ig-story":      { x: 108, y: 480, w: 864,  h: 720  },
  "ig-reel-cover": { x: 80,  y: 560, w: 850,  h: 700  },
  "ig-feed":       { x: 90,  y: 260, w: 900,  h: 830  },
  "fb-event":      { x: 430, y: 110, w: 710,  h: 408  },
  "print-a5":      { x: 140, y: 400, w: 1468, h: 1100 },
  "wa-status":     { x: 80,  y: 480, w: 920,  h: 960  },
  preview:         { x: 30,  y: 200, w: 480,  h: 500  },
};

export const LOGO_CORNERS: Record<string, Corner> = {
  "ig-story":      "top-left",
  "ig-reel-cover": "top-right",
  "ig-feed":       "bottom-right",
  "fb-event":      "top-right",
  "print-a5":      "bottom-right",
  "wa-status":     "top-left",
  preview:         "top-left",
};

/** Fallback margins if an unknown size.id is passed. */
const DEFAULT_MARGINS: Margins = { top: 60, right: 60, bottom: 60, left: 60 };

export function safeZone(sizeId: string): Margins {
  return SAFE_ZONES[sizeId] ?? DEFAULT_MARGINS;
}

export function headlineBox(
  sizeId: string,
  width: number,
  height: number,
): Box {
  const box = HEADLINE_BOX[sizeId];
  if (box) return box;
  // Derive a reasonable headline box from margins for unknown sizes.
  const m = safeZone(sizeId);
  return {
    x: m.left,
    y: Math.round(height * 0.45),
    w: width - m.left - m.right,
    h: Math.round(height * 0.35),
  };
}

export function logoCorner(sizeId: string): Corner {
  return LOGO_CORNERS[sizeId] ?? "bottom-right";
}
