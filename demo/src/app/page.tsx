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
import { getDailySlots } from "../lib/services";
import { loadBusiness } from "../lib/settings";

// Fresh slot data on every request — matches the AvailabilitySnapshot logic.
export const dynamic = "force-dynamic";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_EN = { sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" } as const;
const DAY_EL = { sun: "Κυρ", mon: "Δευ", tue: "Τρί", wed: "Τετ", thu: "Πέμ", fri: "Παρ", sat: "Σάβ" } as const;

function pad(n: number) { return n.toString().padStart(2, "0"); }
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function slotMinutes(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

async function computeNextSlot(): Promise<NextSlotInfo> {
  try {
    const business = await loadBusiness();
    const now = new Date();
    const dow = DAY_KEYS[now.getDay()];
    const todayHours = business.hours?.find((h) => h.day === dow);
    const cutoff = now.getHours() * 60 + now.getMinutes() + 45;
    const allSlots = getDailySlots();

    // Today's free slots (if open)
    if (!todayHours?.closed) {
      const taken = await getTakenSlots(todayIso(), "any");
      const free = allSlots
        .filter((s) => !taken.includes(s) && slotMinutes(s) >= cutoff)
        .slice(0, 1);
      if (free.length > 0) {
        return { time: free[0], label_en: "Today", label_el: "Σήμερα", booked: false };
      }
    }

    // Try next 7 days for the first open day with a slot
    for (let offset = 1; offset <= 7; offset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      const dkey = DAY_KEYS[d.getDay()];
      const dh = business.hours?.find((h) => h.day === dkey);
      if (dh?.closed) continue;
      const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const taken = await getTakenSlots(iso, "any");
      const free = allSlots.filter((s) => !taken.includes(s)).slice(0, 1);
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
  const nextSlot = await computeNextSlot();
  return (
    <main className="relative">
      <Hero nextSlot={nextSlot} />
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
