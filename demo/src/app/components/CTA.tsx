"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import EditPencil from "./EditPencil";

export default function CTA() {
  const { t, lang } = useLang();
  const c = useSection("cta", {
    eyebrow_en: t("cta.eyebrow"),
    eyebrow_el: t("cta.eyebrow"),
    title_en: t("cta.title"),
    title_el: t("cta.title"),
    subtitle_en: t("cta.subtitle"),
    subtitle_el: t("cta.subtitle"),
    bgImage:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=2000&q=80&auto=format&fit=crop",
  });
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  return (
    <section className="relative px-6 py-32">
      <EditPencil section="cta" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#c9a961]/30"
      >
        <Image
          src={c.bgImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0806] via-[#0a0806]/70 to-[#0a0806]/30" />

        <div className="relative px-8 py-20 sm:px-16 sm:py-24">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a961]">
            {pick(c.eyebrow_en, c.eyebrow_el)}
          </p>
          <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {pick(c.title_en, c.title_el)}
          </h2>
          <p className="mt-5 max-w-xl text-white/65">
            {pick(c.subtitle_en, c.subtitle_el)}
          </p>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-10 inline-block"
          >
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a961] px-8 py-4 text-sm font-semibold uppercase tracking-widest text-black"
            >
              {t("cta.book")}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
