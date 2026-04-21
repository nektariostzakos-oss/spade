"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import EditPencil from "./EditPencil";

const tags = [
  { id: "All", key: "filter.all" },
  { id: "Cuts", key: "filter.cuts" },
  { id: "Beards", key: "filter.beards" },
  { id: "Shop", key: "filter.shop" },
];

type Cell = { src: string; tag: string; big: boolean | string };

const DEFAULT: Cell[] = [
  { src: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1600&q=80&auto=format&fit=crop", tag: "Cuts", big: true },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&q=80&auto=format&fit=crop", tag: "Beards", big: false },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80&auto=format&fit=crop", tag: "Shop", big: false },
];

export default function GalleryGrid() {
  const { t } = useLang();
  const c = useSection("gallery", { items: DEFAULT });
  const all: Cell[] = (c.items as Cell[]) ?? DEFAULT;
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? all : all.filter((s) => s.tag === active);

  return (
    <section className="relative px-6 py-24">
      <EditPencil section="gallery" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-2"
        >
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActive(tag.id)}
              className={`relative rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-colors ${
                active === tag.id
                  ? "text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {active === tag.id && (
                <motion.span
                  layoutId="filter-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-0 -z-10 rounded-full bg-[#c9a961]"
                />
              )}
              {t(tag.key)}
            </button>
          ))}
        </motion.div>

        <div className="grid auto-rows-[16rem] gap-4 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const big =
              p.big === true ||
              p.big === "true" ||
              String(p.big).toLowerCase() === "true";
            return (
              <motion.div
                key={p.src + i}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 ${
                  big ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 rounded-full bg-[#0a0806]/70 px-3 py-1 text-[10px] uppercase tracking-widest text-[#c9a961] opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100">
                  {p.tag}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
