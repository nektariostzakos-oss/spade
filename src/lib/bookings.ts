import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "bookings.json");

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  lang?: "en" | "el";
  remindedAt?: string;
};

export type NewBooking = Omit<Booking, "id" | "status" | "createdAt">;

async function readAll(): Promise<Booking[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

async function writeAll(items: Booking[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function listBookings(): Promise<Booking[]> {
  const all = await readAll();
  return all.sort((a, b) =>
    `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
  );
}

export async function getTakenSlots(
  date: string,
  barberId: string
): Promise<string[]> {
  const all = await readAll();
  return all
    .filter(
      (b) =>
        b.date === date &&
        b.status !== "cancelled" &&
        (barberId === "any" ? true : b.barberId === barberId)
    )
    .map((b) => b.time);
}

export async function createBooking(input: NewBooking): Promise<Booking> {
  const all = await readAll();
  const conflict = all.find(
    (b) =>
      b.date === input.date &&
      b.time === input.time &&
      b.status !== "cancelled" &&
      (b.barberId === input.barberId || input.barberId === "any")
  );
  if (conflict) {
    throw new Error("That slot was just taken. Pick another time.");
  }
  const booking: Booking = {
    ...input,
    id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    // Conflict check passed → slot was free → auto-confirm.
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  all.push(booking);
  await writeAll(all);
  return booking;
}

export async function updateStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  const all = await readAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  all[idx].status = status;
  await writeAll(all);
  return all[idx];
}

export async function deleteBooking(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

/**
 * Mark a booking as reminded (used by the 30-min reminder cron).
 */
export async function markReminded(id: string): Promise<void> {
  const all = await readAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return;
  all[idx].remindedAt = new Date().toISOString();
  await writeAll(all);
}

/**
 * Bookings starting roughly 8 hours from now (window 7h55m–8h05m) that
 * haven't been reminded yet and aren't cancelled / completed. The cron
 * fires every 5 min, so this window guarantees we catch each booking once.
 */
export async function dueForReminder(): Promise<Booking[]> {
  const all = await readAll();
  const now = Date.now();
  const from = now + (8 * 60 - 5) * 60_000; // 7h55m
  const to = now + (8 * 60 + 5) * 60_000;   // 8h05m
  return all.filter((b) => {
    if (b.status === "cancelled" || b.status === "completed") return false;
    if (b.remindedAt) return false;
    if (!b.email) return false;
    const t = new Date(`${b.date}T${b.time}:00`).getTime();
    return t >= from && t <= to;
  });
}
