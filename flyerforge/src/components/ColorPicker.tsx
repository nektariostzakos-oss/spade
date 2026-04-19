"use client";

import { cn } from "@/lib/utils";

const SWATCHES = [
  "#7A1E1E", // oxblood
  "#d7281d", // swiss red
  "#ff2d16", // hazard
  "#e8502a", // tomato
  "#c4a96a", // gold
  "#2b5cff", // cobalt
  "#0a0a0a", // ink
  "#f4efe7", // bone
];

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="h-8 w-8 rounded-md border-2 border-border shadow-inner"
        style={{ backgroundColor: value }}
        aria-label="Current accent color"
      />
      <span className="mr-1 font-mono text-xs text-muted-foreground">{value}</span>
      {SWATCHES.map((c) => {
        const selected = c.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all",
              selected
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:border-muted-foreground",
            )}
            style={{ backgroundColor: c }}
            aria-label={`Use ${c}`}
          />
        );
      })}
      <label
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary/50"
        title="Custom color"
      >
        <span>+</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
