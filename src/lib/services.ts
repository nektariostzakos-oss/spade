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
  open: 9,
  close: 21,
  step: 30,
  closedDays: [0],
};

export function getDailySlots(): string[] {
  const slots: string[] = [];
  for (let h = HOURS.open; h < HOURS.close; h++) {
    for (let m = 0; m < 60; m += HOURS.step) {
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return slots;
}
