"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { useCart } from "../../lib/cartClient";
import type { Product } from "../../lib/products";

export default function ProductDetail({ product }: { product: Product }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <section className="px-6 pb-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <Link
          href="/shop"
          className="col-span-full text-xs uppercase tracking-widest text-white/60 hover:text-white"
        >
          ← {lang === "el" ? "Πίσω στο κατάστημα" : "Back to shop"}
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
        >
          <Image
            src={product.image}
            alt={pick(product.name_en, product.name_el)}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]">
            {pick(product.category_en, product.category_el)}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {pick(product.name_en, product.name_el)}
          </h1>
          <p className="mt-5 text-lg text-white/70">
            {pick(product.shortDesc_en, product.shortDesc_el)}
          </p>
          <p className="mt-6 font-serif text-5xl text-[var(--gold)]">
            £{product.price}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10"
              >
                −
              </button>
              <span className="w-6 text-center font-serif text-lg">{qty}</span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(product.stock, q + 1))
                }
                disabled={qty >= product.stock}
                className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30"
              >
                +
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-black disabled:opacity-40"
            >
              {added
                ? lang === "el"
                  ? "Προστέθηκε ✓"
                  : "Added ✓"
                : product.stock === 0
                  ? lang === "el"
                    ? "Εξαντλημένο"
                    : "Sold out"
                  : lang === "el"
                    ? "Στο καλάθι"
                    : "Add to cart"}
            </button>
          </div>

          <p className="mt-4 text-xs uppercase tracking-widest text-white/45">
            {product.stock > 0
              ? lang === "el"
                ? `${product.stock} σε απόθεμα`
                : `${product.stock} in stock`
              : ""}
          </p>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="whitespace-pre-line text-white/70">
              {pick(product.longDesc_en, product.longDesc_el)}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
