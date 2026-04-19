import satori from "satori";
import sharp from "sharp";
import { loadFonts } from "./fonts";
import type { AssetSize } from "./sizes";
import { TEMPLATES, type TemplateId } from "@/templates";
import type { TemplateProps } from "@/templates/shared";
import { blackAndWhite, duotone, grainDataUrl } from "./imageEffects";

export type BaseProps = Omit<TemplateProps, "width" | "height">;

/** Some templates expect the photo to be pre-processed (duotone, B&W) because
 *  Satori has no `mix-blend-mode` or `filter` on images. Doing it once here
 *  keeps templates pure and the pipeline honest. */
async function applyMediaTreatment(
  templateId: TemplateId,
  base: BaseProps,
): Promise<BaseProps> {
  if (!base.photoUrl) return base;

  switch (templateId) {
    case "club-night":
      return { ...base, photoUrl: await blackAndWhite(base.photoUrl) };
    case "festival-burst":
      return {
        ...base,
        photoUrl: await duotone(base.photoUrl, base.accentColor || "#ff3b6b"),
      };
    default:
      return base;
  }
}

export async function generateAsset(
  templateId: TemplateId,
  base: BaseProps,
  size: AssetSize,
): Promise<Buffer> {
  const Template = TEMPLATES[templateId];
  if (!Template) throw new Error(`Unknown templateId: ${templateId}`);

  const [fonts, prepared, grainUrl] = await Promise.all([
    loadFonts(),
    applyMediaTreatment(templateId, base),
    grainDataUrl(),
  ]);

  const element = Template({
    ...prepared,
    grainUrl,
    width: size.width,
    height: size.height,
  });

  const svg = await satori(element, {
    width: size.width,
    height: size.height,
    fonts,
  });

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
