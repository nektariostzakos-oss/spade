"use client";

import { useState } from "react";
import type { ChecklistItem } from "../../lib/launchChecklist";

export default function LaunchChecklist({
  items,
  doneCount,
  totalRequired,
}: {
  items: ChecklistItem[];
  doneCount: number;
  totalRequired: number;
}) {
  const [open, setOpen] = useState(doneCount < totalRequired);
  const complete = doneCount === totalRequired;
  const pct = Math.round((doneCount / Math.max(totalRequired, 1)) * 100);

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: complete
          ? "color-mix(in srgb, #22c55e 40%, transparent)"
          : "color-mix(in srgb, #c9a961 40%, transparent)",
        background: complete
          ? "color-mix(in srgb, #22c55e 8%, transparent)"
          : "color-mix(in srgb, #c9a961 6%, transparent)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#c9a961" }}>
            Launch checklist
          </p>
          <p className="mt-1 font-serif text-lg text-white">
            {complete ? "Ready to go live ✓" : `${doneCount} of ${totalRequired} steps done`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden w-24 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: complete ? "#22c55e" : "#c9a961",
                }}
              />
            </div>
          </div>
          <span className="text-white/60">{open ? "–" : "+"}</span>
        </div>
      </button>

      {open && (
        <ul className="divide-y divide-white/5 border-t border-white/10">
          {items.map((item) => (
            <li key={item.key} className="px-5 py-3">
              <a href={item.href} className="flex items-start gap-3 hover:text-[color:#c9a961]">
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    item.done
                      ? "bg-emerald-500/20 text-emerald-300"
                      : item.optional
                        ? "bg-white/10 text-white/40"
                        : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {item.done ? "✓" : item.optional ? "◯" : "!"}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                      {item.section}
                    </span>
                    <span className={item.done ? "text-white/70 line-through" : "text-white"}>
                      {item.label}
                    </span>
                    {item.optional && !item.done && (
                      <span className="text-[9px] uppercase tracking-widest text-white/40">
                        (optional)
                      </span>
                    )}
                  </div>
                  {!item.done && item.hint && (
                    <p className="mt-1 text-xs text-white/50">{item.hint}</p>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
