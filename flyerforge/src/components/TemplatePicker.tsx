"use client";

import { cn } from "@/lib/utils";
import type { TemplateId } from "@/templates";

export type { TemplateId } from "@/templates";

type TemplateMeta = {
  id: TemplateId;
  label: string;
  tagline: string;
  swatch: string;
};

export const TEMPLATE_META: TemplateMeta[] = [
  {
    id: "club-night",
    label: "Club Night",
    tagline: "Gold on black. Late-night heat.",
    swatch: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 60%, #c4a96a 100%)",
  },
  {
    id: "live-stage",
    label: "Live Stage",
    tagline: "Editorial. Photo on top, cream below.",
    swatch:
      "linear-gradient(180deg, #2a2a2a 0%, #2a2a2a 55%, #f5f0e8 55%, #f5f0e8 100%)",
  },
  {
    id: "afternoon-party",
    label: "Afternoon Party",
    tagline: "Bright, playful, coral and peach.",
    swatch: "linear-gradient(135deg, #ffd1a3 0%, #ff6f61 100%)",
  },
  {
    id: "minimal-editorial",
    label: "Minimal Editorial",
    tagline: "Paper. Serif. Quiet confidence.",
    swatch:
      "linear-gradient(180deg, #faf7f2 0%, #faf7f2 55%, #1a1a1a 55%, #1a1a1a 100%)",
  },
  {
    id: "festival-burst",
    label: "Festival Burst",
    tagline: "Rainbow gradient. Loud and joyful.",
    swatch:
      "linear-gradient(135deg, #ff3b6b 0%, #ff8a3d 45%, #ffd23d 100%)",
  },
  {
    id: "corporate-launch",
    label: "Corporate Launch",
    tagline: "White + blue accent. Clean, confident.",
    swatch:
      "linear-gradient(90deg, #ffffff 0%, #ffffff 55%, #2b5cff 55%, #2b5cff 100%)",
  },
];

type Props = {
  value: TemplateId;
  onChange: (next: TemplateId) => void;
};

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TEMPLATE_META.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all",
              selected
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:border-muted-foreground",
            )}
          >
            <div className="h-20 w-full" style={{ background: t.swatch }} />
            <div className="p-3">
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.tagline}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
