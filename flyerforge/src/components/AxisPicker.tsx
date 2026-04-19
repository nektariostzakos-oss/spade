"use client";

import { Dice5 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LAYOUTS,
  PALETTES,
  TREATMENTS,
  TYPE_PAIRS,
  compatibilityScore,
  type AxisMeta,
  type Design,
  type Layout,
  type Palette,
  type Treatment,
  type TypePair,
} from "@/lib/design/axes";

type Props = {
  value: Design;
  onChange: (next: Design) => void;
  onRandomize?: () => void;
};

export function AxisPicker({ value, onChange, onRandomize }: Props) {
  const score = compatibilityScore(value);
  const warn = score <= 1;

  return (
    <div className="space-y-4">
      <Row
        label="Layout"
        options={LAYOUTS}
        value={value.layout}
        onChange={(id) => onChange({ ...value, layout: id as Layout })}
      />
      <Row
        label="Typography"
        options={TYPE_PAIRS}
        value={value.typePair}
        onChange={(id) => onChange({ ...value, typePair: id as TypePair })}
      />
      <Row
        label="Palette"
        options={PALETTES}
        value={value.palette}
        onChange={(id) => onChange({ ...value, palette: id as Palette })}
      />
      <Row
        label="Photo treatment"
        options={TREATMENTS}
        value={value.treatment}
        onChange={(id) => onChange({ ...value, treatment: id as Treatment })}
      />

      <div className="flex items-center justify-between pt-1">
        <p
          className={cn(
            "text-xs",
            warn ? "text-yellow-500" : "text-muted-foreground",
          )}
        >
          {warn
            ? "Unusual pairing — preview to check."
            : "Canonical combination."}
        </p>
        {onRandomize ? (
          <button
            type="button"
            onClick={onRandomize}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/60"
          >
            <Dice5 className="h-3.5 w-3.5 text-primary" />
            Randomize
          </button>
        ) : null}
      </div>
    </div>
  );
}

type RowProps<T extends string> = {
  label: string;
  options: AxisMeta<T>[];
  value: T;
  onChange: (next: T) => void;
};

function Row<T extends string>({ label, options, value, onChange }: RowProps<T>) {
  const active = options.find((o) => o.id === value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-[11px] text-muted-foreground/80">
          {active?.tagline}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                selected
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-card/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
