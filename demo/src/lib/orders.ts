import { promises as fs } from "fs";
import path from "path";
import { withFileLock } from "./fileLock";

const FILE = path.join(process.cwd(), "data", "orders.json");
const LOCK = "orders.json";

export type OrderLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderStatus = "new" | "paid" | "shipped" | "completed" | "cancelled";

export type Order = {
  id: string;
  items: OrderLine[];
  subtotal: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal: string;
  notes?: string;
  lang: "en" | "el";
  status: OrderStatus;
  createdAt: string;
};

async function readAll(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeAll(list: Order[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function listOrders(): Promise<Order[]> {
  const all = await readAll();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createOrder(
  input: Omit<Order, "id" | "status" | "createdAt">
): Promise<Order> {
  return withFileLock(LOCK, async () => {
    const all = await readAll();
    const order: Order = {
      ...input,
      id: `o_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    all.push(order);
    await writeAll(all);
    return order;
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  return withFileLock(LOCK, async () => {
    const all = await readAll();
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const current = all[idx].status;
    // Terminal states: cancelled / completed. No resurrection.
    const TERMINAL: OrderStatus[] = ["cancelled", "completed"];
    if (TERMINAL.includes(current) && status !== current) {
      throw new Error(`Cannot change order from ${current} to ${status}.`);
    }
    all[idx].status = status;
    await writeAll(all);
    return all[idx];
  });
}
