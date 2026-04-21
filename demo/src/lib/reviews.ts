import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "reviews.json");

export type Review = {
  id: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  source: "booking" | "manual" | "import";
  bookingId?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

async function readAll(): Promise<Review[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as Review[];
  } catch {
    return [];
  }
}
async function writeAll(items: Review[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function listReviews(status?: Review["status"]): Promise<Review[]> {
  const all = await readAll();
  const filtered = status ? all.filter((r) => r.status === status) : all;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createReview(input: Omit<Review, "id" | "createdAt" | "status"> & { status?: Review["status"] }): Promise<Review> {
  const all = await readAll();
  const r: Review = {
    ...input,
    status: input.status ?? "pending",
    id: `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(r);
  await writeAll(all);
  return r;
}

export async function updateReview(id: string, patch: Partial<Review>): Promise<Review | null> {
  const all = await readAll();
  const i = all.findIndex((r) => r.id === id);
  if (i < 0) return null;
  all[i] = { ...all[i], ...patch, id: all[i].id };
  await writeAll(all);
  return all[i];
}

export async function deleteReview(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
