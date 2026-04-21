import Link from "next/link";
import { getTakenSlots } from "../../lib/bookings";
import { getSlotsForDay } from "../../lib/services";
import { loadBookingMode, loadBusiness } from "../../lib/settings";
import { todayIsoInTz, nowMinutesInTz, dayOfWeekInTz } from "../../lib/tz";

// IMPORTANT: do NOT call cookies() here — it opts the component's tree
// into dynamic rendering on every request, which overrides the home page's
// `revalidate = 60` ISR and causes 503s on memory-constrained shared hosts.
// We emit both EN and EL strings side-by-side with data-i18n attributes;
// CSS in globals.css hides the one that doesn't match the current html lang
// (LangProvider keeps html.lang synced to the user's preference).

function L({ en, el }: { en: React.ReactNode; el: React.ReactNode }) {
  return (
    <>
      <span data-i18n="en">{en}</span>
      <span data-i18n="el">{el}</span>
    </>
  );
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
  const tz = business.timezone || "Europe/Athens";
  const today = todayIsoInTz(tz);
  const taken = await getTakenSlots(today, "any");
  const cutoff = nowMinutesInTz(tz) + 45;

  const dayIdx = dayOfWeekInTz(tz);
  const dowEn = DAY_NAMES_EN[dayIdx];
  const dowEl = DAY_NAMES_EL[dayIdx];

  const allSlots = mode === "reservation" ? RESERVATION_SLOTS : getSlotsForDay(dayIdx, business.hours);
  const allFreeToday = allSlots.filter((s) => !taken.includes(s) && slotMinutes(s) >= cutoff);
  const free = allFreeToday.slice(0, 3);
  const totalFree = allFreeToday.length;

  const closedToday = business.hours?.find((h) => {
    const d = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIdx];
    return h.day === d;
  })?.closed;

  if (closedToday) {
    return (
      <section className="px-6 py-10" style={{ background: "var(--surface)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-xl border px-6 py-5"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <div>
            <p className="eyebrow">
              <L en={`Today · ${dowEn}`} el={`Σήμερα · ${dowEl}`} />
            </p>
            <p className="mt-2 font-serif text-2xl" style={{ color: "var(--foreground)" }}>
              <L en="We're closed today." el="Είμαστε κλειστά σήμερα." />
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              <L
                en="Booking opens for tomorrow — pick a date that works."
                el="Οι κρατήσεις για αύριο είναι ανοιχτές — διάλεξε ημερομηνία που σου ταιριάζει."
              />
            </p>
          </div>
          <Link href="/book" className="btn-premium-outline">
            <L en="See full calendar" el="Δες το ημερολόγιο" />
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
            <p className="eyebrow">
              <L en="Today · Fully booked" el="Σήμερα · Γεμάτο" />
            </p>
            <p className="mt-2 font-serif text-2xl" style={{ color: "var(--foreground)" }}>
              <L en="No openings left for today." el="Δεν υπάρχουν άλλες θέσεις για σήμερα." />
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              <L
                en="Tomorrow has plenty — pick your time."
                el="Αύριο υπάρχουν πολλές επιλογές — διάλεξε την ώρα σου."
              />
            </p>
          </div>
          <Link href="/book" className="btn-premium-outline">
            <L en="View tomorrow" el="Δες το αύριο" />
          </Link>
        </div>
      </section>
    );
  }

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
              {mode === "reservation" ? (
                <L en="Tonight · still available" el="Απόψε · διαθέσιμο" />
              ) : (
                <L en={`Today · ${dowEn}`} el={`Σήμερα · ${dowEl}`} />
              )}
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl" style={{ color: "var(--foreground)" }}>
              {mode === "reservation" ? (
                <L en="Tables open tonight." el="Τραπέζια διαθέσιμα απόψε." />
              ) : (
                <L en="Walk-in slots open today." el="Θέσεις διαθέσιμες σήμερα." />
              )}
            </h2>
            {totalFree > 0 && totalFree <= 5 && (
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--gold)" }}>
                {totalFree === 1 ? (
                  <L en="Only 1 spot left today." el="Μόνο 1 θέση απομένει σήμερα." />
                ) : (
                  <L
                    en={`Only ${totalFree} spots left today.`}
                    el={`Μόνο ${totalFree} θέσεις απομένουν σήμερα.`}
                  />
                )}
              </p>
            )}
          </div>
          <Link href="/book" className="btn-premium">
            {mode === "reservation" ? (
              <L en="Reserve a table" el="Κράτηση τραπεζιού" />
            ) : (
              <L en="See full calendar" el="Δες το ημερολόγιο" />
            )}
          </Link>
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
                <L en="free" el="ελεύθερο" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-4 text-xs" style={{ color: "var(--muted-2)" }}>
          {mode === "reservation" ? (
            <L
              en="Showing the next three open seatings. Tap a time to start your reservation."
              el="Οι τρεις επόμενες διαθέσιμες ώρες τραπεζιού. Πάτησε μία για να κάνεις κράτηση."
            />
          ) : (
            <L
              en="Showing the next three open chairs. Tap a slot to lock it in."
              el="Οι τρεις επόμενες διαθέσιμες θέσεις για σήμερα. Πάτησε μία για να την κλείσεις."
            />
          )}
        </p>
      </div>
    </section>
  );
}
