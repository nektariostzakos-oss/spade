import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "content.json");

export type SiteContent = Record<string, unknown>;

export async function loadContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as SiteContent;
  } catch {
    return {};
  }
}

export async function saveSection(
  section: string,
  patch: Record<string, unknown>
): Promise<SiteContent> {
  const all = await loadContent();
  const existing = (all[section] as Record<string, unknown>) ?? {};
  all[section] = { ...existing, ...patch };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf-8");
  return all;
}
