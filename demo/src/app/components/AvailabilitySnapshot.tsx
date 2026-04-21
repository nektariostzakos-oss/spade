import Link from "next/link";
import { cookies } from "next/headers";
import { getTakenSlots } from "../../lib/bookings";
import { getDailySlots } from "../../lib/services";
import { loadBookingMode, loadBusiness } from "../../lib/settings";

async function getLang(): Promise<"en" | "el"> {
  try {
    const c = await cookies();
    const v = c.get("spade_lang")?.value;
    return v === "el" ? "el" : "en";
  } catch {
    return "en";
  }
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function slotMinutes(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

const RESERVATION_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
];

const DAY_NAMES_EN: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
};
const DAY_NAMES_EL: Record<number, string> = {
  0: "Κυριακή", 1: "Δευτέρα", 2: "Τρίτη", 3: "Τετάρτη",
  4: "Πέμπτη", 5: "Παρασκευή", 6: "Σάββατο",
};

export default async function AvailabilitySnapshot() {
  const mode = await loadBookingMode();
  const business = await loadBusiness();
  const lang = await getLang();
  const today = todayIso();
  const taken = await getTakenSlots(today, "any");
  const cutoff = nowMinutes() + 45; // need at least 45 min lead time

  const allSlots = mode === "reservation" ? RESERVATION_SLOTS : getDailySlots();
  const allFreeToday = allSlots.filter((s) => !taken.includes(s) && slotMinutes(s) >= cutoff);
  const free = allFreeToday.slice(0, 3);
  const totalFree = allFreeToday.length;

  const dow = lang === "el"
    ? DAY_NAMES_EL[new Date().getDay()]
    : DAY_NAMES_EN[new Date().getDay()];

  const closedToday = business.hours?.find((h) => {
    const d = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];
    return h.day === d;
  })?.closed;

  if (closedToday) {
    return (
      <section className="px-6 py-10" style={{ background: "var(--surface)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-xl border px-6 py-5"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <div>
            <p className="eyebrow">{lang === "el" ? `Σήμερα · ${dow}` : `Today · ${dow}`}</p>
            <p className="mt-2 font-serif text-2xl" style={{ color: "var(--foreground)" }}>
              {lang === "el" ? "Είμαστε κλειστά σήμερα." : "We're closed today."}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {lang === "el"
                ? "Οι κρατήσεις για αύριο είναι ανοιχτές — διάλεξε ημερομηνία που σου ταιριάζει."
                : "Booking opens for tomorrow — pick a date that works."}
            </p>
          </div>
          <Link href="/book" className="btn-premium-outline">
            {lang === "el" ? "Δες το ημερολόγιο" : "See full calendar"}
          </Link>
        </div>
      </section>
    );
  }

  if (free.length === 0) {
    return (
      <section className="px-6 py-10" style={{ background: "var(--surface)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-xl border px-6 py-5"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <div>
            <p className="eyebrow">{lang === "el" ? "Σήμερα · Γεμάτο" : "Today · Fully booked"}</p>
            <p className="mt-2 font-serif text-2xl" style={{ color: "var(--foreground)" }}>
              {lang === "el" ? "Δεν υπάρχουν άλλες θέσεις για σήμερα." : "No openings left for today."}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {lang === "el"
                ? "Αύριο υπάρχουν πολλές επιλογές — διάλεξε την ώρα σου."
                : "Tomorrow has plenty — pick your time."}
            </p>
          </div>
          <Link href="/book" className="btn-premium-outline">
            {lang === "el" ? "Δες το αύριο" : "View tomorrow"}
          </Link>
        </div>
      </section>
    );
  }

  const eyebrow = mode === "reservation"
    ? (lang === "el" ? "Απόψε · διαθέσιμο" : "Tonight · still available")
    : (lang === "el" ? `Σήμερα · ${dow}` : `Today · ${dow}`);
  const headline = mode === "reservation"
    ? (lang === "el" ? "Τραπέζια διαθέσιμα απόψε." : "Tables open tonight.")
    : (lang === "el" ? "Θέσεις διαθέσιμες σήμερα." : "Walk-in slots open today.");
  const cta = mode === "reservation"
    ? (lang === "el" ? "Κράτηση τραπεζιού" : "Reserve a table")
    : (lang === "el" ? "Δες το ημερολόγιο" : "See full calendar");

  return (
    <section className="px-6 py-12" style={{ background: "var(--surface)" }}>
      <div
        className="mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8"
        style={{
          borderColor: "color-mix(in srgb, var(--gold) 30%, transparent)",
          background: "color-mix(in srgb, var(--gold) 6%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: "#22c55e" }}
              />
              {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl" style={{ color: "var(--foreground)" }}>
              {headline}
            </h2>
            {totalFree > 0 && totalFree <= 5 && (
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--gold)" }}>
                {lang === "el"
                  ? (totalFree === 1 ? "Μόνο 1 θέση απομένει σήμερα." : `Μόνο ${totalFree} θέσεις απομένουν σήμερα.`)
                  : (totalFree === 1 ? "Only 1 spot left today." : `Only ${totalFree} spots left today.`)}
              </p>
            )}
          </div>
          <Link href="/book" className="btn-premium">{cta}</Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {free.map((s) => (
            <Link
              key={s}
              href={`/book?date=${today}&time=${s}`}
              className="inline-flex items-baseline gap-2 rounded-full border px-5 py-2.5 transition-colors hover:bg-[color:var(--gold)] hover:text-[color:var(--background)]"
              style={{
                borderColor: "color-mix(in srgb, var(--gold) 50%, transparent)",
                color: "var(--foreground)",
              }}
            >
              <span className="font-serif text-lg">{s}</span>
              <span className="text-[9px] uppercase tracking-widest opacity-70">
                {lang === "el" ? "ελεύθερο" : "free"}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-4 text-xs" style={{ color: "var(--muted-2)" }}>
          {mode === "reservation"
            ? (lang === "el"
              ? "Οι τρεις επόμενες διαθέσιμες ώρες τραπεζιού. Πάτησε μία για να κάνεις κράτηση."
              : "Showing the next three open seatings. Tap a time to start your reservation.")
            : (lang === "el"
              ? "Οι τρεις επόμενες διαθέσιμες θέσεις για σήμερα. Πάτησε μία για να την κλείσεις."
              : "Showing the next three open chairs. Tap a slot to lock it in.")}
        </p>
      </div>
    </section>
  );
}
