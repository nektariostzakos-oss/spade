import { NextResponse } from "next/server";
import JSZip from "jszip";
import { SIZES } from "@/lib/sizes";
import { generateAsset, type BaseProps } from "@/lib/generateAsset";
import { removeBackground } from "@/lib/removeBg";
import type { TemplateId } from "@/templates";
import type { EventFormData } from "@/components/EventForm";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  templateId: TemplateId;
  formData: EventFormData;
  photoBase64: string;
  removeBg?: boolean;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { templateId, formData, photoBase64, removeBg } = body ?? {};

  if (!templateId || !formData || !photoBase64) {
    return NextResponse.json(
      { error: "Missing templateId, formData, or photoBase64" },
      { status: 400 },
    );
  }

  let effectivePhoto = photoBase64;
  let warning: string | undefined;

  if (removeBg) {
    const result = await removeBackground(photoBase64);
    effectivePhoto = result.photoBase64;
    if (!result.ok) warning = result.warning;
  }

  const base: BaseProps = {
    eventName: formData.eventName,
    date: formData.date,
    time: formData.time,
    venueName: formData.venueName,
    venueAddress: formData.venueAddress,
    artistName: formData.artistName || undefined,
    photoUrl: effectivePhoto,
  };

  try {
    const pngs = await Promise.all(
      SIZES.map(async (size) => ({
        filename: size.filename,
        buffer: await generateAsset(templateId, base, size),
      })),
    );

    const zip = new JSZip();
    for (const { filename, buffer } of pngs) {
      zip.file(filename, buffer);
    }
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    const headers: Record<string, string> = {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="flyerforge-assets.zip"`,
    };
    if (warning) headers["X-FlyerForge-Warning"] = warning;

    return new NextResponse(zipBuffer, { status: 200, headers });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Asset generation failed unexpectedly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
