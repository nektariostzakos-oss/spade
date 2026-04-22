"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import { SERVICES } from "../../lib/services";
import EditPencil from "./EditPencil";

type Svc = {
  id: string;
  price: number;
  duration: number;
  name_en: string;
  name_el: string;
  desc_en: string;
  desc_el: string;
};

export default function ServicesPreview() {
  const { t, lang } = useLang();
  const c = useSection("services", {
    eyebrow_en: t("services.eyebrow"),
    eyebrow_el: t("services.eyebrow"),
    title_en: t("services.title"),
    title_el: t("services.title"),
    items: SERVICES.map((s) => ({
      id: s.id,
      price: s.price,
      duration: s.duration,
      name_en: t(`${s.tkey}.name`),
      name_el: t(`${s.tkey}.name`),
      desc_en: t(`${s.tkey}.desc`),
      desc_el: t(`${s.tkey}.desc`),
    })) as Svc[],
  });
  const items: Svc[] = ((c.items as Svc[]) ?? []).slice(0, 6);
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  return (
    <section className="relative px-6 py-32">
      <EditPencil section="services" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex items-end justify-between gap-6"
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a961]">
              {pick(c.eyebrow_en, c.eyebrow_el)}
            </p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {pick(c.title_en, c.title_el)}
            </h2>
          </div>
          <Link
            href="/services"
            className="hidden rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-widest text-white/80 transition-colors hover:bg-white/10 sm:inline-block"
          >
            {t("cta.full_menu")}
          </Link>
        </motion.div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {items.map((s, i) => (
            <motion.div
              key={s.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group grid grid-cols-[1fr_auto] items-center gap-6 py-8 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1fr_auto_auto] sm:gap-12"
            >
              <div>
                <h3 className="font-serif text-2xl text-white transition-colors group-hover:text-[#c9a961]">
                  {pick(s.name_en, s.name_el)}
                </h3>
                <p className="mt-1 max-w-md text-sm text-white/55">
                  {pick(s.desc_en, s.desc_el)}
                </p>
              </div>
              <p className="hidden text-sm uppercase tracking-widest text-white/40 sm:block">
                {s.duration} {t("minutes")}
              </p>
              <p className="font-serif text-2xl text-[#c9a961]">£{s.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
