"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Shuffle } from "lucide-react";
import type { TemplateId } from "@/templates";
import type { EventFormData } from "@/components/EventForm";

type Props = {
  templateId: TemplateId;
  formData: EventFormData;
  photoBase64: string | null;
  logoBase64: string | null;
  accentColor: string;
  tagline: string;
  onShuffleTemplate?: () => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "error"; message: string };

// Wait this long after the last change before rendering. Keeps requests cheap.
const DEBOUNCE_MS = 700;

export function LivePreview({
  templateId,
  formData,
  photoBase64,
  logoBase64,
  accentColor,
  tagline,
  onShuffleTemplate,
}: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const latestUrl = useRef<string | null>(null);

  useEffect(() => {
    const canRender =
      formData.eventName.trim().length > 0 ||
      formData.venueName.trim().length > 0 ||
      Boolean(photoBase64);
    if (!canRender) {
      setStatus({ kind: "idle" });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus({ kind: "loading" });
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            formData,
            photoBase64,
            logoBase64,
            accentColor,
            tagline,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Preview failed (${res.status})`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        // Free the previous blob URL once the new one is in place.
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
  }, [templateId, formData, photoBase64, logoBase64, accentColor, tagline]);

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
          <div className="px-4 text-center text-xs text-muted-foreground">
            Add an event name, venue, or photo to see a live preview.
          </div>
        ) : null}

        {status.kind === "error" ? (
          <div className="px-4 text-center text-xs text-destructive-foreground">
            {status.message}
          </div>
        ) : null}
      </div>

      {onShuffleTemplate ? (
        <button
          type="button"
          onClick={onShuffleTemplate}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-card"
        >
          <Shuffle className="h-3.5 w-3.5 text-primary" />
          Shuffle template
        </button>
      ) : null}
    </div>
  );
}
