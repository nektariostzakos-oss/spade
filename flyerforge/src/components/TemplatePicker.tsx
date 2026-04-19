"use client";

import { cn } from "@/lib/utils";

export type TemplateId = "club-night" | "live-stage" | "afternoon-party";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  tagline: string;
  swatch: string;
}[] = [
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
];

type Props = {
  value: TemplateId;
  onChange: (next: TemplateId) => void;
};

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {TEMPLATES.map((t) => {
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
            <div className="h-24 w-full" style={{ background: t.swatch }} />
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
