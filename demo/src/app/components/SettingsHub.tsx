"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SettingsPanel from "./SettingsPanel";
import ThemePanel from "./ThemePanel";
import ServicesPanel from "./ServicesPanel";
import StaffPanel from "./StaffPanel";
import CouponsPanel from "./CouponsPanel";
import BlogPanel from "./BlogPanel";
import UsersPanel from "./UsersPanel";
import ToolsPanel from "./ToolsPanel";
import GiftCardsPanel from "./GiftCardsPanel";

type Me = { id: string; email: string; role: "admin" | "barber"; barberId?: string };

type Section =
  | "general"
  | "theme"
  | "services"
  | "staff"
  | "coupons"
  | "gifts"
  | "blog"
  | "users"
  | "tools";

// Order mirrors the launch checklist — setup first, staff + services next,
// then look-and-feel, then marketing, and finally admin-ops tools. The
// numeric prefix makes the flow obvious to new owners.
const SECTIONS: { id: Section; label: string; hint?: string }[] = [
  { id: "general", label: "1. Setup", hint: "Brand, business details, hours, email, analytics" },
  { id: "staff", label: "2. Staff", hint: "Add stylists and their weekly availability" },
  { id: "services", label: "3. Services", hint: "Menu, prices, duration, buffers, add-ons" },
  { id: "theme", label: "4. Theme", hint: "Colours and fonts" },
  { id: "coupons", label: "5. Coupons", hint: "Promo codes + referral rewards" },
  { id: "gifts", label: "6. Gift cards", hint: "Auto-issued codes, redeem at the till" },
  { id: "blog", label: "7. Blog", hint: "Journal articles and categories" },
  { id: "users", label: "8. Users", hint: "Invite admin / stylist accounts" },
  { id: "tools", label: "9. Tools", hint: "Backup, import, GDPR export" },
];

export default function SettingsHub({ me }: { me: Me }) {
  const [section, setSection] = useState<Section>("general");

  const current = SECTIONS.find((s) => s.id === section);
  return (
    <div>
      <div className="mb-3 flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur sm:inline-flex sm:whitespace-normal">
        {SECTIONS.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`relative isolate rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                active ? "text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="settings-sub-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-[#c9a961]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          );
        })}
      </div>

      {current?.hint && (
        <p className="mb-6 text-xs uppercase tracking-widest text-white/40">
          {current.hint}
        </p>
      )}

      {section === "general" && <SettingsPanel />}
      {section === "theme" && <ThemePanel />}
      {section === "services" && <ServicesPanel />}
      {section === "staff" && <StaffPanel />}
      {section === "coupons" && <CouponsPanel />}
      {section === "gifts" && <GiftCardsPanel />}
      {section === "blog" && <BlogPanel />}
      {section === "users" && <UsersPanel me={me} />}
      {section === "tools" && <ToolsPanel />}
    </div>
  );
}
