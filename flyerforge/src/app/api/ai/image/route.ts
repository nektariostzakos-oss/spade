import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getOpenAI } from "@/lib/ai/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  prompt?: string;
  aspect?: "portrait" | "landscape" | "square";
};

const SIZE_BY_ASPECT: Record<Required<Body>["aspect"], "1024x1024" | "1024x1536" | "1536x1024"> = {
  square: "1024x1024",
  portrait: "1024x1536",
  landscape: "1536x1024",
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required." },
      { status: 400 },
    );
  }
  if (prompt.length > 1000) {
    return NextResponse.json(
      { error: "Prompt is too long (max 1000 chars)." },
      { status: 400 },
    );
  }

  const size = SIZE_BY_ASPECT[body.aspect ?? "portrait"];

  let client: OpenAI;
  try {
    client = getOpenAI();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI unavailable." },
      { status: 503 },
    );
  }

  try {
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      n: 1,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image data.");

    const dataUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({ photoBase64: dataUrl });
  } catch (e) {
    if (e instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Image gen error: ${e.message}` },
        { status: e.status ?? 500 },
      );
    }
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "AI image generation failed.",
      },
      { status: 500 },
    );
  }
}
