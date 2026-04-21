"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { useSection } from "../../lib/editorClient";
import EditPencil from "./EditPencil";

export default function Footer() {
  const pathname = usePathname();
  const { t, lang } = useLang();
  const f = useSection("footer", {
    lede_en: t("footer.lede"),
    lede_el: t("footer.lede"),
    cta_en: t("footer.cta"),
    cta_el: t("footer.cta"),
    copy_en: t("footer.copy"),
    copy_el: t("footer.copy"),
    tagline_en: t("sharp_since"),
    tagline_el: t("sharp_since"),
  });
  const pick = (en: string, el: string) => (lang === "el" ? el || en : en);
  if (pathname.startsWith("/admin")) return null;

  const cols = [
    {
      title: t("footer.shop"),
      items: [
        { label: t("nav.services"), href: "/services" },
        { label: t("nav.gallery"), href: "/gallery" },
        { label: t("nav.team"), href: "/about" },
        { label: t("nav.book"), href: "/book" },
      ],
    },
    {
      title: t("footer.visit"),
      items:
        lang === "el"
          ? [
              { label: "Ελ. Βενιζέλου 37", href: "#" },
              { label: "Λουτράκι 20300", href: "#" },
              { label: "Δευ–Σαβ · 09:00–21:00", href: "#" },
              { label: "Κυριακή · Κλειστά", href: "#" },
            ]
          : [
              { label: "El. Venizelou 37", href: "#" },
              { label: "Loutraki 20300", href: "#" },
              { label: "Mon–Sat · 09:00–21:00", href: "#" },
              { label: "Sunday · Closed", href: "#" },
            ],
    },
    {
      title: t("footer.contact"),
      items: [
        { label: "+30 694 532 5780", href: "tel:+306945325780" },
        { label: "hello@spade.gr", href: "mailto:hello@spade.gr" },
        { label: "Instagram", href: "#" },
        { label: "Facebook", href: "#" },
      ],
    },
  ];

  return (
    <footer
      className="relative mt-32 border-t px-6 py-20"
      style={{
        borderColor: "var(--border)",
        background: "var(--background)",
      }}
    >
      <EditPencil section="footer" />
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="leading-none">
              <span
                className="block font-serif text-2xl font-semibold tracking-wider"
                style={{ color: "var(--foreground)" }}
              >
                SPADE
              </span>
              <span
                className="block text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "var(--gold)" }}
              >
                Barber · {lang === "el" ? "Λουτρακι" : "Loutraki"}
              </span>
            </div>
          </Link>
          <p
            className="mt-5 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {pick(f.lede_en, f.lede_el)}
          </p>

          <Link
            href="/book"
            className="mt-12 inline-block group"
            aria-label={t("nav.book")}
          >
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-serif text-5xl font-semibold tracking-tight transition-all duration-300 sm:text-6xl"
              style={{ color: "var(--gold)" }}
            >
              {pick(f.cta_en, f.cta_el)}{" "}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </motion.h3>
          </Link>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p
              className="mb-5 text-xs uppercase tracking-widest"
              style={{ color: "var(--gold)" }}
            >
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.items.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted-2)",
        }}
      >
        <p>{pick(f.copy_en, f.copy_el)}</p>
        <p>
          {lang === "el" ? "Σχεδιασμός " : "Designed by "}
          <a
            href="https://mindscrollers.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: "var(--gold)" }}
          >
            Mindscrollers LLC
          </a>
        </p>
        <p>{pick(f.tagline_en, f.tagline_el)}</p>
      </div>
    </footer>
  );
}
