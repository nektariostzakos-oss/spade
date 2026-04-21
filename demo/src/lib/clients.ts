import { promises as fs } from "fs";
import path from "path";
import { listBookings } from "./bookings";
import { listOrders } from "./orders";

const FILE = path.join(process.cwd(), "data", "clients.json");

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
};

async function readAll(): Promise<Client[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as Client[];
  } catch {
    return [];
  }
}

async function writeAll(items: Client[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf-8");
}

function makeId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function keyOf(c: Pick<Client, "email" | "phone">): string {
  return (c.email || "").trim().toLowerCase() || (c.phone || "").replace(/[^\d+]/g, "");
}

export type EnrichedClient = Client & {
  bookingCount: number;
  orderCount: number;
  lifetimeValue: number;
  lastSeen: string | null;
};

export async function listClients(): Promise<EnrichedClient[]> {
  const [stored, bookings, orders] = await Promise.all([
    readAll(),
    listBookings(),
    listOrders(),
  ]);
  const map = new Map<string, Client>();
  for (const c of stored) map.set(keyOf(c) || c.id, c);

  for (const b of bookings) {
    const k = keyOf({ email: b.email, phone: b.phone });
    if (!k) continue;
    if (!map.has(k)) {
      map.set(k, {
        id: makeId(),
        name: b.name,
        email: b.email || "",
        phone: b.phone || "",
        createdAt: b.createdAt,
      });
    }
  }
  for (const o of orders) {
    const k = keyOf({ email: o.email, phone: o.phone });
    if (!k) continue;
    if (!map.has(k)) {
      map.set(k, {
        id: makeId(),
        name: o.name,
        email: o.email || "",
        phone: o.phone || "",
        createdAt: o.createdAt,
      });
    }
  }

  const enriched: EnrichedClient[] = [];
  for (const c of map.values()) {
    const k = keyOf(c);
    const bs = bookings.filter((b) => keyOf({ email: b.email, phone: b.phone }) === k);
    const os = orders.filter((o) => keyOf({ email: o.email, phone: o.phone }) === k);
    const bookingRevenue = bs.filter((b) => b.status === "completed").reduce((s, b) => s + b.price, 0);
    const orderRevenue = os.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.subtotal, 0);
    const dates = [
      ...bs.map((b) => b.createdAt),
      ...os.map((o) => o.createdAt),
    ].sort();
    enriched.push({
      ...c,
      bookingCount: bs.length,
      orderCount: os.length,
      lifetimeValue: bookingRevenue + orderRevenue,
      lastSeen: dates.at(-1) ?? null,
    });
  }
  enriched.sort((a, b) => (b.lastSeen ?? "").localeCompare(a.lastSeen ?? ""));
  return enriched;
}

export async function upsertClient(
  input: Pick<Client, "name" | "email" | "phone"> & Partial<Pick<Client, "notes" | "tags">>
): Promise<Client> {
  const all = await readAll();
  const k = keyOf(input);
  const idx = all.findIndex((c) => keyOf(c) === k);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...input };
    await writeAll(all);
    return all[idx];
  }
  const c: Client = {
    id: makeId(),
    name: input.name,
    email: input.email || "",
    phone: input.phone || "",
    notes: input.notes,
    tags: input.tags,
    createdAt: new Date().toISOString(),
  };
  all.push(c);
  await writeAll(all);
  return c;
}

export async function deleteClient(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((c) => c.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export async function importClients(
  rows: Array<{ name?: string; email?: string; phone?: string; notes?: string; tags?: string }>
): Promise<{ added: number; updated: number; skipped: number }> {
  let added = 0, updated = 0, skipped = 0;
  const all = await readAll();
  for (const r of rows) {
    const name = (r.name || "").trim();
    const email = (r.email || "").trim();
    const phone = (r.phone || "").trim();
    if (!name || (!email && !phone)) { skipped++; continue; }
    const k = keyOf({ email, phone });
    const idx = all.findIndex((c) => keyOf(c) === k);
    const tags = r.tags ? r.tags.split("|").map((t) => t.trim()).filter(Boolean) : undefined;
    if (idx >= 0) {
      all[idx] = { ...all[idx], name, email, phone, notes: r.notes || all[idx].notes, tags: tags ?? all[idx].tags };
      updated++;
    } else {
      all.push({
        id: makeId(),
        name, email, phone,
        notes: r.notes,
        tags,
        createdAt: new Date().toISOString(),
      });
      added++;
    }
  }
  await writeAll(all);
  return { added, updated, skipped };
}
