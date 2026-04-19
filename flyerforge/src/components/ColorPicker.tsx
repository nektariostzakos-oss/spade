"use client";

import { cn } from "@/lib/utils";

const SWATCHES = [
  "#c4a96a",
  "#ff3b6b",
  "#2b5cff",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#0a0a0a",
  "#ffffff",
];

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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
      <span className="ml-1 font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}
