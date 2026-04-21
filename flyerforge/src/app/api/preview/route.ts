import { NextResponse } from "next/server";
import { generateAsset, type BaseProps } from "@/lib/generateAsset";
import type { Design } from "@/lib/design/axes";
import type { EventFormData } from "@/components/EventForm";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  design: Design;
  formData: EventFormData;
  photoBase64?: string | null;
  logoBase64?: string | null;
  accentColor?: string | null;
  tagline?: string | null;
};

// Preview renders at story aspect ratio, ~540x960. Scales down from 1080 baseline
// so typography stays crisp and layout bugs surface early.
const PREVIEW_WIDTH = 540;
const PREVIEW_HEIGHT = 960;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { design, formData } = body ?? {};
  if (!design || !formData) {
    return NextResponse.json(
      { error: "Missing design or formData" },
      { status: 400 },
    );
  }

  const base: BaseProps = {
    eventName: formData.eventName,
    date: formData.date,
    time: formData.time,
    venueName: formData.venueName,
    venueAddress: formData.venueAddress,
    artistName: formData.artistName || undefined,
    tagline: body.tagline || undefined,
    photoUrl: body.photoBase64 || "",
    logoUrl: body.logoBase64 || undefined,
    accentColor: body.accentColor || undefined,
  };

  try {
    const buffer = await generateAsset(design, base, {
      id: "preview",
      label: "Preview",
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
      filename: "preview.png",
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Preview render failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
