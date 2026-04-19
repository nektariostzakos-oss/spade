"use client";

import { SIZES } from "@/lib/sizes";

export function PreviewGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {SIZES.map((s) => (
        <div
          key={s.id}
          className="rounded-md border border-border bg-card/50 p-3 text-xs text-muted-foreground"
        >
          <div className="font-medium text-foreground">{s.label}</div>
          <div>
            {s.width}×{s.height}
          </div>
        </div>
      ))}
    </div>
  );
}
