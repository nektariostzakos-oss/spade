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

type Me = { id: string; email: string; role: "admin" | "barber"; barberId?: string };

type Section =
  | "general"
  | "theme"
  | "services"
  | "staff"
  | "coupons"
  | "blog"
  | "users"
  | "tools";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "general", label: "General" },
  { id: "theme", label: "Theme" },
  { id: "services", label: "Services" },
  { id: "staff", label: "Staff" },
  { id: "coupons", label: "Coupons" },
  { id: "blog", label: "Blog" },
  { id: "users", label: "Users" },
  { id: "tools", label: "Tools" },
];

export default function SettingsHub({ me }: { me: Me }) {
  const [section, setSection] = useState<Section>("general");

  return (
    <div>
      <div className="mb-6 flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur sm:inline-flex sm:whitespace-normal">
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

      {section === "general" && <SettingsPanel />}
      {section === "theme" && <ThemePanel />}
      {section === "services" && <ServicesPanel />}
      {section === "staff" && <StaffPanel />}
      {section === "coupons" && <CouponsPanel />}
      {section === "blog" && <BlogPanel />}
      {section === "users" && <UsersPanel me={me} />}
      {section === "tools" && <ToolsPanel />}
    </div>
  );
}
