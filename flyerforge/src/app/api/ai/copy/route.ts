import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractJson, extractText, getAnthropic } from "@/lib/ai/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  eventName?: string;
  venueName?: string;
  date?: string;
  artistName?: string;
  vibe?: string;
};

type Suggestion = {
  headline: string;
  tagline: string;
  venueBlurb: string;
};

const SYSTEM = `You are a punchy copywriter for event flyers. Keep things SHORT, confident, specific.
- "headline": 2-6 words, bold and title-case. Can replace an event name that's been given.
- "tagline": 3-8 words, punchy one-liner that hints at vibe. ALL CAPS.
- "venueBlurb": 6-14 words, describes what to expect. Title case.
Never use cliches like "unforgettable night" or "don't miss out". Avoid emojis.`;

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
    body.date ? `Date: ${body.date}` : null,
    body.artistName ? `Artist/DJ: ${body.artistName}` : null,
    body.vibe ? `Vibe: ${body.vibe}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!brief) {
    return NextResponse.json(
      { error: "Give me at least an event name or venue to work with." },
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
{"headline": "...", "tagline": "...", "venueBlurb": "..."}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
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
    const parsed = extractJson<Suggestion>(text);

    if (!parsed?.headline || !parsed?.tagline || !parsed?.venueBlurb) {
      throw new Error("AI returned incomplete suggestion.");
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
          e instanceof Error ? e.message : "AI copy generation failed.",
      },
      { status: 500 },
    );
  }
}
