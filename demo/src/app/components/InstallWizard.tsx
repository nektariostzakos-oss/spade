"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { qrToSvg } from "../../lib/qr";
import { lookupPostal } from "../../lib/postalLookup";

// NB: bumped from spade_install_draft_v1 after the generic rebrand — any older
// draft carries stale template IDs / wordmarks from the Spade era, so we
// deliberately don't offer to resume those. Old key will be ignored.
const DRAFT_KEY = "atelier_install_draft_v1";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
function wordmarkFrom(name: string) {
  return name.trim().toUpperCase().slice(0, 24);
}
function suggestedEmail(name: string) {
  const handle = slugify(name).replace(/-/g, "");
  return handle ? `hello@${handle}.com` : "";
}
function generatePassword() {
  const words = ["cedar", "lantern", "quiet", "amber", "river", "oak", "harbor", "copper", "slate", "maple", "linen", "velvet", "ember", "orchid", "atlas", "north", "birch", "ivory"];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(10 + Math.random() * 89);
  return `${pick()}-${pick()}-${pick()}-${n}`;
}

type Template = {
  id: string;
  name: string;
  industry: string;
  tagline: string;
  description: string;
  cover: string;
  accentColor: string;
  features: string[];
  stats: { services: number; products: number; posts: number; categories: number };
  theme: Record<string, string>;
  branding: { wordmark: string; tagline_en: string; tagline_el: string };
};

// Retained so old drafts that stored `mode` still deserialise; unused now.
type Mode = "demo" | "clean";

type HourRow = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  open: string;   // "HH:MM"
  close: string;
  closed: boolean;
  open2?: string; // optional second window for split-shift shops
  close2?: string;
};

type Business = {
  name: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  timezone: string;  // IANA zone id, e.g. "Europe/London"
  hours: HourRow[];  // 7 entries, monday-first
};

const DEFAULT_HOURS: HourRow[] = [
  { day: "mon", open: "10:00", close: "19:00", closed: false },
  { day: "tue", open: "10:00", close: "19:00", closed: false },
  { day: "wed", open: "10:00", close: "19:00", closed: false },
  { day: "thu", open: "10:00", close: "19:00", closed: false },
  { day: "fri", open: "10:00", close: "19:00", closed: false },
  { day: "sat", open: "10:00", close: "17:00", closed: false },
  { day: "sun", open: "00:00", close: "00:00", closed: true },
];

// Small curated list — covers most salon markets. The wizard also allows
// free-text fallback for any IANA zone if yours isn't here.
const COMMON_TIMEZONES: { id: string; label: string }[] = [
  { id: "Europe/London", label: "London · GMT" },
  { id: "Europe/Athens", label: "Athens · EET" },
  { id: "Europe/Paris", label: "Paris · CET" },
  { id: "Europe/Berlin", label: "Berlin · CET" },
  { id: "Europe/Madrid", label: "Madrid · CET" },
  { id: "Europe/Rome", label: "Rome · CET" },
  { id: "Europe/Amsterdam", label: "Amsterdam · CET" },
  { id: "Europe/Lisbon", label: "Lisbon · WET" },
  { id: "Europe/Dublin", label: "Dublin · GMT" },
  { id: "Europe/Istanbul", label: "Istanbul · TRT" },
  { id: "Asia/Nicosia", label: "Nicosia · EET" },
  { id: "America/New_York", label: "New York · ET" },
  { id: "America/Chicago", label: "Chicago · CT" },
  { id: "America/Los_Angeles", label: "Los Angeles · PT" },
];

type Admin = { email: string; password: string; confirm: string };

// 5-step flow. Data-mode picker was dropped — every install is a clean
// start; the buyer builds their catalogue from scratch in the admin.
const STEPS = [
  { id: 0, label: "Welcome" },
  { id: 1, label: "Template" },
  { id: 2, label: "Business" },
  { id: 3, label: "Admin" },
  { id: 4, label: "Review" },
];

