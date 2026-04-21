"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";

type Post = {
  id: string;
  slug: string;
  title_en: string;
  title_el: string;
  excerpt_en: string;
  excerpt_el: string;
  image: string;
  category: string;
  tags: string[];
  publishedAt: string;
};

export default function BlogList({ posts }: { posts: Post[] }) {
  const { lang } = useLang();
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) if (p.category) set.add(p.category);
    return ["All", ...Array.from(set).sort()];
  }, [posts]);

  const [active, setActive] = useState("All");
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">Journal</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
            {lang === "el" ? "Ιστορίες & Συμβουλές" : "Stories & Tips"}
          </h1>
        </div>

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
                active === cat ? "text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {active === cat && (
                <motion.span
                  layoutId="blog-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-[#c9a961]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </motion.div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-white/40">
            {lang === "el" ? "Δεν υπάρχουν δημοσιεύσεις ακόμη." : "No posts yet."}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[#c9a961]/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#14110d]">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={pick(p.title_en, p.title_el)}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-widest text-[#c9a961]">
                      {p.category || "General"}
                    </p>
                    <h3 className="mt-2 font-serif text-xl text-white transition-colors group-hover:text-[#c9a961]">
                      {pick(p.title_en, p.title_el)}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-white/55">
                      {pick(p.excerpt_en, p.excerpt_el)}
                    </p>
                    <p className="mt-4 text-[10px] uppercase tracking-widest text-white/40">
                      {new Date(p.publishedAt).toLocaleDateString(lang === "el" ? "el-GR" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
