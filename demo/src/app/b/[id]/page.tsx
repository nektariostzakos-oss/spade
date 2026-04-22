import Link from "next/link";
import { notFound } from "next/navigation";
import { listBookings } from "../../../lib/bookings";
import { verifyBookingToken } from "../../../lib/bookingToken";
import { loadBusiness } from "../../../lib/settings";
import { wallClockInTzToUtc } from "../../../lib/tz";
import CancelButton from "./CancelButton";

export const metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;

  const ok = await verifyBookingToken(id, token ?? "");
  if (!ok) notFound();

  const all = await listBookings();
  const booking = all.find((b) => b.id === id);
  if (!booking) notFound();

  const business = await loadBusiness();
  const tz = business.timezone || "Europe/Athens";
  const slotTs = wallClockInTzToUtc(booking.date, booking.time, tz);
  const now = Date.now();
  const hoursUntil = (slotTs - now) / 3_600_000;
  const isPast = hoursUntil < 0;
  const cancelAllowed = !isPast && hoursUntil > 4 && booking.status !== "cancelled" && booking.status !== "completed";
  const isCancelled = booking.status === "cancelled";
  const lang = booking.lang === "el" ? "el" : "en";

  const L = (en: string, el: string) => (lang === "el" ? el : en);

  const phone = business.phone?.replace(/\s+/g, "") || "";
  const whatsapp = business.social?.whatsapp?.replace(/[^+\d]/g, "") || "";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-lg rounded-2xl border p-8" style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}>
        <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--gold)" }}>
          {L("Your booking", "Το ραντεβού σου")}
        </p>
        <h1 className="mt-2 font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          {isCancelled ? L("Cancelled", "Ακυρώθηκε") : L("Confirmed", "Επιβεβαιωμένο")}
        </h1>

        <dl className="mt-8 space-y-4 text-sm" style={{ color: "var(--foreground)" }}>
          <Row label={L("Service", "Υπηρεσία")} value={booking.serviceName} />
          <Row label={L("With", "Με")} value={booking.barberName} />
          <Row label={L("Date", "Ημερομηνία")} value={`${booking.date} · ${booking.time}`} />
          <Row label={L("Reference", "Κωδικός")} value={booking.id} />
          <Row label={L("Name", "Όνομα")} value={booking.name} />
        </dl>

        {isCancelled ? (
          <p className="mt-8 text-sm" style={{ color: "var(--muted)" }}>
            {L("This booking has been cancelled. You're welcome to book another time — we'd love to see you.",
               "Το ραντεβού ακυρώθηκε. Μπορείς να κλείσεις ξανά όποτε σε βολεύει.")}
          </p>
        ) : isPast ? (
          <p className="mt-8 text-sm" style={{ color: "var(--muted)" }}>
            {L("This booking has already taken place. Hope it went well — we'd appreciate a review!",
               "Αυτό το ραντεβού έχει ήδη πραγματοποιηθεί. Θα χαιρόμασταν πολύ για μια κριτική!")}
          </p>
        ) : cancelAllowed ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <CancelButton
              id={booking.id}
              token={token ?? ""}
              label={L("Cancel booking", "Ακύρωση ραντεβού")}
              confirmText={L("Cancel this booking?", "Να ακυρωθεί το ραντεβού;")}
            />
            <Link
              href="/book"
              className="inline-flex items-center rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
            >
              {L("Reschedule", "Αλλαγή ώρας")}
            </Link>
          </div>
        ) : (
          <p className="mt-8 rounded-lg border px-4 py-3 text-xs"
            style={{ borderColor: "color-mix(in srgb, var(--gold) 30%, transparent)", background: "color-mix(in srgb, var(--gold) 8%, transparent)", color: "var(--foreground)" }}>
            {L("Free cancellation window has closed (4 hours before). Please call or WhatsApp us if you need to change this.",
               "Το περιθώριο δωρεάν ακύρωσης έκλεισε (4 ώρες πριν). Πάρε μας τηλέφωνο ή WhatsApp αν χρειάζεσαι αλλαγή.")}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3 border-t pt-6 text-xs uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--muted-2)" }}>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/^\+/, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--foreground)]">
              WhatsApp
            </a>
          )}
          {phone && <a href={`tel:${phone}`} className="hover:text-[color:var(--foreground)]">{L("Call", "Κλήση")}</a>}
          <Link href="/" className="hover:text-[color:var(--foreground)]">{L("Home", "Αρχική")}</Link>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-2)" }}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
