"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import EditPencil from "./EditPencil";

type Q = { q_en: string; q_el: string; a_en: string; a_el: string };

export default function FAQ() {
  const { t, lang } = useLang();
  const c = useSection("faq", {
    eyebrow_en: t("faq.eyebrow"),
    eyebrow_el: t("faq.eyebrow"),
    title_en: t("faq.title"),
    title_el: t("faq.title"),
    items: [] as Q[],
  });
  const items: Q[] = (c.items as Q[]) ?? [];
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative px-6 py-32">
      <EditPencil section="faq" />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a961]">
            {pick(c.eyebrow_en, c.eyebrow_el)}
          </p>
          <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {pick(c.title_en, c.title_el)}
          </h2>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="font-serif text-xl text-white">
                    {pick(f.q_en, f.q_el)}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="text-2xl text-[#c9a961]"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-white/65">{pick(f.a_en, f.a_el)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
