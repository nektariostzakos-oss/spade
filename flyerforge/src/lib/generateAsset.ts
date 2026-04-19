import satori from "satori";
import sharp from "sharp";
import { loadFonts } from "./fonts";
import type { AssetSize } from "./sizes";
import { LAYOUT_COMPONENTS } from "@/templates";
import type { LayoutProps } from "@/templates/shared";
import type { Design } from "@/lib/design/axes";
import { resolvePalette } from "@/lib/design/palettes";
import { blackAndWhite, colorGraded, duotone, grainDataUrl } from "./imageEffects";

export type BaseProps = Omit<LayoutProps, "width" | "height" | "sizeId" | "design">;

/**
 * Treatment is independent of layout now — we switch on `design.treatment`
 * and run the corresponding Sharp pipeline once before Satori. Satori itself
 * has no `filter` support for images.
 */
async function applyTreatment(
  design: Design,
  base: BaseProps,
): Promise<BaseProps> {
  if (!base.photoUrl) return base;
  if (design.treatment === "none") {
    // Typographic layouts — drop the photo entirely.
    return { ...base, photoUrl: "" };
  }

  const accent = resolvePalette(design.palette, base.accentColor).accent;

  switch (design.treatment) {
    case "bw":
      return { ...base, photoUrl: await blackAndWhite(base.photoUrl) };
    case "duotone":
      return { ...base, photoUrl: await duotone(base.photoUrl, accent) };
    case "graded":
      return { ...base, photoUrl: await colorGraded(base.photoUrl) };
    case "untouched":
    default:
      return base;
  }
}

export async function generateAsset(
  design: Design,
  base: BaseProps,
  size: AssetSize,
): Promise<Buffer> {
  const Layout = LAYOUT_COMPONENTS[design.layout];
  if (!Layout) throw new Error(`Unknown layout: ${design.layout}`);

  const [fonts, prepared, grainUrl] = await Promise.all([
    loadFonts(),
    applyTreatment(design, base),
    grainDataUrl(),
  ]);

  const element = Layout({
    ...prepared,
    grainUrl,
    design,
    sizeId: size.id,
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
