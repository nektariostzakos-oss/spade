"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadZone } from "@/components/UploadZone";
import { EventForm, EMPTY_FORM, type EventFormData } from "@/components/EventForm";
import { TemplatePicker, type TemplateId } from "@/components/TemplatePicker";
import { PreviewGrid } from "@/components/PreviewGrid";
import { slugify } from "@/lib/utils";
import { SIZES } from "@/lib/sizes";

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; filename: string; warning?: string }
  | { kind: "error"; message: string };

export default function Page() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [templateId, setTemplateId] = useState<TemplateId>("club-night");
  const [removeBg, setRemoveBg] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function reset() {
    setPhotoBase64(null);
    setForm(EMPTY_FORM);
    setTemplateId("club-night");
    setRemoveBg(false);
    setStatus({ kind: "idle" });
  }

  function validate(): string | null {
    if (!photoBase64) return "Please upload a photo.";
    if (!form.eventName.trim()) return "Event name is required.";
    if (!form.date) return "Event date is required.";
    if (!form.venueName.trim()) return "Venue name is required.";
    return null;
  }

  async function onGenerate() {
    const err = validate();
    if (err) {
      setStatus({ kind: "error", message: err });
      return;
    }

    try {
      if (removeBg) {
        setStatus({ kind: "working", message: "Removing background..." });
      } else {
        setStatus({ kind: "working", message: "Preparing assets..." });
      }

      // Cycle progress messages while the request runs.
      const stepMessages = [
        ...(removeBg ? ["Removing background..."] : []),
        ...SIZES.map((s) => `Generating ${s.label}...`),
        "Zipping assets...",
      ];
      let cursor = 0;
      const interval = window.setInterval(() => {
        cursor = Math.min(cursor + 1, stepMessages.length - 1);
        setStatus({ kind: "working", message: stepMessages[cursor] });
      }, 700);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          formData: form,
          photoBase64,
          removeBg,
        }),
      });

      window.clearInterval(interval);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status})`);
      }

      const warning = res.headers.get("X-FlyerForge-Warning") ?? undefined;
      const blob = await res.blob();
      const filename = `flyerforge-${slugify(form.eventName)}-${form.date}.zip`;
      saveAs(blob, filename);

      setStatus({ kind: "success", filename, warning: warning ?? undefined });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  }

  const working = status.kind === "working";

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 py-10">
      <header className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">FlyerForge</h1>
        <p className="text-sm text-muted-foreground">
          One photo in. Six sized flyer assets out.
        </p>
      </header>

      {status.kind === "success" ? (
        <Card>
          <CardHeader>
            <CardTitle>All done.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Downloaded <span className="font-mono text-foreground">{status.filename}</span>.
            </p>
            {status.warning ? (
              <p className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
                {status.warning}
              </p>
            ) : null}
            <Button onClick={reset}>Generate another</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Upload a photo</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone photoBase64={photoBase64} onPhotoChange={setPhotoBase64} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Event details</CardTitle>
            </CardHeader>
            <CardContent>
              <EventForm value={form} onChange={setForm} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pick a template</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplatePicker value={templateId} onChange={setTemplateId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Generate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-md border border-border bg-card/50 p-3">
                <div className="flex flex-col">
                  <Label htmlFor="remove-bg-switch">Remove photo background</Label>
                  <span className="text-xs text-muted-foreground">
                    Uses Remove.bg. Requires REMOVE_BG_API_KEY.
                  </span>
                </div>
                <Switch
                  id="remove-bg-switch"
                  checked={removeBg}
                  onCheckedChange={setRemoveBg}
                />
              </div>

              <PreviewGrid />

              <Button
                size="lg"
                className="w-full"
                onClick={onGenerate}
                disabled={working}
              >
                {working ? status.message : "Generate 6 Assets"}
              </Button>

              {status.kind === "error" ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                  {status.message}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
