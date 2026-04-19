import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBg";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = { photoBase64: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.photoBase64) {
    return NextResponse.json(
      { error: "Missing photoBase64" },
      { status: 400 },
    );
  }

  const result = await removeBackground(body.photoBase64);
  return NextResponse.json(result, { status: 200 });
}
