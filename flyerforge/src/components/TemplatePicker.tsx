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
    label: "Noir",
    tagline: "Cinematic B&W, Playfair, oxblood hairlines.",
    swatch: "linear-gradient(180deg, #0e0d0c 0%, #2b1513 70%, #7A1E1E 100%)",
  },
  {
    id: "live-stage",
    label: "Brutalist",
    tagline: "Concrete grays, Anton, sliced strips.",
    swatch:
      "linear-gradient(180deg, #d9d4cb 0%, #d9d4cb 55%, #0a0a0a 55%, #0a0a0a 80%, #ff2d16 80%, #ff2d16 100%)",
  },
  {
    id: "afternoon-party",
    label: "Memphis",
    tagline: "Cream field, tomato circle, stacked type.",
    swatch:
      "radial-gradient(circle at 35% 40%, #e8502a 0%, #e8502a 40%, #f4e6c3 41%, #f4e6c3 100%)",
  },
  {
    id: "minimal-editorial",
    label: "Editorial",
    tagline: "Newsprint cream, Playfair, hairline rules.",
    swatch:
      "linear-gradient(180deg, #f6f1e7 0%, #f6f1e7 55%, #141413 56%, #141413 58%, #f6f1e7 59%, #f6f1e7 100%)",
  },
  {
    id: "festival-burst",
    label: "Duotone",
    tagline: "Saville-grade single-color photographic.",
    swatch:
      "linear-gradient(135deg, #0b0b0b 0%, #ff3b6b 100%)",
  },
  {
    id: "corporate-launch",
    label: "Swiss Grid",
    tagline: "Helvetica-clean, red accent block, 12 col.",
    swatch:
      "linear-gradient(90deg, #fbfaf7 0%, #fbfaf7 55%, #d7281d 55%, #d7281d 75%, #fbfaf7 75%, #fbfaf7 100%)",
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
