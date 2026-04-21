"use client";

import { motion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import EditPencil from "./EditPencil";

type Quote = {
  quote_en: string;
  quote_el: string;
  name: string;
  role_en: string;
  role_el: string;
  source?: string; // e.g. "Google Reviews", "Verified customer"
  date?: string;   // ISO date or free-form "March 2026"
};

export default function Testimonials() {
  const { t, lang } = useLang();
  const c = useSection("testimonials", {
    eyebrow_en: t("testimonials.eyebrow"),
    eyebrow_el: t("testimonials.eyebrow"),
    title_en: t("testimonials.title"),
    title_el: t("testimonials.title"),
    items: [
      { quote_en: t("tt1.q"), quote_el: t("tt1.q"), name: "George M.", role_en: t("tt1.r"), role_el: t("tt1.r") },
      { quote_en: t("tt2.q"), quote_el: t("tt2.q"), name: "Sophia K.", role_en: t("tt2.r"), role_el: t("tt2.r") },
      { quote_en: t("tt3.q"), quote_el: t("tt3.q"), name: "Daniel L.", role_en: t("tt3.r"), role_el: t("tt3.r") },
    ] as Quote[],
  });
  const items: Quote[] = (c.items as Quote[]) ?? [];
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  return (
    <section className="relative px-6 py-32">
      <EditPencil section="testimonials" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-2xl"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a961]">
            {pick(c.eyebrow_en, c.eyebrow_el)}
          </p>
          <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {pick(c.title_en, c.title_el)}
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
            >
              <p className="mb-4 text-[#c9a961]">★★★★★</p>
              <blockquote className="font-serif text-lg leading-relaxed text-white/85">
                &ldquo;{pick(it.quote_en, it.quote_el)}&rdquo;
              </blockquote>
              <figcaption className="mt-8">
                <p className="text-sm font-medium">{it.name}</p>
                <p className="text-xs text-white/50">
                  {pick(it.role_en, it.role_el)}
                </p>
                {(it.source || it.date) && (
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-white/40">
                    {[it.source, it.date].filter(Boolean).join(" · ")}
                  </p>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
