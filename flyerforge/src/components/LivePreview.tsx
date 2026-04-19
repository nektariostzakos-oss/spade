"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Shuffle } from "lucide-react";
import type { Design } from "@/lib/design/axes";
import type { EventFormData } from "@/components/EventForm";

// A canned form so the preview has something nice to show on first load.
const DEMO_FORM: EventFormData = {
  eventName: "Last Light",
  date: "2026-06-12",
  time: "21:00",
  venueName: "Club Atlas",
  venueAddress: "12 Seaside Rd, Athens",
  artistName: "Helios",
};

type Props = {
  design: Design;
  formData: EventFormData;
  photoBase64: string | null;
  logoBase64: string | null;
  accentColor: string;
  tagline: string;
  onShuffleDesign?: () => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "error"; message: string };

// Wait this long after the last change before rendering. Keeps requests cheap.
const DEBOUNCE_MS = 700;

export function LivePreview({
  design,
  formData,
  photoBase64,
  logoBase64,
  accentColor,
  tagline,
  onShuffleDesign,
}: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const latestUrl = useRef<string | null>(null);

  const userHasInput = useMemo(
    () =>
      formData.eventName.trim().length > 0 ||
      formData.venueName.trim().length > 0 ||
      Boolean(photoBase64),
    [formData.eventName, formData.venueName, photoBase64],
  );
  const effectiveFormData = userHasInput ? formData : DEMO_FORM;
  const effectiveTagline = userHasInput ? tagline : "ONE NIGHT ONLY";

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus({ kind: "loading" });
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            design,
            formData: effectiveFormData,
            photoBase64,
            logoBase64,
            accentColor,
            tagline: effectiveTagline,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Preview failed (${res.status})`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (latestUrl.current) URL.revokeObjectURL(latestUrl.current);
        latestUrl.current = url;

        setStatus({ kind: "ready", url });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setStatus({
          kind: "error",
          message: e instanceof Error ? e.message : "Preview failed.",
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [design, effectiveFormData, photoBase64, logoBase64, accentColor, effectiveTagline]);

  useEffect(() => {
    return () => {
      if (latestUrl.current) URL.revokeObjectURL(latestUrl.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex aspect-[9/16] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-lg border border-border bg-black/40">
        {status.kind === "ready" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={status.url}
            alt="Live preview"
            className="h-full w-full object-cover"
          />
        ) : null}

        {status.kind === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : null}

        {status.kind === "idle" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : null}

        {!userHasInput && status.kind === "ready" ? (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
            demo
          </div>
        ) : null}

        {status.kind === "error" ? (
          <div className="px-4 text-center text-xs text-destructive-foreground">
            {status.message}
          </div>
        ) : null}
      </div>

      {onShuffleDesign ? (
        <button
          type="button"
          onClick={onShuffleDesign}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-card"
        >
          <Shuffle className="h-3.5 w-3.5 text-primary" />
          Shuffle design
        </button>
      ) : null}
    </div>
  );
}
