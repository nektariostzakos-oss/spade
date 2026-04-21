"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";
import { useTheme } from "../../lib/theme";
import { useEditor } from "../../lib/editorClient";
import { useCart } from "../../lib/cartClient";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const { theme, toggle } = useTheme();
  const { isAdmin } = useEditor();
  const { count: cartCount } = useCart();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/services", label: t("nav.services") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/about", label: t("nav.team") },
    { href: "/contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl" : ""
      }`}
      style={{
        background: scrolled ? "var(--nav-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <SpadeMark />
          <div className="leading-none">
            <span
              className="block font-serif text-xl font-semibold tracking-wider"
              style={{ color: "var(--foreground)" }}
            >
              SPADE
            </span>
            <span
              className="hidden text-[10px] uppercase tracking-[0.3em] sm:block"
              style={{ color: "var(--gold)" }}
            >
              Barber · Loutraki
            </span>
          </div>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative px-4 py-2 text-sm uppercase tracking-widest transition-colors hover:opacity-100"
                  style={{
                    color: active ? "var(--foreground)" : "var(--muted)",
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{ background: "var(--surface-strong)" }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggle}
            aria-label="Toggle dark / light"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            {theme === "dark" ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </button>

          <div
            className="flex items-center gap-0.5 rounded-full border p-1 text-[11px] uppercase tracking-[0.2em] backdrop-blur"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface)",
            }}
          >
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "en" ? "font-semibold" : ""
              }`}
              style={{
                background: lang === "en" ? "var(--gold)" : "transparent",
                color: lang === "en" ? "#000" : "var(--muted)",
              }}
              aria-label="English"
            >
              EN
            </button>
            <button
              onClick={() => setLang("el")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "el" ? "font-semibold" : ""
              }`}
              style={{
                background: lang === "el" ? "var(--gold)" : "transparent",
                color: lang === "el" ? "#000" : "var(--muted)",
              }}
              aria-label="Ελληνικά"
            >
              EL
            </button>
          </div>
          <Link
            href="/cart"
            aria-label="Cart"
            title="Cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 999,
                  background: "var(--gold)",
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Admin dashboard"
              title="Admin dashboard"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: "var(--gold)",
                background: "var(--surface)",
                color: "var(--gold)",
              }}
            >
              <AdminIcon />
            </Link>
          )}
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gold)" }}
          >
            {t("nav.book")}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 999,
                  background: "var(--gold)",
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Admin"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border"
              style={{
                borderColor: "var(--gold)",
                background: "var(--surface)",
                color: "var(--gold)",
              }}
            >
              <AdminIcon />
            </Link>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle dark / light"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 0 : -3 }}
              className="absolute h-px w-5"
              style={{ background: "var(--foreground)" }}
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? 0 : 3 }}
              className="absolute h-px w-5"
              style={{ background: "var(--foreground)" }}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t md:hidden"
            style={{
              borderColor: "var(--border)",
              background: "var(--nav-bg)",
            }}
          >
            <ul className="flex flex-col p-4">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-lg px-4 py-3 text-base uppercase tracking-widest"
                    style={{
                      background:
                        pathname === l.href
                          ? "var(--surface-strong)"
                          : "transparent",
                      color:
                        pathname === l.href
                          ? "var(--foreground)"
                          : "var(--muted)",
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-widest"
                  style={{
                    borderColor: "var(--gold)",
                    color: "var(--gold)",
                  }}
                >
                  <AdminIcon /> Admin
                </Link>
              )}
              <Link
                href="/book"
                className="mt-2 block rounded-full px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest text-black"
                style={{ background: "var(--gold)" }}
              >
                {t("nav.book")}
              </Link>
              <div
                className="mt-3 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                style={{ color: "var(--muted-2)" }}
              >
                <button
                  onClick={() => setLang("en")}
                  className={lang === "en" ? "font-semibold" : ""}
                  style={{
                    color: lang === "en" ? "var(--gold)" : "inherit",
                  }}
                >
                  EN
                </button>
                <span>·</span>
                <button
                  onClick={() => setLang("el")}
                  className={lang === "el" ? "font-semibold" : ""}
                  style={{
                    color: lang === "el" ? "var(--gold)" : "inherit",
                  }}
                >
                  EL
                </button>
              </div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 15h3" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

function SpadeMark() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="15" stroke="#c9a961" strokeWidth="1.2" />
      <path
        d="M16 7c-3 4-7 6.5-7 11 0 2.5 2 4.5 4.5 4.5 1 0 2-.4 2.5-1.1V25h0V25h0c.5.7 1.5 1.1 2.5 1.1C21 26.1 23 24.1 23 21.5 23 17 19 14.5 16 7z"
        fill="#c9a961"
      />
    </svg>
  );
}
