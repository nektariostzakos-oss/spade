export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  desc: string;
};

export type LocalizedService = Service & { tkey: string };

export const SERVICES: LocalizedService[] = [
  {
    id: "womens-cut",
    tkey: "svc.womens",
    name: "Women's Cut",
    duration: 60,
    price: 65,
    desc: "Precision cut, consultation and blow-dry.",
  },
  {
    id: "mens-cut",
    tkey: "svc.mens",
    name: "Men's Cut",
    duration: 45,
    price: 45,
    desc: "Scissor or clipper cut with a sharp finish.",
  },
  {
    id: "kids-cut",
    tkey: "svc.kids",
    name: "Kids Cut (under 12)",
    duration: 30,
    price: 28,
    desc: "Patient, careful work for young clients.",
  },
  {
    id: "blow-dry",
    tkey: "svc.blowdry",
    name: "Blow-dry & Style",
    duration: 45,
    price: 45,
    desc: "Wash, blow-dry and styling for any occasion.",
  },
  {
    id: "colour-root",
    tkey: "svc.root",
    name: "Root Colour",
    duration: 90,
    price: 85,
    desc: "Single-process root touch-up, wash and blow-dry.",
  },
  {
    id: "balayage",
    tkey: "svc.balayage",
    name: "Balayage",
    duration: 180,
    price: 180,
    desc: "Hand-painted lights, gloss, cut and blow-dry.",
  },
  {
    id: "cut-colour",
    tkey: "svc.cutcolour",
    name: "Cut + Colour",
    duration: 150,
    price: 140,
    desc: "Full colour and precision cut, finished and styled.",
  },
  {
    id: "treatment",
    tkey: "svc.treatment",
    name: "Bond Treatment",
    duration: 30,
    price: 35,
    desc: "Strengthening in-chair treatment — add to any service.",
  },
];

// NB: variable name kept as BARBERS for import stability across the
// codebase; the entries here are the salon's stylists.
export const BARBERS = [
  { id: "hannah", name: "Hannah Carter", role: "Senior Stylist · Founder" },
  { id: "mira", name: "Mira Patel", role: "Colour Specialist" },
  { id: "oliver", name: "Oliver Reed", role: "Stylist" },
  { id: "any", name: "First Available", role: "Any chair" },
];

export const HOURS = {
  open: 10,
  close: 21,
  step: 30,
  closedDays: [0],
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function slotsInRange(openHHMM: string, closeHHMM: string, step = HOURS.step): string[] {
  const out: string[] = [];
  const start = toMinutes(openHHMM);
  const end = toMinutes(closeHHMM);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return out;
  for (let m = start; m < end; m += step) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`);
  }
  return out;
}

// Legacy fixed-grid generator: every 30 min between the global open/close.
// Retained for reservation mode and anywhere a caller hasn't been threaded
// through business hours yet.
export function getDailySlots(): string[] {
  return slotsInRange(
    `${HOURS.open.toString().padStart(2, "0")}:00`,
    `${HOURS.close.toString().padStart(2, "0")}:00`
  );
}

// Per-day slot generator that respects the shop's actual hours for that
// weekday — including an optional midday break (open2/close2).
// `dayOfWeek` is 0=Sun … 6=Sat (matches Date.getDay() / dayOfWeekInTz).
export function getSlotsForDay(
  dayOfWeek: number,
  hours: Array<{
    day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
    open: string;
    close: string;
    closed: boolean;
    open2?: string;
    close2?: string;
  }> | undefined
): string[] {
  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const key = DAY_KEYS[dayOfWeek];
  const h = hours?.find((x) => x.day === key);
  if (!h || h.closed) return [];
  const morning = slotsInRange(h.open, h.close);
  const evening = h.open2 && h.close2 ? slotsInRange(h.open2, h.close2) : [];
  return [...morning, ...evening];
}
