"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import type { Product } from "../../lib/products";

export default function MenuList({ products }: { products: Product[] }) {
  const { lang } = useLang();
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  // Group by category, preserve first-seen order
  const order: string[] = [];
  const byCat = new Map<string, Product[]>();
  for (const p of products) {
    const cat = pick(p.category_en, p.category_el);
    if (!byCat.has(cat)) {
      byCat.set(cat, []);
      order.push(cat);
    }
    byCat.get(cat)!.push(p);
  }

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl space-y-16">
        {order.map((cat, ci) => {
          const items = byCat.get(cat) ?? [];
          return (
            <motion.section
              key={cat}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: ci * 0.04 }}
            >
              <header className="mb-8 flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--gold)" }}>
                    Course {ci + 1}
                  </p>
                  <h2 className="mt-2 font-serif text-4xl">{cat}</h2>
                </div>
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {items.length} dish{items.length === 1 ? "" : "es"}
                </span>
              </header>

              <div className="space-y-5">
                {items.map((p, i) => (
                  <motion.article
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      href={`/shop/${p.slug}`}
                      className="group grid grid-cols-[80px_1fr_auto] items-center gap-5 rounded-xl border p-4 transition-colors hover:border-[var(--gold)]/50"
                      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg" style={{ background: "var(--surface-strong)" }}>
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={pick(p.name_en, p.name_el)}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-3 border-b pb-1" style={{ borderColor: "var(--border)" }}>
                          <h3 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>
                            {pick(p.name_en, p.name_el)}
                          </h3>
                          <span className="flex-1 border-b border-dotted" style={{ borderColor: "var(--border-strong)" }} />
                          <span className="font-serif text-xl" style={{ color: "var(--gold)" }}>
                            €{p.price}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>
                          {pick(p.shortDesc_en, p.shortDesc_el)}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: "var(--gold)" }}
                      >
                        →
                      </span>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          );
        })}

        {order.length === 0 && (
          <p className="py-20 text-center" style={{ color: "var(--muted-2)" }}>
            The menu is being set.
          </p>
        )}
      </div>
    </section>
  );
}
