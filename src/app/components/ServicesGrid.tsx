"use client";

import { motion } from "framer-motion";

const services = [
  {
    n: "01",
    title: "Brand & Identity",
    desc: "Strategy, naming, visual identity, motion, and the system that holds it together — from new ventures to category-defining rebrands.",
    items: [
      "Brand strategy & positioning",
      "Visual identity systems",
      "Motion identity",
      "Guidelines & rollout",
    ],
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    n: "02",
    title: "Product & Interface",
    desc: "From zero-to-one product design to mature design systems and engineering. We pair tight design with shippable code.",
    items: [
      "Product strategy & UX",
      "UI design & systems",
      "Interaction & motion",
      "Frontend engineering",
    ],
    accent: "from-indigo-500 to-blue-500",
  },
  {
    n: "03",
    title: "Web & Marketing",
    desc: "High-performing marketing sites, landing pages, and microsites engineered for speed, motion, and conversion.",
    items: [
      "Site strategy & content",
      "Design & art direction",
      "Headless engineering",
      "CMS & analytics setup",
    ],
    accent: "from-cyan-500 to-emerald-500",
  },
];

export default function ServicesGrid() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-6">
        {services.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.7,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur"
          >
            <div
              className={`absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gradient-to-br ${s.accent} opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
            />
            <div className="relative grid gap-8 lg:grid-cols-[120px_1fr_1fr] lg:items-start">
              <p className="text-sm tracking-widest text-white/30">{s.n}</p>
              <div>
                <h3 className="text-3xl font-semibold sm:text-4xl">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-md text-white/60">{s.desc}</p>
              </div>
              <ul className="space-y-2">
                {s.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-center gap-3 text-sm text-white/75"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
