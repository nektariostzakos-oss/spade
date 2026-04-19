import { promises as fs } from "node:fs";
import path from "node:path";

export type LoadedFont = {
  name: "Bebas Neue" | "Playfair Display" | "Inter";
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

async function read(file: string): Promise<ArrayBuffer> {
  const full = path.join(process.cwd(), "public", "fonts", file);
  const buf = await fs.readFile(full);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

let cached: LoadedFont[] | null = null;

export async function loadFonts(): Promise<LoadedFont[]> {
  if (cached) return cached;

  const [bebas, playfair, playfairBold, inter, interBold] = await Promise.all([
    read("BebasNeue-Regular.ttf"),
    read("PlayfairDisplay-Regular.ttf"),
    read("PlayfairDisplay-Bold.ttf"),
    read("Inter-Regular.ttf"),
    read("Inter-Bold.ttf"),
  ]);

  cached = [
    { name: "Bebas Neue", data: bebas, weight: 400, style: "normal" },
    { name: "Playfair Display", data: playfair, weight: 400, style: "normal" },
    { name: "Playfair Display", data: playfairBold, weight: 700, style: "normal" },
    { name: "Inter", data: inter, weight: 400, style: "normal" },
    { name: "Inter", data: interBold, weight: 700, style: "normal" },
  ];
  return cached;
}
