"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  BARBERS,
  HOURS,
  getSlotsForDay,
  SERVICES,
  getDailySlots,
} from "../../lib/services";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import { useBusiness } from "../../lib/businessClient";

type LiveService = {
  id: string;
  price: number;
  duration: number;
  name_en: string;
  name_el: string;
  desc_en: string;
  desc_el: string;
  tkey?: string;
  fromPrice?: boolean;
  requiresPatchTest?: boolean;
  addOnIds?: string[];
};

type Step = 1 | 2 | 3 | 4 | 5;

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function dateRange(days: number, locale: string) {
  const out: { iso: string; day: string; date: string; weekday: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      iso,
      day: d.getDate().toString(),
      date: d.toLocaleDateString(locale, { month: "short" }),
      weekday: d.toLocaleDateString(locale, { weekday: "short" }),
    });
  }
  return out;
}

export default function BookingFlow() {
  const { t, lang } = useLang();
  const { business } = useBusiness();
  const params = useSearchParams();
  const initialServiceId = params.get("service") ?? "";
  const initialBarberId = params.get("barber") ?? "";

  const [step, setStep] = useState<Step>(initialServiceId ? 2 : 1);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [barberId, setBarberId] = useState(initialBarberId || "any");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [taken, setTaken] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ref: string; manageToken?: string } | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const live = useSection("services", {
    items: SERVICES.map((s) => ({
      id: s.id,
      price: s.price,
      duration: s.duration,
      name_en: t(`${s.tkey}.name`),
      name_el: t(`${s.tkey}.name`),
      desc_en: t(`${s.tkey}.desc`),
      desc_el: t(`${s.tkey}.desc`),
    })) as LiveService[],
  });
  // Prefer the admin-managed services.json (includes fromPrice /
  // requiresPatchTest / bufferMinutes); fall back to the editable
  // content section if the API isn't there.
  const [liveOverride, setLiveOverride] = useState<LiveService[] | null>(null);
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d?.services?.length) return;
        setLiveOverride(d.services.map((s: { id: string; name: string; desc: string; price: number; duration: number; fromPrice?: boolean; requiresPatchTest?: boolean; addOnIds?: string[] }) => ({
          id: s.id,
          name_en: s.name,
          name_el: s.name,
          desc_en: s.desc,
          desc_el: s.desc,
          price: s.price,
          duration: s.duration,
          fromPrice: s.fromPrice,
          requiresPatchTest: s.requiresPatchTest,
          addOnIds: s.addOnIds,
        })));
      })
      .catch(() => {});
  }, []);
  const services: LiveService[] = liveOverride ?? ((live.items as LiveService[]) ?? []);
  const pickName = (s: LiveService) =>
    lang === "el" ? s.name_el || s.name_en : s.name_en;
  const pickDesc = (s: LiveService) =>
    lang === "el" ? s.desc_el || s.desc_en : s.desc_en;
  const service: LiveService | undefined = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );
  const barber = BARBERS.find((b) => b.id === barberId);
  // Slots for the currently-selected date, based on that weekday's business
  // hours (handles days with a midday break via open2/close2).
  const slots = useMemo(() => {
    if (!date) return [];
    // Parse the ISO date as a local date (YYYY-MM-DD has no timezone → treated
    // as local midnight, which for weekday purposes is stable).
    const [y, m, d] = date.split("-").map(Number);
    const localDate = new Date(y, (m || 1) - 1, d || 1);
    const perDay = getSlotsForDay(localDate.getDay(), business.hours);
    // Fall back to the fixed daily grid if the business has no hours configured.
    return perDay.length > 0 ? perDay : getDailySlots();
  }, [date, business.hours]);
  const days = useMemo(
    () => dateRange(14, lang === "el" ? "el-GR" : "en-GB"),
    [lang]
  );

  useEffect(() => {
    if (!date || !barberId) return;
    const ctrl = new AbortController();
    fetch(
      `/api/bookings?date=${encodeURIComponent(date)}&barber=${encodeURIComponent(barberId)}`,
      { signal: ctrl.signal }
    )
      .then((r) => r.json())
      .then((d) => setTaken(d.taken ?? []))
      .catch(() => {});
    return () => ctrl.abort();
  }, [date, barberId]);

  const dayClosed = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    const localDate = new Date(y, (m || 1) - 1, d || 1);
    const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const key = DAY_KEYS[localDate.getDay()];
    const h = business.hours?.find((x) => x.day === key);
    // Prefer the real per-day setting; fall back to legacy HOURS.closedDays.
    if (h) return h.closed;
    return HOURS.closedDays.includes(localDate.getDay());
  };

  // If the current date lands on a closed day (e.g. booking page opened on a Sunday),
  // auto-jump to the next open date.
  useEffect(() => {
    if (dayClosed(date)) {
      const next = days.find((d) => !dayClosed(d.iso));
      if (next) setDate(next.iso);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, days]);

  async function submit() {
    if (!service || !barber) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: (() => {
          // Fold chosen add-ons into the booking: bump price + duration, add a
          // "+ Add-on name" line to the stored service name so admin + emails
          // see everything the client signed up for in one place.
          const addOns = (service.addOnIds ?? [])
            .filter((id) => addOnIds.includes(id))
            .map((id) => services.find((s) => s.id === id))
            .filter((s): s is LiveService => !!s);
          const totalPrice = service.price + addOns.reduce((n, a) => n + a.price, 0);
          const totalDuration = service.duration + addOns.reduce((n, a) => n + a.duration, 0);
          const nameWithAddOns = addOns.length
            ? `${pickName(service)} + ${addOns.map((a) => pickName(a)).join(" + ")}`
            : pickName(service);

          return JSON.stringify({
            serviceId: service.id,
            serviceName: nameWithAddOns,
            price: totalPrice,
            duration: totalDuration,
            barberId: barber.id,
            barberName:
              lang === "el" && barber.id === "any"
                ? "Όποιος είναι ελεύθερος"
                : barber.name,
            date,
            time,
            name,
            phone,
            email,
            notes,
            lang,
            website: honeypot,
          });
        })(),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t("book.error.network"));
      setDone({ ref: d.booking.id, manageToken: d.manageToken });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("book.error.network"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const successLine = t("book.success.line")
      .replace("{date}", date)
      .replace("{time}", time)
      .replace("{barber}", barber?.name ?? "");
    return (
      <section className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl rounded-2xl border border-[#c9a961]/40 bg-[#c9a961]/5 p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a961] text-2xl text-black"
          >
            ✓
          </motion.div>
          <h2 className="font-serif text-4xl font-semibold tracking-tight">
            {t("book.success.title")}
          </h2>
          <p className="mt-3 text-white/65">{successLine}</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
            {t("book.success.ref")} · {done.ref}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
            {t("book.success.email_sent")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {(() => {
              const startDt = new Date(`${date}T${time}:00`);
              const endDt = new Date(startDt.getTime() + (service?.duration ?? 30) * 60_000);
              const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
              const brand = business.name || "Oakline";
              const title = `${pickName(service!)} · ${brand}`;
              const details = [
                `${t("book.sum.service")}: ${pickName(service!)}`,
                barber?.name ? `${t("book.sum.barber")}: ${barber.name}` : "",
                `${t("book.success.ref")}: ${done.ref}`,
              ].filter(Boolean).join("\n");
              const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(startDt)}/${fmt(endDt)}&details=${encodeURIComponent(details)}`;
              const icsLines = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Oakline//Booking//EN",
                "BEGIN:VEVENT",
                `UID:${done.ref}@oakline.studio`,
                `DTSTAMP:${fmt(new Date())}`,
                `DTSTART:${fmt(startDt)}`,
                `DTEND:${fmt(endDt)}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
                "END:VEVENT",
                "END:VCALENDAR",
              ].join("\r\n");
              const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines)}`;
              return (
                <>
                  <a
                    href={gcal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:border-white/40"
                  >
                    {lang === "el" ? "Google Ημερολόγιο" : "Google Calendar"}
                  </a>
                  <a
                    href={ics}
                    download={`oakline-${done.ref}.ics`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:border-white/40"
                  >
                    {lang === "el" ? "Apple / Outlook (.ics)" : "Apple / Outlook (.ics)"}
                  </a>
                </>
              );
            })()}
          </div>

          {done.manageToken && (
            <div className="mt-6">
              <a
                href={`/b/${encodeURIComponent(done.ref)}?t=${done.manageToken}`}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-white"
              >
                {lang === "el" ? "Διαχείριση ραντεβού →" : "Manage booking →"}
              </a>
            </div>
          )}

          <a
            href="/"
            className="mt-10 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            {t("book.success.back")}
          </a>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <Stepper step={step} />

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 backdrop-blur">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-6 font-serif text-2xl">{t("book.step.service")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setServiceId(s.id);
                        setStep(2);
                      }}
                      className={`group rounded-xl border p-5 text-left transition-colors ${
                        serviceId === s.id
                          ? "border-[#c9a961] bg-[#c9a961]/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-serif text-lg">{pickName(s)}</p>
                        <p className="font-serif text-lg text-[#c9a961]">
                          £{s.price}
                        </p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
                        {s.duration} {t("minutes")}
                      </p>
                      <p className="mt-2 text-sm text-white/55">{pickDesc(s)}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-6 font-serif text-2xl">{t("book.step.barber")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {BARBERS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBarberId(b.id);
                        setStep(3);
                      }}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        barberId === b.id
                          ? "border-[#c9a961] bg-[#c9a961]/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/30"
                      }`}
                    >
                      <p className="font-serif text-lg">
                        {lang === "el" && b.id === "any"
                          ? "Όποιος είναι ελεύθερος"
                          : b.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
                        {b.role}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-6 font-serif text-2xl">{t("book.step.time")}</h3>
                {(() => {
                  const openDays = days.filter((d) => !dayClosed(d.iso));
                  return (
                    <div className="-mx-1 flex gap-2 overflow-x-auto pb-2">
                      {openDays.map((d) => {
                        const active = date === d.iso;
                        return (
                          <button
                            key={d.iso}
                            onClick={() => {
                              setDate(d.iso);
                              setTime("");
                            }}
                            className={`min-w-[5.5rem] rounded-xl border px-4 py-3 text-center transition-colors ${
                              active
                                ? "border-[#c9a961] bg-[#c9a961]/10"
                                : "border-white/10 bg-white/[0.02] hover:border-white/30"
                            }`}
                          >
                            <p className="text-[10px] uppercase tracking-widest text-white/50">
                              {d.weekday}
                            </p>
                            <p className="mt-1 font-serif text-2xl">{d.day}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">
                              {d.date}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {(() => {
                  const today = todayStr();
                  const now = new Date();
                  const isToday = date === today;
                  const freeSlots = slots.filter((s) => {
                    if (taken.includes(s)) return false;
                    if (isToday) {
                      // Only show slots at least 30 min from now.
                      const [h, m] = s.split(":").map(Number);
                      const slotTs = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                        h,
                        m
                      ).getTime();
                      if (slotTs - now.getTime() < 30 * 60_000) return false;
                    }
                    return true;
                  });
                  if (freeSlots.length === 0) {
                    return (
                      <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/60">
                        {lang === "el"
                          ? "Δεν υπάρχουν διαθέσιμες ώρες για αυτή τη μέρα. Δοκίμασε άλλη ημερομηνία."
                          : "No available times for this day. Try a different date."}
                      </p>
                    );
                  }
                  // Group slots into sessions separated by any gap > 30 min.
                  // This makes the midday break on split-session days visible.
                  const sessions: string[][] = [];
                  let current: string[] = [];
                  let lastMin = -Infinity;
                  for (const s of freeSlots) {
                    const [h, m] = s.split(":").map(Number);
                    const min = h * 60 + m;
                    if (current.length && min - lastMin > 30) {
                      sessions.push(current);
                      current = [];
                    }
                    current.push(s);
                    lastMin = min;
                  }
                  if (current.length) sessions.push(current);

                  const sessionLabel = (range: string[]): string => {
                    if (sessions.length < 2) return "";
                    const first = range[0];
                    const hour = parseInt(first.split(":")[0], 10);
                    if (hour < 12)
                      return lang === "el" ? "Πρωί" : "Morning";
                    if (hour < 17)
                      return lang === "el" ? "Μεσημέρι" : "Midday";
                    return lang === "el" ? "Απόγευμα" : "Afternoon";
                  };

                  return (
                    <div className="mt-8 space-y-6">
                      {sessions.map((range, si) => (
                        <div key={si}>
                          {sessions.length > 1 && (
                            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
                              {sessionLabel(range)} · {range[0]}–{range[range.length - 1]}
                            </p>
                          )}
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                            {range.map((slot) => {
                              const active = time === slot;
                              return (
                                <button
                                  key={slot}
                                  onClick={() => {
                                    setTime(slot);
                                    setStep(4);
                                  }}
                                  className={`rounded-lg border py-2.5 text-sm transition-colors ${
                                    active
                                      ? "border-[#c9a961] bg-[#c9a961] text-black"
                                      : "border-white/10 bg-white/[0.02] text-white/85 hover:border-white/40"
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-6 font-serif text-2xl">{t("book.step.details")}</h3>

                {service && service.addOnIds && service.addOnIds.length > 0 && (
                  <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">
                      {lang === "el" ? "Πρόσθεσε" : "Add to your visit"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {service.addOnIds.map((addOnId) => {
                        const addOn = services.find((s) => s.id === addOnId);
                        if (!addOn) return null;
                        const checked = addOnIds.includes(addOnId);
                        return (
                          <label key={addOnId} className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${checked ? "border-[#c9a961] bg-[#c9a961]/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"}`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setAddOnIds((prev) =>
                                    e.target.checked ? [...prev, addOnId] : prev.filter((x) => x !== addOnId)
                                  );
                                }}
                                style={{ accentColor: "#c9a961" }}
                              />
                              <div>
                                <div className="text-sm text-white">{pickName(addOn)}</div>
                                <div className="text-xs text-white/50">{pickDesc(addOn)}</div>
                              </div>
                            </div>
                            <div className="text-sm text-[#c9a961]">+£{addOn.price}</div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="booking-name"
                    label={t("book.fld.name")}
                    value={name}
                    onChange={setName}
                    placeholder=""
                    type="text"
                    autoComplete="name"
                    required
                  />
                  <Field
                    id="booking-phone"
                    label={t("book.fld.phone")}
                    value={phone}
                    onChange={setPhone}
                    placeholder="+30 6900 000 000"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                  />
                  <Field
                    id="booking-email"
                    label={t("book.fld.email")}
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="booking-notes" className="mb-2 block text-xs uppercase tracking-widest text-white/40">
                    {t("book.fld.notes")}
                  </label>
                  <textarea
                    id="booking-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("book.notes.ph")}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-white/40"
                  />
                </div>

                {/* Honeypot — bots fill it, humans never see it. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: "hidden",
                    clipPath: "inset(50%)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                >
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>

                <button
                  onClick={() => setStep(5)}
                  disabled={!name || !phone}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c9a961] px-7 py-3 text-sm font-semibold uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("book.btn.review")}
                </button>
              </motion.div>
            )}

            {step === 5 && service && barber && (
              <motion.div
                key="5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-6 font-serif text-2xl">{t("book.step.confirm")}</h3>
                {service.requiresPatchTest && (
                  <div className="mb-5 rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: "color-mix(in srgb, #f59e0b 40%, transparent)", background: "color-mix(in srgb, #f59e0b 10%, transparent)", color: "#fcd34d" }}>
                    {lang === "el"
                      ? "Για πρώτη βαφή χρειάζεται patch test 48 ώρες πριν. Θα επικοινωνήσουμε μαζί σου για να το κανονίσουμε δωρεάν."
                      : "First-time colour clients need a free 48h patch test. We'll be in touch to arrange it before this appointment."}
                  </div>
                )}
                <dl className="divide-y divide-white/10 border-y border-white/10">
                  <Row label={t("book.sum.service")} value={`${service.fromPrice ? (lang === "el" ? "από £" : "from £") : "£"}${service.price} · ${pickName(service)}`} />
                  <Row label={t("book.sum.duration")} value={`${service.duration} ${t("minutes")}`} />
                  <Row label={t("book.sum.barber")} value={barber.name} />
                  <Row label={t("book.sum.date")} value={date} />
                  <Row label={t("book.sum.time")} value={time} />
                  <Row label={t("book.fld.name")} value={name} />
                  <Row label={t("book.fld.phone")} value={phone} />
                  {email && <Row label={t("book.fld.email")} value={email} />}
                  {notes && <Row label={t("book.sum.notes")} value={notes} />}
                </dl>

                {error && (
                  <p className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#c9a961] px-7 py-3 text-sm font-semibold uppercase tracking-widest text-black disabled:opacity-50"
                  >
                    {submitting ? t("book.btn.confirming") : t("book.btn.confirm")}
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="rounded-full border border-white/20 px-5 py-3 text-sm uppercase tracking-widest text-white/80"
                  >
                    {t("book.btn.back")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-between text-sm text-white/50">
          <button
            onClick={() => setStep((s) => Math.max(1, (s - 1) as Step) as Step)}
            disabled={step === 1}
            className="disabled:opacity-30"
          >
            ← {t("book.btn.back")}
          </button>
          <p>
            {t("book.steps.label")} {step} / 5
            {service ? ` · ${pickName(service)}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function Stepper({ step }: { step: Step }) {
  const { t } = useLang();
  const labels = [
    t("book.step.service"),
    t("book.step.barber"),
    t("book.step.time"),
    t("book.step.details"),
    t("book.step.confirm"),
  ];
  return (
    <div className="flex items-center justify-between gap-2">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div
            key={l}
            className="flex flex-1 items-center gap-3 first:flex-none last:flex-none"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                active
                  ? "border-[#c9a961] bg-[#c9a961] text-black"
                  : done
                    ? "border-[#c9a961] bg-transparent text-[#c9a961]"
                    : "border-white/15 bg-transparent text-white/40"
              }`}
            >
              {done ? "✓" : n}
            </div>
            <p
              className={`hidden text-xs uppercase tracking-widest sm:block ${
                active ? "text-white" : "text-white/40"
              }`}
            >
              {l}
            </p>
            {i < labels.length - 1 && (
              <div
                className={`hidden flex-1 h-px sm:block ${
                  done ? "bg-[#c9a961]" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  required,
  maxLength = 200,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs uppercase tracking-widest text-white/40">
        {label}{required ? " *" : ""}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-required={required || undefined}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-white/40"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3 py-3 sm:grid-cols-[120px_1fr] sm:gap-4">
      <dt className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </dt>
      <dd className="text-white">{value}</dd>
    </div>
  );
}