export default function InstallWizard() {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  // Retained for draft compatibility; always "clean" at submit time.
  const [mode, setMode] = useState<Mode>("clean");
  const [business, setBusiness] = useState<Business>({
    name: "", streetAddress: "", city: "", postalCode: "",
    country: "GR", phone: "", email: "",
    timezone: "Europe/London", hours: DEFAULT_HOURS,
  });
  const [admin, setAdmin] = useState<Admin>({ email: "", password: "", confirm: "" });
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<null | { step: number; ts: number }>(null);
  const [stats, setStats] = useState<{ total: number; week: number } | null>(null);
  const [teammates, setTeammates] = useState<string[]>([]);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);
  const draftLoaded = useRef(false);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((d) => {
      setTemplates(d.templates || []);
      if (d.templates?.length === 1) setSelected(d.templates[0]);
    });
    fetch("/api/install-stats").then((r) => r.json()).then(setStats).catch(() => {});

    // Browser auto-detect for country + timezone. We always seed the detected
    // IANA zone on first paint — the hours / booking engine is timezone-safe
    // and picking the wrong zone silently breaks every booking slot.
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const lang = (navigator.language || "").toLowerCase();
      const detected = detectCountry(tz, lang);
      setBusiness((b) => ({
        ...b,
        country: b.country === "GR" && detected ? detected : b.country,
        timezone: tz || b.timezone,
      }));
    } catch {}

    // Resume draft
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d.step === "number" && d.step > 0) setResumeOffer({ step: d.step, ts: d.ts || 0 });
      }
    } catch {}
  }, []);

  // Save draft on every meaningful change — but only once the user has actually
  // started (step > 0 or any meaningful field filled). This stops the auto-detect
  // country update on mount from clobbering a real draft back to step=0.
  useEffect(() => {
    if (!draftLoaded.current) { draftLoaded.current = true; return; }
    const meaningful =
      step > 0 ||
      !!selected ||
      !!business.name ||
      !!admin.email ||
      teammates.length > 0;
    if (!meaningful) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        step, selectedId: selected?.id, mode, business, admin: { email: admin.email },
        teammates, ts: Date.now(),
      }));
    } catch {}
  }, [step, selected, mode, business, admin.email, teammates]);

  const pendingResumeId = useRef<string | null>(null);

  function resumeDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.selectedId) {
        const t = templates.find((x) => x.id === d.selectedId);
        if (t) setSelected(t);
        else pendingResumeId.current = d.selectedId; // apply once templates arrive
      }
      if (d.mode) setMode(d.mode);
      if (d.business) setBusiness((b) => ({ ...b, ...d.business }));
      if (d.admin?.email) setAdmin((a) => ({ ...a, email: d.admin.email }));
      if (Array.isArray(d.teammates)) setTeammates(d.teammates);
      if (typeof d.step === "number") setStep(d.step);
      setResumeOffer(null);
    } catch {}
  }

  // If user clicked Resume before templates were fetched, apply selection now
  useEffect(() => {
    const id = pendingResumeId.current;
    if (id && templates.length > 0) {
      const t = templates.find((x) => x.id === id);
      if (t) setSelected(t);
      pendingResumeId.current = null;
    }
  }, [templates]);
  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setResumeOffer(null);
  }

  const canNext = useMemo(() => {
    if (step === 1) return !!selected;
    if (step === 2) {
      const hasBasics = business.name.trim().length > 0 && business.city.trim().length > 0;
      const emailOk = !business.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email);
      const hasTz = !!business.timezone.trim();
      const hasOpenDay = business.hours.some((h) => !h.closed);
      return hasBasics && emailOk && hasTz && hasOpenDay;
    }
    if (step === 3) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email);
      return emailOk && admin.password.length >= 8 && admin.password === admin.confirm;
    }
    return true;
  }, [step, selected, business, admin]);

  async function install() {
    if (!selected) return;
    setInstalling(true);
    setError(null);
    setProgressEvents([]);

    // Narrate steps for UX credibility while the POST runs
    const narrate = async () => {
      const lines = [
        `Unpacking ${selected.name} bundle`,
        `Applying theme ${selected.theme.background} · typography`,
        `Creating admin account (${admin.email})`,
        `Signing you in`,
      ];
      for (const l of lines) {
        await new Promise((r) => setTimeout(r, 300));
        setProgressEvents((p) => [...p, l]);
      }
    };
    const narration = narrate();

    const r = await fetch("/api/install", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateId: selected.id,
        mode: "clean",
        business,
        admin: { email: admin.email, password: admin.password },
        teammates,
      }),
    });
    await narration;
    setInstalling(false);
    if (r.ok) {
      setDone(true);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
    } else {
      const d = await r.json().catch(() => ({ error: "Install failed" }));
      setError(d.error || "Install failed");
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      const active = document.activeElement;
      const inForm = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
      if (e.key === "Enter" && !e.shiftKey && !inForm && canNext && step < 4) {
        setStep((s) => s + 1);
      } else if (e.key === "Enter" && e.shiftKey && step > 0 && step <= 4) {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canNext, done]);

  const INSTALLER_ACCENT = "#7b95e8";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at top, #141824 0%, #0b0d13 55%, #07080c 100%)",
        color: "#ecebe6",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        <Header templates={templates.length} accent={INSTALLER_ACCENT} stats={stats} />

        {resumeOffer && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#7b95e8]/40 bg-[#7b95e8]/10 p-4"
          >
            <div className="text-sm text-white/85">
              <strong>Draft found.</strong> Continue where you left off (step {resumeOffer.step + 1})?
            </div>
            <div className="flex gap-2">
              <button onClick={resumeDraft} className="rounded-full bg-[#7b95e8] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-black">Resume</button>
              <button onClick={discardDraft} className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10">Start fresh</button>
            </div>
          </motion.div>
        )}

        <ProgressBar step={step} total={STEPS.length - 1} primary={INSTALLER_ACCENT} labels={STEPS.map((s) => s.label)} />

        <div className="mt-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            {done ? (
              <DoneStep key="done" business={business} template={selected} />
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && <Welcome onStart={() => setStep(1)} />}
                {step === 1 && (
                  <TemplateStep
                    templates={templates}
                    selected={selected}
                    onSelect={setSelected}
                  />
                )}
                {step === 2 && <BusinessStep value={business} onChange={setBusiness} />}
                {step === 3 && <AdminStep value={admin} onChange={setAdmin} teammates={teammates} onTeammatesChange={setTeammates} />}
                {step === 4 && (
                  <ReviewStep
                    template={selected!}
                    business={business}
                    admin={admin}
                    teammates={teammates}
                    installing={installing}
                    progress={progressEvents}
                    error={error}
                    onInstall={install}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!done && step > 0 && step < 4 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="rounded-full px-8 py-2.5 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: INSTALLER_ACCENT, color: "#0a0e15" }}
            >
              Continue →
            </button>
          </div>
        )}

        {!done && step === 4 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              disabled={installing}
              className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function detectCountry(tz: string, lang: string): string | null {
  if (tz.includes("Athens")) return "GR";
  if (lang.startsWith("el")) return "GR";
  if (tz.includes("London")) return "GB";
  if (tz.includes("Paris")) return "FR";
  if (tz.includes("Berlin")) return "DE";
  if (tz.includes("Madrid")) return "ES";
  if (tz.includes("Rome")) return "IT";
  if (tz.includes("Nicosia")) return "CY";
  if (tz.includes("Istanbul")) return "TR";
  if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago")) return "US";
  if (lang.startsWith("en-gb")) return "GB";
  if (lang.startsWith("en-us")) return "US";
  return null;
}

function Header({ templates, accent, stats }: { templates: number; accent: string; stats: { total: number; week: number } | null }) {
  return (
    <div className="mb-10">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/setup/logo.svg" alt="" className="h-10 w-10" />
          <div>
            <p className="font-serif text-lg leading-none tracking-[0.2em] text-white">ATELIER</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.35em] text-white/45">by Mindscrollers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden sm:flex gap-4 text-[10px] uppercase tracking-[0.25em] text-white/50">
              <span>
                <span className="text-white">{stats.total.toLocaleString()}</span> installs
              </span>
              <span>
                <span className="text-white">{stats.week}</span> this week
              </span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-white/55">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />
            Installer · v1.0
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>
          First-time setup
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Let's build your site.</h1>
        <p className="mt-3 text-sm text-white/55">
          {templates > 0
            ? `${templates} template${templates === 1 ? "" : "s"} ready to install. Pick one, choose whether to start with demo data, and you're live in under two minutes.`
            : "Loading templates…"}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ step, total, labels, primary }: { step: number; total: number; labels: string[]; primary: string }) {
  return (
    <div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={false}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-0 top-0 h-full"
          style={{ background: primary }}
        />
      </div>
      <div className="mt-3 hidden justify-between text-[10px] uppercase tracking-widest text-white/50 sm:flex">
        {labels.map((l, i) => (
          <span key={l} className={i <= step ? "text-white" : ""}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      {/* HERO — the punchline first */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1e2b] via-[#0f1219] to-[#07080c] p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#7b95e8]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#c9a961]/10 blur-3xl" />

        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#7b95e8]">Atelier · A salon site you own</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            The same shop window as Shopify.<br />
            <span className="text-white/55">Without the £80/month.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base text-white/70">
            One Node.js app, one ZIP, one price. Booking, shop, Stripe, gift cards,
            staff hours, bilingual blog — all in the code you just downloaded.
            No plugin marketplace. No MySQL. No monthly bill.
          </p>

          {/* Animated stat row — the headline numbers */}
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <StatTile label="Page load" value="~100ms" sub="static + ISR" />
            <StatTile label="Plugins needed" value="0" sub="everything built-in" />
            <StatTile label="Runs on" value="€3/mo" sub="any Node host" />
            <StatTile label="Database" value="None" sub="JSON + file lock" />
          </div>
        </div>
      </div>

      {/* WHY NOT JUST WORDPRESS — the comparison buyers actually think about */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">Why not WordPress?</p>
        <h3 className="mt-2 font-serif text-2xl">
          Because every salon we built on WP ended up paying twice.
        </h3>
        <p className="mt-3 max-w-3xl text-sm text-white/65">
          WordPress is free until you need bookings, payments, GDPR, a language toggle
          and a site that doesn't fall over on a Saturday. Then you're gluing 15 plugins
          together and praying the next core update doesn't break them. This is the
          same feature set, delivered as typed, compiled code.
        </p>

        <div className="mt-6 grid gap-0 overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-[1fr_1fr]">
          <CompareCol
            title="WordPress + WooCommerce"
            tone="dim"
            rows={[
              { label: "Stack", val: "PHP + MySQL + Apache + 15 plugins" },
              { label: "Page load", val: "600ms – 2s (TTFB heavy)" },
              { label: "Bookings", val: "Bookly / Amelia · €89–129/yr" },
              { label: "Bilingual", val: "WPML · €99/yr" },
              { label: "GDPR banner", val: "Plugin (breaks on update)" },
              { label: "Updates", val: "Core + 15 plugins, fragile" },
              { label: "Backups", val: "Another plugin, paid" },
              { label: "Hosting floor", val: "~€8/mo (MySQL + PHP memory)" },
              { label: "Ownership", val: "Split across 15 vendors" },
            ]}
          />
          <CompareCol
            title="Atelier · this template"
            tone="bright"
            rows={[
              { label: "Stack", val: "Next.js 16 + TypeScript + JSON" },
              { label: "Page load", val: "~100ms (ISR + static)" },
              { label: "Bookings", val: "Built in · interval + buffer + staff" },
              { label: "Bilingual", val: "Built in · EN/EL per field" },
              { label: "GDPR banner", val: "Built in · consent-gated analytics" },
              { label: "Updates", val: "One repo, one ZIP, one redeploy" },
              { label: "Backups", val: "One JSON download" },
              { label: "Hosting floor", val: "~€3/mo (any Node host)" },
              { label: "Ownership", val: "100% yours · readable code" },
            ]}
          />
        </div>
      </div>

      {/* WHAT'S IN THE BOX — features */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#7b95e8]">What's in the box</p>
        <h3 className="mt-2 font-serif text-2xl">Everything a salon actually runs on.</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon="📅" title="Bookings" desc="Conflict detection, buffer time, staff hours, cancel/reschedule links." />
          <Feature icon="💳" title="Stripe Checkout" desc="Shop, gift cards, coupons. Webhook-verified orders." />
          <Feature icon="🌍" title="EN / EL bilingual" desc="Every field has two copies. Blog, services, nav — all translatable." />
          <Feature icon="📧" title="Email engine" desc="Confirmations, 8h reminders, post-visit reviews, bulk to clients." />
          <Feature icon="🛡️" title="GDPR-ready" desc="Cookie banner, consent-gated analytics, CSV export, right-to-erasure." />
          <Feature icon="🎨" title="Inline edits" desc="Pencil any heading, any paragraph. Stored atomically in JSON." />
          <Feature icon="📊" title="Analytics + reviews" desc="Built-in page tracker, Google/Meta/GTM optional, review requests." />
          <Feature icon="📱" title="Mobile-first" desc="Sticky book bar, WhatsApp button, touch-first booking flow." />
          <Feature icon="🔐" title="Secure by default" desc="PBKDF2 hashes, HMAC sessions, rate-limited auth, no SQL surface." />
        </div>
      </div>

      {/* COST REPLACED */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">What you stop paying for</p>
        <div className="mt-5 grid gap-2 text-xs sm:grid-cols-4">
          <ReplaceRow tool="Calendly" cost="£10/mo" />
          <ReplaceRow tool="Shopify Lite" cost="£30/mo" />
          <ReplaceRow tool="Mailchimp" cost="£15/mo" />
          <ReplaceRow tool="Squarespace" cost="£25/mo" />
        </div>
        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <p className="font-serif text-3xl text-white">£80<span className="text-lg text-white/50">/mo</span></p>
          <p className="text-xs text-white/55">
            in subscriptions — <span className="text-white">replaced by one install you own</span>.
            That's <span className="text-white">£960/year</span> back in the till.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={onStart}
            className="rounded-full px-10 py-3.5 text-xs font-semibold uppercase tracking-widest text-black transition-transform hover:-translate-y-0.5 hover:opacity-90"
            style={{ background: "#7b95e8", boxShadow: "0 10px 40px -10px #7b95e8" }}
          >
            Start setup →
          </button>
          <p className="mt-3 text-xs text-white/40">
            Tip: press{" "}
            <kbd className="rounded border border-white/20 px-1.5 text-[10px]">Enter</kbd> to advance,{" "}
            <kbd className="rounded border border-white/20 px-1.5 text-[10px]">Shift + Enter</kbd> to go back.
          </p>
        </div>
        <p className="text-[11px] text-white/40 sm:text-right">
          Under 2 minutes · No credit card · Works offline
          <br />
          <span className="text-white/60">Everything editable from the admin dashboard.</span>
        </p>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="mt-2 font-serif text-2xl text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/45">{sub}</p>
    </div>
  );
}

function CompareCol({
  title, tone, rows,
}: {
  title: string;
  tone: "dim" | "bright";
  rows: { label: string; val: string }[];
}) {
  const bright = tone === "bright";
  return (
    <div
      className={`p-5 ${bright ? "bg-[#7b95e8]/[0.06]" : "bg-black/20"}`}
      style={bright ? { boxShadow: "inset 0 0 0 1px rgba(123,149,232,0.25)" } : undefined}
    >
      <p className={`text-[10px] uppercase tracking-[0.3em] ${bright ? "text-[#7b95e8]" : "text-white/45"}`}>
        {title}
      </p>
      <dl className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 text-xs">
            <dt className="text-white/45">{r.label}</dt>
            <dd className={bright ? "text-right text-white" : "text-right text-white/55"}>{r.val}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ReplaceRow({ tool, cost }: { tool: string; cost: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-widest text-white/40">Replaces</p>
      <p className="mt-1 text-sm text-white">{tool}</p>
      <p className="mt-0.5 text-[11px] text-white/50">{cost}</p>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xl">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-white/55">{desc}</p>
    </div>
  );
}

function TemplateStep({ templates, selected, onSelect }: { templates: Template[]; selected: Template | null; onSelect: (t: Template) => void }) {
  if (templates.length === 0) {
    return <p className="py-20 text-center text-white/40">No templates found.</p>;
  }
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">Step 1 of 4</p>
      <h2 className="mt-2 font-serif text-3xl">Pick a template</h2>
      <p className="mt-2 text-sm text-white/55">More templates coming — pick any to preview the look and feel.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const active = selected?.id === t.id;
          return (
            <div
              key={t.id}
              className={`group overflow-hidden rounded-2xl border transition-all ${
                active ? "border-[#c9a961] shadow-[0_0_0_4px_rgba(201,169,97,0.15)]" : "border-white/10 hover:border-white/30"
              }`}
              style={{ background: t.theme.background as string }}
            >
              <button onClick={() => onSelect(t)} className="block w-full text-left">
                <div className="relative aspect-[8/5] w-full overflow-hidden">
                  <img src={t.cover} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {active && (
                    <span className="absolute right-3 top-3 rounded-full bg-[#c9a961] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-black">
                      Selected
                    </span>
                  )}
                </div>
                <div className="p-5 pb-3">
                  <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: t.accentColor }}>
                    {t.industry}
                  </p>
                  <h3 className="mt-2 font-serif text-xl" style={{ color: t.theme.foreground as string }}>
                    {t.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs" style={{ color: (t.theme.muted as string) || "rgba(255,255,255,0.6)" }}>
                    {t.tagline}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag>{t.stats.services} services</Tag>
                    <Tag>{t.stats.products} products</Tag>
                    <Tag>{t.stats.posts} posts</Tag>
                  </div>
                </div>
              </button>
              <div className="flex gap-2 border-t border-white/10 p-3">
                <button
                  onClick={() => onSelect(t)}
                  className={`flex-1 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    active ? "bg-[#c9a961] text-black" : "border border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {active ? "Selected ✓" : "Use this"}
                </button>
                <a
                  href={`/?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/80 hover:bg-white/10"
                >
                  Preview demo ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#c9a961]/40 bg-[#c9a961]/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">Selected · {selected.name}</p>
              <p className="mt-2 text-sm text-white/80">{selected.description}</p>
              <ul className="mt-3 grid gap-1.5 text-xs text-white/60 sm:grid-cols-2">
                {selected.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/?preview=1"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-white/85 hover:bg-white/10"
                >
                  Open full preview ↗
                </a>
                <a
                  href="/book?preview=1"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-white/85 hover:bg-white/10"
                >
                  Booking flow ↗
                </a>
                <a
                  href="/blog?preview=1"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-white/85 hover:bg-white/10"
                >
                  Blog ↗
                </a>
              </div>
            </div>

            <SpecsBlock />
          </div>

          <MobilePreview template={selected} />
        </motion.div>
      )}
    </div>
  );
}

const SPEC_GROUPS: { icon: string; title: string; items: string[] }[] = [
  {
    icon: "⚡",
    title: "Performance",
    items: [
      "Next.js 16 · App Router · Server Components",
      "LCP < 2.0s · CLS < 0.05 · INP < 200ms",
      "Turbopack dev, AVIF/WebP images, responsive sizes",
      "30-day image cache · long-term static caching",
      "Edge-ready · zero-config deploy",
    ],
  },
  {
    icon: "🔍",
    title: "SEO built-in",
    items: [
      "Per-page metadata · OpenGraph · Twitter cards",
      "LocalBusiness JSON-LD schema auto-generated",
      "Dynamic sitemap.xml + robots.txt + llms.txt",
      "Editable title/description/OG image per route",
      "Bilingual EN/EL with hreflang alternates",
    ],
  },
  {
    icon: "📊",
    title: "Admin dashboard",
    items: [
      "Bookings · Orders · Clients · Products · Blog CRUD",
      "Services + Staff + Coupons + Reviews · full CRUD",
      "Analytics: pageviews, conversions, top pages/services",
      "Calendar view + waitlist + holidays + audit log",
      "CSV import/export · backup/restore · GDPR tools",
      "Email campaigns · 8-hour reminder cron",
    ],
  },
  {
    icon: "🎨",
    title: "Fully rebrandable",
    items: [
      "14 color presets · 10-token theme editor · live preview",
      "6 premium fonts (Playfair, Inter, Fraunces…)",
      "Logo, favicon, wordmark, tagline — all editable",
      "Navigation, book button, footer — drag-configurable",
      "Industry presets · AI content regenerator",
    ],
  },
  {
    icon: "🛡️",
    title: "Security & reliability",
    items: [
      "CSP, HSTS, X-Frame-Options, Permissions-Policy",
      "PBKDF2 password hashing · signed session cookies",
      "IP rate limiting · honeypot spam defense",
      "Role-based access (admin / staff)",
      "Input length caps · email/phone/date validation",
    ],
  },
  {
    icon: "♿",
    title: "UX & accessibility",
    items: [
      "WCAG 2.2 AA · keyboard + screen-reader tested",
      "Framer-motion microinteractions · reduced-motion safe",
      "Cart · checkout · booking conflict detection",
      "Dark mode native · auto theme per system preference",
      "PWA manifest · installable on mobile",
    ],
  },
];

function SpecsBlock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#7b95e8]">What's in the box</p>
        <p className="text-[10px] uppercase tracking-widest text-white/40">Every template includes</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPEC_GROUPS.map((g) => (
          <div key={g.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-base">{g.icon}</span>
              {g.title}
            </p>
            <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-white/65">
              {g.items.map((it) => (
                <li key={it} className="flex gap-1.5">
                  <span className="text-[#7b95e8]">•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-center sm:grid-cols-4">
        <Metric label="Lighthouse" value="95+" />
        <Metric label="First paint" value="< 1.2s" />
        <Metric label="Admin tables" value="14" />
        <Metric label="Languages" value="EN / EL" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-2xl text-white">{value}</p>
      <p className="text-[9px] uppercase tracking-[0.25em] text-white/45">{label}</p>
    </div>
  );
}

function MobilePreview({ template }: { template: Template }) {
  const [route, setRoute] = useState<string>("/");
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  const ROUTES = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Services" },
    { path: "/shop", label: "Shop" },
    { path: "/blog", label: "Blog" },
    { path: "/book", label: "Book" },
    { path: "/contact", label: "Contact" },
  ];

  useEffect(() => { setLoading(true); }, [route, iframeKey]);

  const src = `${route}${route.includes("?") ? "&" : "?"}preview=1`;

  return (
    <div className="lg:sticky lg:top-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Live preview</p>
        <div className="flex gap-1 rounded-full border border-white/15 bg-white/[0.04] p-0.5">
          {(["mobile", "desktop"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`rounded-full px-3 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${
                device === d ? "bg-[#7b95e8] text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {d === "mobile" ? "📱" : "🖥"} {d}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-white/55">
        <strong className="text-white/80">{template.name}</strong> · {device === "mobile" ? "390×720 mobile" : "1280×800 desktop, scaled"}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {ROUTES.map((r) => (
          <button
            key={r.path}
            onClick={() => setRoute(r.path)}
            className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-widest transition-colors ${
              route === r.path
                ? "border-[#7b95e8] bg-[#7b95e8]/20 text-white"
                : "border-white/15 text-white/60 hover:bg-white/10"
            }`}
          >
            {r.label}
          </button>
        ))}
        <button
          onClick={() => setIframeKey((k) => k + 1)}
          title="Reload"
          className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] uppercase tracking-widest text-white/60 hover:bg-white/10"
        >
          ⟲
        </button>
      </div>

      {device === "mobile" ? (
        <div className="relative mx-auto" style={{ width: 280 }}>
          <div
            className="relative rounded-[38px] border-[6px] border-white/20 bg-black p-1 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            style={{ width: 280, height: 560 }}
          >
            <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-black" />
            <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-black">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-[#7b95e8]" />
                </div>
              )}
              <iframe
                key={iframeKey}
                src={src}
                onLoad={() => setLoading(false)}
                title={`${template.name} preview`}
                className="h-full w-full border-0"
                style={{ background: template.theme.background as string }}
              />
            </div>
            <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-white/40" />
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber-400/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
            <span className="ml-3 truncate text-[9px] text-white/40">localhost{route}</span>
          </div>
          <div className="relative" style={{ height: 360 }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-[#7b95e8]" />
              </div>
            )}
            <iframe
              key={iframeKey}
              src={src}
              onLoad={() => setLoading(false)}
              title={`${template.name} desktop preview`}
              className="border-0"
              style={{
                width: 1280,
                height: 800,
                transform: "scale(0.22)",
                transformOrigin: "top left",
                background: template.theme.background as string,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/60">
      {children}
    </span>
  );
}

type ImportRow = {
  label: string;
  field: keyof Business | "description" | "favicon" | "ogImage";
  raw: string;
  status: "filled" | "kept" | "missing";
  applied?: string;
};

function BusinessStep({ value, onChange }: { value: Business; onChange: (v: Business) => void }) {
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<{ source: string; rows: ImportRow[] } | null>(null);
  const [showImport, setShowImport] = useState(false);

  async function importFromSite() {
    if (!url.trim()) return;
    setImporting(true);
    setImportErr(null);
    setImportReport(null);
    try {
      const r = await fetch("/api/import-site", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setImportErr(d.error || "Could not import from that URL.");
        return;
      }

      const next: Business = { ...value };
      const rows: ImportRow[] = [];

      const title = d.title ? stripSiteSuffix(d.title) : "";
      rows.push(rowFor("Business name", "name", title, !!value.name, (v) => (next.name = v)));
      rows.push(rowFor("Phone", "phone", d.phone || "", !!value.phone, (v) => (next.phone = v)));
      rows.push(rowFor("Email", "email", d.email || "", !!value.email, (v) => (next.email = v)));
      rows.push(rowFor("Street address", "streetAddress", d.address || "", !!value.streetAddress, (v) => (next.streetAddress = v)));
      rows.push(rowFor("City", "city", d.city || "", !!value.city, (v) => (next.city = v)));
      rows.push(rowFor("Postal code", "postalCode", d.postal || "", !!value.postalCode, (v) => (next.postalCode = v)));
      rows.push(rowFor("Country", "country", d.country || "", value.country !== "GR", (v) => (next.country = v)));
      rows.push({ label: "Description", field: "description", raw: d.description || "", status: d.description ? "filled" : "missing" });
      rows.push({ label: "Favicon", field: "favicon", raw: d.favicon || "", status: d.favicon ? "filled" : "missing" });
      rows.push({ label: "OG image", field: "ogImage", raw: d.ogImage || "", status: d.ogImage ? "filled" : "missing" });

      onChange(next);
      setImportReport({ source: d.source, rows });
    } catch {
      setImportErr("Import failed.");
    } finally {
      setImporting(false);
    }
  }

  function rowFor(
    label: string,
    field: keyof Business,
    raw: string,
    alreadyHas: boolean,
    apply: (v: string) => void
  ): ImportRow {
    if (!raw) return { label, field, raw: "", status: "missing" };
    if (alreadyHas) return { label, field, raw, status: "kept" };
    apply(raw);
    return { label, field, raw, status: "filled", applied: raw };
  }

  function updateName(v: string) {
    const smartEmail = value.email || (v ? suggestedEmail(v) : "");
    onChange({ ...value, name: v, email: value.email ? value.email : smartEmail });
  }

  function updatePostal(v: string) {
    const match = lookupPostal(v);
    if (match && !value.city) {
      onChange({ ...value, postalCode: v, city: match.city, country: match.country });
    } else {
      onChange({ ...value, postalCode: v });
    }
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">Step 2 of 4</p>
      <h2 className="mt-2 font-serif text-3xl">Your business</h2>
      <p className="mt-2 text-sm text-white/55">This fills the contact page, JSON-LD schema, email templates, and footer. You can change any of it later.</p>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowImport((s) => !s)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
        >
          <span>{showImport ? "▾" : "▸"}</span>
          Optional · Import from existing site
          {importReport && <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-300">Imported</span>}
        </button>

        <AnimatePresence initial={false}>
          {showImport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-[#7b95e8]/30 bg-[#7b95e8]/5 p-4">
                <p className="text-xs text-white/60">Paste any URL and we'll fetch title, description, phone, email, and address from the HTML. Skip this if you're starting from scratch.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && importFromSite()}
                    placeholder="https://yourexistingsite.com"
                    className="flex-1 min-w-[260px] rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#7b95e8]/60"
                  />
                  <button
                    onClick={importFromSite}
                    disabled={importing || !url.trim()}
                    className="rounded-full bg-[#7b95e8] px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-black disabled:opacity-40"
                  >
                    {importing ? "Importing…" : "Import"}
                  </button>
                </div>
                {importErr && <p className="mt-2 text-xs text-red-300">{importErr}</p>}
                {importReport && <ImportReport report={importReport} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Business name *" value={value.name} onChange={updateName} placeholder="Your Salon" />
        <Field label="City *" value={value.city} onChange={(v) => onChange({ ...value, city: v })} placeholder="London" />
        <Field label="Street address" value={value.streetAddress} onChange={(v) => onChange({ ...value, streetAddress: v })} placeholder="47 Cranley Mews" />
        <Field label="Postal code (→ autofills city)" value={value.postalCode} onChange={updatePostal} placeholder="SW7 3BY" />
        <Field label="Country (ISO)" value={value.country} onChange={(v) => onChange({ ...value, country: v })} placeholder="GB" />
        <Field label="Phone" value={value.phone} onChange={(v) => onChange({ ...value, phone: v })} placeholder="+44 20 7946 0412" />
        <div className="sm:col-span-2">
          <Field label="Public email" value={value.email} onChange={(v) => onChange({ ...value, email: v })} placeholder="hello@yourdomain.com" />
          {value.name && (
            <p className="mt-1.5 text-[10px] text-white/40">
              Wordmark → <span className="text-[#7b95e8]">{wordmarkFrom(value.name)}</span> · slug → <span className="text-[#7b95e8]">/{slugify(value.name)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Timezone — mandatory. Booking slots, reminder sends, and the daily
          schedule all derive from this. Wrong zone = every slot off by hours. */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">Timezone *</p>
        <p className="mt-1 text-xs text-white/55">
          Every booking slot, reminder, and schedule view is rendered in this
          zone. Pick where the shop physically is — not where you are now.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={COMMON_TIMEZONES.some((t) => t.id === value.timezone) ? value.timezone : "__custom"}
            onChange={(e) => {
              const v = e.target.value;
              if (v !== "__custom") onChange({ ...value, timezone: v });
            }}
            className="flex-1 min-w-[220px] rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#c9a961]/60"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.id} value={tz.id} className="bg-[#0b0d13]">
                {tz.label} · {tz.id}
              </option>
            ))}
            <option value="__custom" className="bg-[#0b0d13]">Custom (type below)</option>
          </select>
          <input
            value={value.timezone}
            onChange={(e) => onChange({ ...value, timezone: e.target.value })}
            placeholder="Europe/London"
            className="flex-1 min-w-[180px] rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 outline-none focus:border-[#c9a961]/60"
          />
        </div>
      </div>

      {/* Opening hours — mandatory, at least one day open. The booking
          engine refuses slots outside these, so a blank schedule = a silent
          "bookings are closed forever" for the buyer. */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">Opening hours *</p>
        <p className="mt-1 text-xs text-white/55">
          Tick a day as closed to block bookings that day. Split hours (e.g. a
          midday break) are supported — hit &ldquo;+ split&rdquo; on any open day.
        </p>
        <div className="mt-4 divide-y divide-white/5">
          {value.hours.map((h, i) => (
            <HourRowEditor
              key={h.day}
              row={h}
              onChange={(next) => {
                const copy = [...value.hours];
                copy[i] = next;
                onChange({ ...value, hours: copy });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const DAY_LABELS: Record<HourRow["day"], string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
  fri: "Fri", sat: "Sat", sun: "Sun",
};

function HourRowEditor({ row, onChange }: { row: HourRow; onChange: (r: HourRow) => void }) {
  const hasSplit = !!(row.open2 && row.close2);
  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
      <div className="w-10 font-semibold text-white/80">{DAY_LABELS[row.day]}</div>
      <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/60">
        <input
          type="checkbox"
          checked={row.closed}
          onChange={(e) => onChange({ ...row, closed: e.target.checked })}
          className="h-3.5 w-3.5 accent-[#c9a961]"
        />
        Closed
      </label>
      {!row.closed && (
        <>
          <TimeInput value={row.open} onChange={(v) => onChange({ ...row, open: v })} />
          <span className="text-white/40">–</span>
          <TimeInput value={row.close} onChange={(v) => onChange({ ...row, close: v })} />
          {hasSplit ? (
            <>
              <span className="text-white/40">,</span>
              <TimeInput value={row.open2 || ""} onChange={(v) => onChange({ ...row, open2: v })} />
              <span className="text-white/40">–</span>
              <TimeInput value={row.close2 || ""} onChange={(v) => onChange({ ...row, close2: v })} />
              <button
                onClick={() => onChange({ ...row, open2: undefined, close2: undefined })}
                className="text-[10px] uppercase tracking-widest text-white/40 hover:text-red-300"
                title="Remove second window"
              >
                − split
              </button>
            </>
          ) : (
            <button
              onClick={() => onChange({ ...row, open2: "17:00", close2: "20:00" })}
              className="rounded-full border border-white/15 px-2.5 py-0.5 text-[9px] uppercase tracking-widest text-white/60 hover:bg-white/10"
            >
              + split
            </button>
          )}
        </>
      )}
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-24 rounded-md border border-white/15 bg-white/[0.04] px-2 py-1 font-mono text-xs text-white outline-none focus:border-[#c9a961]/60"
    />
  );
}

function stripSiteSuffix(title: string): string {
  return title.split(/[—|·\-:]/)[0].trim().slice(0, 80);
}

function ImportReport({ report }: { report: { source: string; rows: ImportRow[] } }) {
  const filled = report.rows.filter((r) => r.status === "filled").length;
  const kept = report.rows.filter((r) => r.status === "kept").length;
  const missing = report.rows.filter((r) => r.status === "missing").length;
  const host = (() => { try { return new URL(report.source).hostname; } catch { return report.source; } })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="text-xs text-white/80">
          Fetched <span className="font-mono text-[#7b95e8]">{host}</span>
        </div>
        <div className="flex gap-3 text-[10px] uppercase tracking-widest">
          <span className="text-emerald-300">✓ {filled} filled</span>
          <span className="text-white/60">⊘ {kept} kept</span>
          <span className="text-white/40">− {missing} missing</span>
        </div>
      </div>
      <ul className="divide-y divide-white/5">
        {report.rows.map((r) => (
          <li key={r.field} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 px-4 py-2 text-xs">
            <span className="text-white/55">{r.label}</span>
            <span className={`truncate font-mono ${r.status === "missing" ? "text-white/25" : "text-white/85"}`}>
              {r.status === "missing" ? "— not found in source" : r.raw}
            </span>
            <StatusBadge status={r.status} />
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-widest text-white/45">
        {filled > 0
          ? `Applied ${filled} field${filled === 1 ? "" : "s"} to the form below — edit anything as needed.`
          : "Nothing applied — review the form below manually."}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: ImportRow["status"] }) {
  if (status === "filled") {
    return (
      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-300">
        Applied
      </span>
    );
  }
  if (status === "kept") {
    return (
      <span className="rounded-full border border-white/20 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/60">
        Kept yours
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/35">
      Missing
    </span>
  );
}

function AdminStep({
  value, onChange, teammates, onTeammatesChange,
}: {
  value: Admin;
  onChange: (v: Admin) => void;
  teammates: string[];
  onTeammatesChange: (v: string[]) => void;
}) {
  const passMatch = !value.confirm || value.password === value.confirm;
  const passValid = value.password.length >= 8;
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newMate, setNewMate] = useState("");

  function generate() {
    const p = generatePassword();
    onChange({ ...value, password: p, confirm: p });
  }
  function copyPassword() {
    if (!value.password) return;
    navigator.clipboard?.writeText(value.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function addMate() {
    const e = newMate.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
    if (teammates.includes(e)) { setNewMate(""); return; }
    onTeammatesChange([...teammates, e]);
    setNewMate("");
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">Step 3 of 4</p>
      <h2 className="mt-2 font-serif text-3xl">Admin account</h2>
      <p className="mt-2 text-sm text-white/55">You'll use this to sign in at <code className="text-white/80">/admin</code> and manage everything.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Email *" value={value.email} onChange={(v) => onChange({ ...value, email: v })} placeholder="you@yourdomain.com" type="email" />
        <div className="flex items-end">
          <button
            onClick={generate}
            className="w-full rounded-xl border border-[#7b95e8]/40 bg-[#7b95e8]/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#c5d3ff] hover:bg-[#7b95e8]/20"
          >
            Generate strong password
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/50">Password *</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={value.password}
              onChange={(e) => onChange({ ...value, password: e.target.value })}
              placeholder="8+ characters"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 pr-24 text-sm text-white placeholder-white/30 outline-none focus:border-[#7b95e8]/60"
            />
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="rounded-full px-2 py-1 text-[9px] uppercase tracking-widest text-white/60 hover:bg-white/10"
              >
                {showPass ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={copyPassword}
                disabled={!value.password}
                className="rounded-full px-2 py-1 text-[9px] uppercase tracking-widest text-[#c5d3ff] hover:bg-[#7b95e8]/20 disabled:opacity-30"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <Field label="Confirm password *" value={value.confirm} onChange={(v) => onChange({ ...value, confirm: v })} placeholder="Repeat password" type={showPass ? "text" : "password"} />
      </div>

      <div className="mt-4 space-y-1 text-xs">
        <Check ok={passValid} label="At least 8 characters" />
        <Check ok={passMatch && !!value.confirm} label="Passwords match" />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#7b95e8]">Invite teammates (optional)</p>
          <p className="text-[10px] text-white/40">{teammates.length}/10</p>
        </div>
        <p className="text-xs text-white/55">Add staff emails now — they'll receive a password-set link on first login.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={newMate}
            onChange={(e) => setNewMate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMate())}
            placeholder="staff@yourdomain.com"
            className="flex-1 min-w-[240px] rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#7b95e8]/60"
          />
          <button
            onClick={addMate}
            disabled={teammates.length >= 10}
            className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-white/85 hover:bg-white/10 disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {teammates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {teammates.map((m) => (
              <span key={m} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-white/80">
                {m}
                <button
                  onClick={() => onTeammatesChange(teammates.filter((x) => x !== m))}
                  className="text-white/50 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <p className={ok ? "text-emerald-300" : "text-white/40"}>
      {ok ? "✓" : "○"} {label}
    </p>
  );
}

function ReviewStep({
  template, business, admin, teammates, installing, progress, error, onInstall,
}: {
  template: Template;
  business: Business;
  admin: Admin;
  teammates: string[];
  installing: boolean;
  progress: string[];
  error: string | null;
  onInstall: () => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">Step 4 of 4</p>
      <h2 className="mt-2 font-serif text-3xl">Review and install</h2>
      <p className="mt-2 text-sm text-white/55">Double-check, then we'll provision everything.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <ReviewCard title="Template">
          <div className="flex items-center gap-3">
            <img src={template.cover} alt="" className="h-14 w-24 rounded-lg border border-white/10 object-cover" />
            <div>
              <p className="font-serif text-lg">{template.name}</p>
              <p className="text-xs text-white/50">{template.industry}</p>
            </div>
          </div>
        </ReviewCard>
        <ReviewCard title="Business">
          <p className="font-serif text-lg">{business.name}</p>
          <p className="mt-1 text-xs text-white/60">
            {[business.streetAddress, business.postalCode, business.city, business.country]
              .filter(Boolean)
              .join(", ")}
          </p>
          {(business.phone || business.email) && (
            <p className="mt-1 text-xs text-white/50">
              {business.phone}{business.phone && business.email ? " · " : ""}{business.email}
            </p>
          )}
        </ReviewCard>
        <ReviewCard title="Admin login">
          <p className="font-mono text-sm">{admin.email}</p>
          <p className="mt-1 text-xs text-white/50">Sign in at /admin after install</p>
          {teammates.length > 0 && (
            <p className="mt-2 text-xs text-white/60">+ {teammates.length} teammate{teammates.length === 1 ? "" : "s"} invited</p>
          )}
        </ReviewCard>
        <ReviewCard title="Timezone">
          <p className="font-mono text-sm">{business.timezone}</p>
          <p className="mt-1 text-xs text-white/50">All booking slots & reminders rendered in this zone</p>
        </ReviewCard>
        <ReviewCard title="Opening hours">
          <ul className="space-y-0.5 text-xs text-white/75 font-mono">
            {business.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-3">
                <span className="uppercase text-white/50">{h.day}</span>
                <span>
                  {h.closed
                    ? "closed"
                    : `${h.open}–${h.close}${h.open2 && h.close2 ? `, ${h.open2}–${h.close2}` : ""}`}
                </span>
              </li>
            ))}
          </ul>
        </ReviewCard>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-end">
        <button
          onClick={onInstall}
          disabled={installing}
          className="rounded-full px-10 py-3 text-xs font-semibold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
          style={{ background: "#7b95e8" }}
        >
          {installing ? "Installing…" : "Install & launch →"}
        </button>
      </div>

      {installing && <InstallProgress events={progress} />}
    </div>
  );
}

function InstallProgress({ events }: { events: string[] }) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-xs text-white/70">
      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#7b95e8]">Install log</p>
      <ul className="space-y-1.5">
        {events.length === 0 ? (
          <li className="text-white/40">Starting…</li>
        ) : events.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{line}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-white/50">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#7b95e8]" />
          <span>Working…</span>
        </li>
      </ul>
    </div>
  );
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DoneStep({ business, template }: { business: Business; template: Template | null }) {
  const [qrSvg, setQrSvg] = useState<string>("");
  useEffect(() => {
    try {
      const origin = window.location.origin;
      setQrSvg(qrToSvg(origin + "/", 200, "#0a0e15", "#ffffff"));
    } catch {}
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-emerald-400/40 bg-emerald-500/5 p-8 sm:p-12 text-center"
    >
      <Confetti />
      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20 text-3xl">
          ✓
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-emerald-300">Atelier · Install complete</p>
        <h2 className="mt-2 font-serif text-4xl">You're live.</h2>
        <p className="mt-3 text-base text-white/70">
          {business.name} is running on the <strong>{template?.name}</strong> template, clean install. Add your services, staff, products and posts from the admin.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <a
                href="/"
                className="rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-widest text-black hover:opacity-90"
                style={{ background: "#7b95e8" }}
              >
                View your site →
              </a>
              <a
                href="/admin"
                className="rounded-full border border-white/30 px-8 py-3 text-xs uppercase tracking-widest text-white hover:bg-white/10"
              >
                Open admin →
              </a>
            </div>
            <p className="mt-4 text-xs text-white/50 sm:text-left">
              Scan the QR on your phone to view the site on mobile instantly.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="overflow-hidden rounded-xl border border-white/15 p-2"
              dangerouslySetInnerHTML={{ __html: qrSvg || "" }}
            />
            <p className="text-[9px] uppercase tracking-widest text-white/40">Your site</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  const colors = ["#7b95e8", "#c9a961", "#6aa0ff", "#e3c88a", "#5eb894"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 2 + Math.random() * 1.5;
        const rotate = Math.random() * 720 - 360;
        const color = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate }}
            transition={{ duration, delay, ease: "easeIn" }}
            className="absolute block h-2 w-1.5 rounded-sm"
            style={{ left: `${left}%`, top: 0, background: color }}
          />
        );
      })}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#c9a961]/60"
      />
    </div>
  );
}
