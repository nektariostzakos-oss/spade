"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";
import type { Product } from "../../lib/products";

export default function ShopGrid({ products }: { products: Product[] }) {
  const { lang, t } = useLang();
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      set.add(pick(p.category_en, p.category_el));
    }
    return ["All", ...Array.from(set)];
  }, [products, lang]);

  const [active, setActive] = useState("All");
  const filtered = active === "All"
    ? products
    : products.filter((p) => pick(p.category_en, p.category_el) === active);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative isolate rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-colors ${
                active === cat
                  ? "text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {active === cat && (
                <motion.span
                  layoutId="shop-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-[#c9a961]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat === "All" ? t("filter.all") : cat}</span>
            </button>
          ))}
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
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
                  {p.stock === 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-red-500/80 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
                      {lang === "el" ? "Εξαντλημένο" : "Sold out"}
                    </span>
                  )}
                  {p.featured && p.stock > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#c9a961] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-black">
                      {lang === "el" ? "Προτεινόμενο" : "Featured"}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-[#c9a961]">
                    {pick(p.category_en, p.category_el)}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-white transition-colors group-hover:text-[#c9a961]">
                    {pick(p.name_en, p.name_el)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/55">
                    {pick(p.shortDesc_en, p.shortDesc_el)}
                  </p>
                  <p className="mt-4 font-serif text-2xl text-[#c9a961]">
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
