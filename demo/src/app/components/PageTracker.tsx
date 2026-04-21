"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function sid(): string {
  try {
    const k = "spade_sid";
    let s = localStorage.getItem(k);
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(k, s);
    }
    return s;
  } catch {
    return "";
  }
}

export default function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/setup")) return;
    const payload = JSON.stringify({
      path: pathname,
      ref: document.referrer || "",
      lang: document.documentElement.lang || navigator.language || "",
      sid: sid(),
    });
    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", blob);
        return;
      }
    } catch {}
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
