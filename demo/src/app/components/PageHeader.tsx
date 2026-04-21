"use client";

import { motion } from "framer-motion";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-44">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-10 h-96 w-[60rem] max-w-[140%] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[160px]" />
      </div>
      <div className="mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--muted-2)" }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg"
            style={{ color: "var(--muted)" }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
