import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractJson, extractText, getAnthropic } from "@/lib/ai/anthropic";
import type { TemplateId } from "@/templates";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  eventName?: string;
  venueName?: string;
  vibe?: string;
};

type Recommendation = {
  templateId: TemplateId;
  accentColor: string;
  reason: string;
};

const VALID_IDS: TemplateId[] = [
  "club-night",
  "live-stage",
  "afternoon-party",
  "minimal-editorial",
  "festival-burst",
  "corporate-launch",
];

const SYSTEM = `You are an art director matching events to templates. Pick ONE template and ONE accent color.
Templates:
- "club-night": late-night DJ / club. Gold on black. Moody, cinematic.
- "live-stage": acoustic / live band. Cream paper, ink headlines. Editorial, warm.
- "afternoon-party": daytime, brunch, rooftop. Coral/peach gradient. Playful.
- "minimal-editorial": cultural / reading / gallery. Paper. Restrained, intellectual.
- "festival-burst": outdoor festival / pride / summer. Rainbow gradient. Loud, joyful.
- "corporate-launch": conference / product launch / keynote. White + blue accent. Clean, confident.
Accent color: return a CSS hex like #ff3b6b. Choose something that fits the event mood and reads legibly.`;

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
  ]
    .filter(Boolean)
    .join("\n");

  if (!brief) {
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
{"templateId": "one-of-the-six", "accentColor": "#rrggbb", "reason": "one short sentence"}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
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
    const parsed = extractJson<Recommendation>(text);

    if (!VALID_IDS.includes(parsed.templateId)) {
      throw new Error(`AI returned unknown templateId: ${parsed.templateId}`);
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(parsed.accentColor)) {
      throw new Error(`AI returned invalid hex color: ${parsed.accentColor}`);
    }

    return NextResponse.json(parsed);
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI error: ${e.message}` },
        { status: e.status ?? 500 },
      );
    }
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "AI template recommendation failed.",
      },
      { status: 500 },
    );
  }
}
