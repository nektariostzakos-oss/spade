"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";
import type { Product } from "../../lib/products";

export default function ShopPreview() {
  const { lang, t } = useLang();
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const all: Product[] = d.products ?? [];
        const featured = all.filter((p) => p.featured);
        const rest = all.filter((p) => !p.featured);
        setItems([...featured, ...rest].slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex items-end justify-between gap-6"
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a961]">
              {lang === "el" ? "Καταστημα" : "Shop"}
            </p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {lang === "el"
                ? "Τα αγαπημένα μας."
                : "Our regulars."}
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-widest text-white/80 transition-colors hover:bg-white/10 sm:inline-block"
          >
            {lang === "el" ? "Όλα τα προϊόντα →" : "All products →"}
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link
                href={`/shop/${p.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[#c9a961]/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={pick(p.name_en, p.name_el)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl text-white transition-colors group-hover:text-[#c9a961]">
                    {pick(p.name_en, p.name_el)}
                  </h3>
                  <p className="mt-3 font-serif text-2xl text-[#c9a961]">
                    €{p.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
