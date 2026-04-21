"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import EditPencil from "./EditPencil";

type Block = {
  label_en: string;
  label_el: string;
  value_en: string;
  value_el: string;
};

export default function ContactInfo() {
  const { t, lang } = useLang();
  const c = useSection("contact", {
    image:
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=1400&q=80&auto=format&fit=crop",
    blocks: [] as Block[],
  });
  const blocks: Block[] = (c.blocks as Block[]) ?? [];
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  return (
    <section className="relative px-6 pb-32">
      <EditPencil section="contact" />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-10">
          {blocks.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#c9a961]">
                {pick(b.label_en, b.label_el)}
              </p>
              <p className="whitespace-pre-line font-serif text-2xl text-white">
                {pick(b.value_en, b.value_el)}
              </p>
            </motion.div>
          ))}

          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full bg-[#c9a961] px-7 py-3 text-sm font-semibold uppercase tracking-widest text-black"
          >
            {t("cta.book")}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
        >
          <Image
            src={c.image}
            alt="Spade shop front"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
