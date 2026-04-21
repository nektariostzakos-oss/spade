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
    id: "mens-cut",
    tkey: "svc.mens",
    name: "Men's Haircut",
    duration: 30,
    price: 12,
    desc: "Classic men's cut, finished with hot towel and styling.",
  },
  {
    id: "kids-cut",
    tkey: "svc.kids",
    name: "Kids Haircut",
    duration: 25,
    price: 10,
    desc: "Patient, careful work for our youngest clients.",
  },
  {
    id: "beard",
    tkey: "svc.beard",
    name: "Beard",
    duration: 15,
    price: 5,
    desc: "Beard shaped and lined up with the straight razor.",
  },
  {
    id: "skin-refresh",
    tkey: "svc.skin",
    name: "Skin Refresh (scrub)",
    duration: 15,
    price: 5,
    desc: "Gentle face scrub that wakes the skin up.",
  },
  {
    id: "black-mask",
    tkey: "svc.mask",
    name: "Face Cleanse · Black Mask",
    duration: 15,
    price: 5,
    desc: "Deep cleansing with the black peel-off mask.",
  },
  {
    id: "cut-beard",
    tkey: "svc.cutbeard",
    name: "Haircut + Beard",
    duration: 45,
    price: 15,
    desc: "Full haircut paired with beard sculpt and razor line-up.",
  },
  {
    id: "full-grooming",
    tkey: "svc.full",
    name: "Full Grooming",
    duration: 60,
    price: 18,
    desc: "Haircut, beard and ear/nose wax. The complete session.",
  },
  {
    id: "cut-beard-mask",
    tkey: "svc.cutbeardmask",
    name: "Haircut + Beard + Black Mask",
    duration: 60,
    price: 18,
    desc: "Haircut, beard sculpt, and a deep-cleansing black mask.",
  },
];

export const BARBERS = [
  { id: "andreas", name: "Andreas Pappas", role: "Master Barber" },
  { id: "nikos", name: "Nikos Stathakis", role: "Senior Barber" },
  { id: "petros", name: "Petros Lambrou", role: "Barber" },
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
