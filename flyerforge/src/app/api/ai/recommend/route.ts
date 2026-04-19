import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractJson, extractText, getAnthropic } from "@/lib/ai/anthropic";
import {
  DEFAULT_DESIGN,
  type Design,
  type Layout,
  type Palette,
  type Treatment,
  type TypePair,
} from "@/lib/design/axes";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  eventName?: string;
  venueName?: string;
  vibe?: string;
  hasPhoto?: boolean;
};

type AiPick = {
  layout: Layout;
  typePair: TypePair;
  palette: Palette;
  treatment: Treatment;
  reason: string;
};

const LAYOUTS: Layout[] = ["noir", "brutalist", "memphis", "editorial", "duotone", "swiss"];
const TYPE_PAIRS: TypePair[] = [
  "serif-editorial",
  "condensed-punch",
  "heavy-display",
  "neutral-sans",
  "classical-mono",
  "tight-condensed",
];
const PALETTES: Palette[] = [
  "oxblood",
  "hazard",
  "tomato",
  "cobalt",
  "gold-ink",
  "cream-ink",
  "cream-red",
  "duo-custom",
];
const TREATMENTS: Treatment[] = ["bw", "duotone", "graded", "untouched", "none"];

const SYSTEM = `You are an art director. Pick one value from each of four orthogonal design axes for an event flyer.

Layouts:
- "noir": A24 cinematic. Photo dominant, title bottom-scrim, hairline rules. Best for club nights, moody shows.
- "brutalist": 032c. Off-grid, type bleeds off edge, photo half-bleed. Best for underground, punk, warehouse.
- "memphis": Paula Scher. Stacked saturated type, geometric shapes. Best for festivals, daytime, playful events.
- "editorial": Gentlewoman. Centered masthead, italic deck, framed photo. Best for gallery openings, readings, launches.
- "duotone": Peter Saville. Image-driven, small typography. Best for concerts, record-launch aesthetic.
- "swiss": Müller-Brockmann. Flush-left grid, hairlines. Best for corporate, conferences, talks.

TypePairs:
- "serif-editorial": Fraunces + Inter. Editorial, warm.
- "condensed-punch": Oswald + Space Grotesk. Poster energy.
- "heavy-display": Archivo Black + Space Grotesk. Brutal, loud.
- "neutral-sans": Inter only. Understated.
- "classical-mono": Bodoni Moda + Space Mono. Museum catalog.
- "tight-condensed": Khand + Inter. Tight, technical.

Palettes:
- "oxblood": deep red on ink (moody).
- "hazard": bright red on black (punk).
- "tomato": warm orange on cream (playful).
- "cobalt": electric blue on bone (corporate, crisp).
- "gold-ink": metallic on black (luxe).
- "cream-ink": editorial newsprint (quiet).
- "cream-red": swiss hazard (sharp).
- "duo-custom": uses the user's custom accent.

Treatments:
- "bw": desaturated cinematic.
- "duotone": two-color halftone (needs photo).
- "graded": warm cinematic grade.
- "untouched": photo as-is.
- "none": no photo, pure typography (use ONLY when hasPhoto=false).`;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brief = [
    body.eventName ? `Event: ${body.eventName}` : null,
    body.venueName ? `Venue: ${body.venueName}` : null,
    body.vibe ? `Vibe: ${body.vibe}` : null,
    `hasPhoto: ${body.hasPhoto ? "true" : "false"}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!body.eventName && !body.venueName && !body.vibe) {
    return NextResponse.json(
      { error: "Give me at least an event name to recommend from." },
      { status: 400 },
    );
  }

  let client: Anthropic;
  try {
    client = getAnthropic();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI unavailable." },
      { status: 503 },
    );
  }

  const prompt = `Brief:
${brief}

Return ONLY a JSON object, no prose, no code fence:
{"layout": "...", "typePair": "...", "palette": "...", "treatment": "...", "reason": "one short sentence"}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 240,
      system: [
        {
          type: "text",
          text: SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const text = extractText(message);
    const parsed = extractJson<AiPick>(text);

    if (!LAYOUTS.includes(parsed.layout)) {
      throw new Error(`AI returned unknown layout: ${parsed.layout}`);
    }
    if (!TYPE_PAIRS.includes(parsed.typePair)) {
      throw new Error(`AI returned unknown typePair: ${parsed.typePair}`);
    }
    if (!PALETTES.includes(parsed.palette)) {
      throw new Error(`AI returned unknown palette: ${parsed.palette}`);
    }
    if (!TREATMENTS.includes(parsed.treatment)) {
      throw new Error(`AI returned unknown treatment: ${parsed.treatment}`);
    }

    // If the caller said no photo, force a photo-free treatment regardless of
    // what the model returned — layouts still render fine, just without a plate.
    const treatment: Treatment = body.hasPhoto ? parsed.treatment : "none";

    const design: Design = {
      layout: parsed.layout,
      typePair: parsed.typePair,
      palette: parsed.palette,
      treatment,
    };

    return NextResponse.json({ design, reason: parsed.reason });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI error: ${e.message}` },
        { status: e.status ?? 500 },
      );
    }
    // Fallback to default design rather than failing the UI entirely.
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "AI design recommendation failed.",
        design: DEFAULT_DESIGN,
      },
      { status: 500 },
    );
  }
}
