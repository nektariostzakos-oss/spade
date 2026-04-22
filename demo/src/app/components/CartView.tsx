"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../lib/cartClient";
import { useLang } from "../../lib/i18n";

export default function CartView() {
  const { items, total, setQty, remove, clear } = useCart();
  const { t, lang } = useLang();
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal: "",
    notes: "",
    website: "", // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; gifts?: Array<{ code: string; amount: number }> } | null>(null);

  // Restore + persist form draft so a refresh mid-checkout doesn't wipe it.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("atelier_cart_draft_v1");
      if (raw) {
        const d = JSON.parse(raw) as Partial<typeof form>;
        setForm((f) => ({ ...f, ...d, website: "" }));
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      const { website: _website, ...persist } = form;
      window.localStorage.setItem("atelier_cart_draft_v1", JSON.stringify(persist));
    } catch {}
  }, [form]);

  async function checkout() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          id: i.id,
          name: pick(i.name_en, i.name_el),
          price: i.price,
          qty: i.qty,
        })),
        ...form,
        lang,
      }),
    });
    const d = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(d.error || "Order failed");
      return;
    }
    try { window.localStorage.removeItem("atelier_cart_draft_v1"); } catch {}
    clear();
    // Stripe configured? Bounce straight to hosted Checkout. Otherwise we
    // show the in-app "thanks, we'll contact you about payment" screen.
    if (typeof d.checkoutUrl === "string" && d.checkoutUrl) {
      window.location.href = d.checkoutUrl;
      return;
    }
    setDone({ id: d.order.id, gifts: Array.isArray(d.gifts) ? d.gifts : [] });
  }

  if (done) {
    return (
      <section className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl rounded-2xl border border-[#c9a961]/40 bg-[#c9a961]/5 p-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a961] text-2xl text-black">
            ✓
          </div>
          <h2 className="font-serif text-4xl font-semibold tracking-tight">
            {lang === "el" ? "Ευχαριστούμε!" : "Thank you!"}
          </h2>
          <p className="mt-3 text-white/65">
            {lang === "el"
              ? "Λάβαμε την παραγγελία σου. Θα επικοινωνήσουμε μαζί σου για την πληρωμή και την αποστολή."
              : "We received your order. We'll be in touch about payment and delivery."}
          </p>
          <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
            {lang === "el" ? "Κωδικός" : "Reference"} · {done.id}
          </p>

          {done.gifts && done.gifts.length > 0 && (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#c9a961]/40 bg-black/40 p-4 text-left">
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">
                {lang === "el" ? "Κωδικοί δωροεπιταγής" : "Gift card codes"}
              </p>
              <ul className="space-y-1.5 text-sm">
                {done.gifts.map((g, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <code className="rounded bg-white/5 px-2 py-1 font-mono text-[#c9a961]">{g.code}</code>
                    <span className="text-white/70">£{g.amount}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-white/50">
                {lang === "el"
                  ? "Φυλάξτε τον κωδικό — σας τον χρειάζονται στο ταμείο για εξαργύρωση."
                  : "Save the code — show it at the till to redeem in the chair."}
              </p>
            </div>
          )}
          <Link
            href="/shop"
            className="mt-10 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            {lang === "el" ? "Συνέχεια αγορών" : "Keep shopping"}
          </Link>
        </motion.div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="px-6 pb-32 text-center">
        <p className="mx-auto max-w-md text-white/55">
          {lang === "el"
            ? "Το καλάθι σου είναι άδειο."
            : "Your cart is empty."}
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c9a961] px-7 py-3 text-sm font-semibold uppercase tracking-widest text-black"
        >
          {lang === "el" ? "Στο κατάστημα" : "Go to shop"} →
        </Link>
      </section>
    );
  }

  return (
    <section className="px-6 pb-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="divide-y divide-white/10 border-y border-white/10">
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-3 py-5 sm:grid-cols-[80px_1fr_auto] sm:gap-4"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  <Image
                    src={it.image}
                    alt={pick(it.name_en, it.name_el)}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/shop/${it.slug}`}
                    className="font-serif text-lg hover:text-[#c9a961]"
                  >
                    {pick(it.name_en, it.name_el)}
                  </Link>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.03] p-1 text-sm">
                      <button
                        onClick={() => setQty(it.id, it.qty - 1)}
                        className="h-7 w-7 rounded-full hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{it.qty}</span>
                      <button
                        onClick={() => setQty(it.id, it.qty + 1)}
                        className="h-7 w-7 rounded-full hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(it.id)}
                      className="text-xs uppercase tracking-widest text-white/50 hover:text-red-300"
                    >
                      {lang === "el" ? "Αφαίρεση" : "Remove"}
                    </button>
                  </div>
                </div>
                <p className="font-serif text-lg text-[#c9a961]">
                  £{(it.price * it.qty).toFixed(2)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-serif text-2xl">
            {lang === "el" ? "Σύνοψη" : "Summary"}
          </h2>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/60">
              {lang === "el" ? "Υποσύνολο" : "Subtotal"}
            </span>
            <span className="font-serif text-xl text-[#c9a961]">
              £{total.toFixed(2)}
            </span>
          </div>
          <p className="mt-3 text-xs text-white/45">
            {lang === "el"
              ? "Τα μεταφορικά υπολογίζονται στην παράδοση."
              : "Shipping calculated at delivery."}
          </p>

          <h3 className="mt-6 mb-3 text-xs uppercase tracking-widest text-white/50">
            {lang === "el" ? "Στοιχεία παράδοσης" : "Delivery details"}
          </h3>
          <div className="grid gap-3">
            <Field label={lang === "el" ? "Ονοματεπώνυμο" : "Full name"} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label={lang === "el" ? "Τηλέφωνο" : "Phone"} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
            <Field label={lang === "el" ? "Διεύθυνση" : "Address"} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <Field label={lang === "el" ? "Πόλη" : "City"} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label={lang === "el" ? "Τ.Κ." : "Postal"} value={form.postal} onChange={(v) => setForm({ ...form, postal: v })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/45">
                {lang === "el" ? "Σημειώσεις" : "Notes"}
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
              />
            </div>
            {/* Honeypot */}
            <div style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            onClick={checkout}
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-[#c9a961] py-3 text-sm font-semibold uppercase tracking-widest text-black disabled:opacity-50"
          >
            {submitting
              ? lang === "el"
                ? "Αποστολή…"
                : "Placing order…"
              : lang === "el"
                ? "Ολοκλήρωση παραγγελίας"
                : "Place order"}
          </button>
          <p className="mt-3 text-xs text-white/45">
            {lang === "el"
              ? "Cash on delivery ή bank transfer — θα επικοινωνήσουμε για λεπτομέρειες."
              : "Cash on delivery or bank transfer — we'll be in touch to confirm."}
          </p>
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/45">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
      />
    </div>
  );
}
