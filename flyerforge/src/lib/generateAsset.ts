import satori from "satori";
import sharp from "sharp";
import { loadFonts } from "./fonts";
import type { AssetSize } from "./sizes";
import { TEMPLATES, type TemplateId } from "@/templates";
import type { TemplateProps } from "@/templates/shared";

export type BaseProps = Omit<TemplateProps, "width" | "height">;

export async function generateAsset(
  templateId: TemplateId,
  base: BaseProps,
  size: AssetSize,
): Promise<Buffer> {
  const Template = TEMPLATES[templateId];
  if (!Template) throw new Error(`Unknown templateId: ${templateId}`);

  const fonts = await loadFonts();
  const element = Template({ ...base, width: size.width, height: size.height });

  const svg = await satori(element, {
    width: size.width,
    height: size.height,
    fonts,
  });

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
