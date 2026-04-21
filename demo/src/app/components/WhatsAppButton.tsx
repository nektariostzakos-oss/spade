"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { useBusiness } from "../../lib/businessClient";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const { lang } = useLang();
  const { business } = useBusiness();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/setup")) return null;

  const raw = (business.social?.whatsapp || business.phone || "").replace(/[^\d+]/g, "");
  if (!raw) return null;
  const number = raw.startsWith("+") ? raw.slice(1) : raw;

  const message = lang === "el"
    ? `Γεια σας, θα ήθελα να κλείσω ραντεβού στο ${business.name || ""}.`
    : `Hi, I'd like to book at ${business.name || ""}.`;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp us"
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed z-40 inline-flex h-14 w-14 items-center justify-center rounded-full sm:h-15 sm:w-15"
      style={{
        right: "1.25rem",
        bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
        background: "#25D366",
        boxShadow: "0 18px 40px -10px rgba(37, 211, 102, 0.55), 0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      {/* WhatsApp glyph */}
      <svg width="26" height="26" viewBox="0 0 32 32" fill="white" aria-hidden>
        <path d="M16.001 4C9.373 4 4 9.373 4 16c0 2.117.553 4.181 1.602 5.998L4 28l6.179-1.575A11.96 11.96 0 0 0 16 28c6.628 0 12-5.373 12-12S22.629 4 16.001 4zm0 21.818a9.78 9.78 0 0 1-4.987-1.366l-.357-.213-3.668.935.978-3.572-.234-.367A9.79 9.79 0 0 1 6.182 16c0-5.413 4.405-9.818 9.819-9.818 2.622 0 5.085 1.022 6.94 2.877a9.755 9.755 0 0 1 2.878 6.941c-.001 5.414-4.405 9.818-9.818 9.818zm5.39-7.355c-.296-.148-1.751-.864-2.022-.964-.272-.099-.469-.148-.665.149-.197.296-.762.964-.934 1.16-.172.198-.345.223-.64.075-.297-.149-1.252-.46-2.385-1.471-.881-.787-1.476-1.76-1.65-2.057-.172-.296-.018-.456.13-.604.133-.133.297-.346.445-.519.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.519-.074-.149-.665-1.605-.911-2.198-.241-.575-.485-.497-.665-.506l-.566-.011a1.087 1.087 0 0 0-.79.371c-.272.296-1.037 1.013-1.037 2.469s1.061 2.864 1.21 3.062c.149.198 2.087 3.187 5.061 4.469.708.305 1.26.487 1.69.625.71.226 1.355.193 1.866.117.57-.085 1.751-.716 1.999-1.408.247-.694.247-1.288.173-1.412-.074-.124-.272-.198-.569-.347z"/>
      </svg>
    </motion.a>
  );
}
