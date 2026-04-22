import { promises as fs } from "fs";
import path from "path";
import { wallClockInTzToUtc } from "./tz";
import { loadBusiness } from "./settings";
import { withFileLock } from "./fileLock";

const FILE = path.join(process.cwd(), "data", "bookings.json");
const LOCK = "bookings.json";

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
  /** Set by the cron when the post-visit review email has been sent. */
  reviewedAt?: string;
  /** True when this booking bypassed the public form (walk-in / in-shop). */
  walkIn?: boolean;
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

/**
 * Block out a window based on existing bookings' duration + optional buffer
 * time. Returns an array of slot times (HH:MM) that cannot be booked on
 * the given date for the given staff member because an existing booking
 * is already running during that slot (or its clean-up buffer).
 *
 * `step` is the slot grid granularity in minutes (default 30).
 */
export async function getOccupiedSlots(
  date: string,
  barberId: string,
  getBufferForService: (serviceId: string) => number = () => 0,
  step = 30
): Promise<string[]> {
  const all = await readAll();
  const blocked = new Set<string>();
  for (const b of all) {
    if (b.date !== date) continue;
    if (b.status === "cancelled") continue;
    if (barberId !== "any" && b.barberId !== barberId && b.barberId !== "any") continue;
    const [h, m] = b.time.split(":").map(Number);
    const start = h * 60 + (m || 0);
    const buffer = getBufferForService(b.serviceId);
    const end = start + (b.duration || step) + buffer;
    for (let t = start; t < end; t += step) {
      const hh = Math.floor(t / 60).toString().padStart(2, "0");
      const mm = (t % 60).toString().padStart(2, "0");
      blocked.add(`${hh}:${mm}`);
    }
  }
  return Array.from(blocked);
}

export async function createBooking(input: NewBooking): Promise<Booking> {
  return withFileLock(LOCK, async () => {
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
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    all.push(booking);
    await writeAll(all);
    return booking;
  });
}

export async function updateStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  return withFileLock(LOCK, async () => {
    const all = await readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    // Enforce state machine — terminal states can't be resurrected.
    const current = all[idx].status;
    const TERMINAL: BookingStatus[] = ["cancelled", "completed"];
    if (TERMINAL.includes(current) && status !== current) {
      throw new Error(`Cannot change booking from ${current} to ${status}.`);
    }
    all[idx].status = status;
    await writeAll(all);
    return all[idx];
  });
}

export async function deleteBooking(id: string): Promise<boolean> {
  return withFileLock(LOCK, async () => {
    const all = await readAll();
    const next = all.filter((b) => b.id !== id);
    if (next.length === all.length) return false;
    await writeAll(next);
    return true;
  });
}

/** Mark a booking as reminded (used by the 30-min reminder cron). */
export async function markReminded(id: string): Promise<void> {
  await withFileLock(LOCK, async () => {
    const all = await readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return;
    all[idx].remindedAt = new Date().toISOString();
    await writeAll(all);
  });
}

export async function markReviewRequested(id: string): Promise<void> {
  await withFileLock(LOCK, async () => {
    const all = await readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return;
    all[idx].reviewedAt = new Date().toISOString();
    await writeAll(all);
  });
}

/**
 * Bookings that finished 2–24h ago, are marked completed, have an email,
 * and haven't received a review request yet. Cron picks these up.
 */
export async function dueForReviewRequest(): Promise<Booking[]> {
  const [all, business] = await Promise.all([readAll(), loadBusiness()]);
  const tz = business.timezone || "Europe/Athens";
  const now = Date.now();
  const minAgeMs = 2 * 60 * 60_000;
  const maxAgeMs = 24 * 60 * 60_000;
  return all.filter((b) => {
    if (b.status !== "completed") return false;
    if (b.reviewedAt) return false;
    if (!b.email) return false;
    const slotEnd = wallClockInTzToUtc(b.date, b.time, tz) + (b.duration || 30) * 60_000;
    const age = now - slotEnd;
    return age >= minAgeMs && age <= maxAgeMs;
  });
}

/**
 * Bookings starting roughly 8 hours from now (window 7h55m–8h05m) that
 * haven't been reminded yet and aren't cancelled / completed. The cron
 * fires every 5 min, so this window guarantees we catch each booking once.
 */
export async function dueForReminder(): Promise<Booking[]> {
  const [all, business] = await Promise.all([readAll(), loadBusiness()]);
  const tz = business.timezone || "Europe/Athens";
  const now = Date.now();
  const from = now + (8 * 60 - 5) * 60_000; // 7h55m
  const to = now + (8 * 60 + 5) * 60_000;   // 8h05m
  return all.filter((b) => {
    if (b.status === "cancelled" || b.status === "completed") return false;
    if (b.remindedAt) return false;
    if (!b.email) return false;
    // Booking date + time are wall-clock in the business timezone. Convert
    // to a real UTC instant before comparing to Date.now() — otherwise on a
    // UTC host the reminder fires at the wrong wall-clock time (off by the TZ offset).
    const t = wallClockInTzToUtc(b.date, b.time, tz);
    return Number.isFinite(t) && t >= from && t <= to;
  });
}
