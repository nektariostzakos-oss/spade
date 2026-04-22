"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "../../lib/i18n";

/**
 * Minimal GDPR/CCPA-compliant cookie banner. Shown until the visitor picks
 * "Accept all" or "Essential only". Choice stored in localStorage; analytics
 * scripts (layout.tsx) are already guarded by consent via this flag so they
 * don't fire until the visitor opts in.
 */
const KEY = "oakline_cookie_consent_v1";

export type Consent = "all" | "essential" | null;

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [decided, setDecided] = useState<boolean | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    setDecided(getConsent() !== null);
  }, []);

  function choose(v: Consent) {
    try {
      if (v) window.localStorage.setItem(KEY, v);
    } catch {}
    setDecided(true);
    // Notify layout / analytics hooks that consent changed.
    window.dispatchEvent(new CustomEvent("oakline-consent-changed", { detail: v }));
  }

  if (decided === null || decided === true) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div
        className="mx-auto max-w-3xl rounded-2xl border p-5 shadow-2xl"
        style={{
          borderColor: "var(--border-strong)",
          background: "color-mix(in srgb, var(--background) 94%, transparent)",
          backdropFilter: "blur(14px)",
        }}
      >
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
          {lang === "el" ? "Cookies" : "Cookies"}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--foreground)" }}>
          {lang === "el"
            ? "Χρησιμοποιούμε cookies ουσιαστικά για τη λειτουργία και προαιρετικά για στατιστικά/αναλυτικά δεδομένα. Διάλεξε παρακάτω."
            : "We use essential cookies to run the site and (optionally) analytics cookies to understand traffic. Pick below."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => choose("all")}
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "var(--gold)", color: "var(--background)" }}
          >
            {lang === "el" ? "Αποδοχή όλων" : "Accept all"}
          </button>
          <button
            onClick={() => choose("essential")}
            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            {lang === "el" ? "Μόνο απαραίτητα" : "Essential only"}
          </button>
          <Link
            href="/privacy"
            className="ml-auto text-[11px] uppercase tracking-widest"
            style={{ color: "var(--muted-2)" }}
          >
            {lang === "el" ? "Πολιτική απορρήτου" : "Privacy policy"}
          </Link>
        </div>
      </div>
    </div>
  );
}
