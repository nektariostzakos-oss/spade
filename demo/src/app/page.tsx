import Hero, { type NextSlotInfo } from "./components/Hero";
import InfoStrip from "./components/InfoStrip";
import ServicesPreview from "./components/ServicesPreview";
import ShopPreview from "./components/ShopPreview";
import GalleryStrip from "./components/GalleryStrip";
import BlogStrip from "./components/BlogStrip";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import AvailabilitySnapshot from "./components/AvailabilitySnapshot";
import TransformationsStrip from "./components/TransformationsStrip";
import { getTakenSlots } from "../lib/bookings";
import { getSlotsForDay } from "../lib/services";
import { getActiveServices } from "../lib/customServices";
import { loadBusiness } from "../lib/settings";
import { todayIsoInTz, nowMinutesInTz, dayOfWeekInTz, dateAtOffsetInTz } from "../lib/tz";

// Revalidate the home page every 60s. Fresh enough for the "next slot" badge
// (slots move in 30-min increments), and avoids full SSR every request —
// important on memory/CPU-constrained Hostinger shared plans.
export const revalidate = 60;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_EN = { sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" } as const;
const DAY_EL = { sun: "Κυρ", mon: "Δευ", tue: "Τρί", wed: "Τετ", thu: "Πέμ", fri: "Παρ", sat: "Σάβ" } as const;

function slotMinutes(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

async function computeNextSlot(): Promise<NextSlotInfo> {
  try {
    const business = await loadBusiness();
    const tz = business.timezone || "Europe/Athens";
    const todayIdx = dayOfWeekInTz(tz);
    const todayDow = DAY_KEYS[todayIdx];
    const todayHours = business.hours?.find((h) => h.day === todayDow);
    const leadTime = business.bookingRules?.leadTimeMinutes ?? 45;
    const cutoff = nowMinutesInTz(tz) + leadTime;

    // Today's free slots (if open)
    if (!todayHours?.closed) {
      const taken = await getTakenSlots(todayIsoInTz(tz), "any");
      const todaySlots = getSlotsForDay(todayIdx, business.hours);
      const free = todaySlots
        .filter((s) => !taken.includes(s) && slotMinutes(s) >= cutoff)
        .slice(0, 1);
      if (free.length > 0) {
        return { time: free[0], label_en: "Today", label_el: "Σήμερα", booked: false };
      }
    }

    // Try next 7 days for the first open day with a slot
    for (let offset = 1; offset <= 7; offset++) {
      const future = dateAtOffsetInTz(offset, tz);
      const dkey = DAY_KEYS[future.dayOfWeek];
      const dh = business.hours?.find((h) => h.day === dkey);
      if (dh?.closed) continue;
      const taken = await getTakenSlots(future.iso, "any");
      const daySlots = getSlotsForDay(future.dayOfWeek, business.hours);
      const free = daySlots.filter((s) => !taken.includes(s)).slice(0, 1);
      if (free.length > 0) {
        const label_en = offset === 1 ? "Tomorrow" : DAY_EN[dkey];
        const label_el = offset === 1 ? "Αύριο" : DAY_EL[dkey];
        const booked = !todayHours?.closed; // today existed but was full
        return { time: free[0], label_en, label_el, booked };
      }
    }
    return { time: "", label_en: "", label_el: "", booked: true };
  } catch {
    return null;
  }
}

export default async function Home() {
  const [nextSlot, services] = await Promise.all([
    computeNextSlot(),
    getActiveServices().catch(() => []),
  ]);
  const priced = services.filter((s) => s.price > 0).map((s) => s.price);
  const minPrice = priced.length > 0 ? Math.min(...priced) : null;
  return (
    <main className="relative">
      <Hero nextSlot={nextSlot} minPrice={minPrice} />
      <AvailabilitySnapshot />
      <InfoStrip />
      <ServicesPreview />
      <TransformationsStrip />
      <ShopPreview />
      <GalleryStrip />
      <BlogStrip />
      <Testimonials />
      <CTA />
    </main>
  );
}
