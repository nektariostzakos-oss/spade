"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { Sparkles, Wand2, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadZone } from "@/components/UploadZone";
import { LogoUpload } from "@/components/LogoUpload";
import { ColorPicker } from "@/components/ColorPicker";
import { LivePreview } from "@/components/LivePreview";
import {
  EventForm,
  EMPTY_FORM,
  type EventFormData,
} from "@/components/EventForm";
import { TemplatePicker, TEMPLATE_META } from "@/components/TemplatePicker";
import { PreviewGrid } from "@/components/PreviewGrid";
import { TEMPLATE_DEFAULT_ACCENT, type TemplateId } from "@/templates";
import { slugify } from "@/lib/utils";
import { SIZES } from "@/lib/sizes";

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; filename: string; warning?: string }
  | { kind: "error"; message: string };

export default function Page() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [templateId, setTemplateId] = useState<TemplateId>("club-night");
  const [accentColor, setAccentColor] = useState<string>(
    TEMPLATE_DEFAULT_ACCENT["club-night"],
  );
  const [tagline, setTagline] = useState<string>("");
  const [removeBg, setRemoveBg] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [aiBusy, setAiBusy] = useState<null | "copy" | "recommend" | "image">(
    null,
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiNote, setAiNote] = useState<string | null>(null);

  function pickTemplate(next: TemplateId) {
    setTemplateId(next);
    // Reset accent color to the template's default whenever the user changes
    // templates. They can re-customize with the color picker afterwards.
    setAccentColor(TEMPLATE_DEFAULT_ACCENT[next]);
  }

  function shuffleTemplate() {
    const others = TEMPLATE_META.filter((t) => t.id !== templateId);
    const next = others[Math.floor(Math.random() * others.length)];
    pickTemplate(next.id);
  }

  function reset() {
    setPhotoBase64(null);
    setLogoBase64(null);
    setForm(EMPTY_FORM);
    setTemplateId("club-night");
    setAccentColor(TEMPLATE_DEFAULT_ACCENT["club-night"]);
    setTagline("");
    setRemoveBg(false);
    setAiPrompt("");
    setAiNote(null);
    setStatus({ kind: "idle" });
  }

  function validate(): string | null {
    if (!photoBase64) return "Please upload or generate a photo.";
    if (!form.eventName.trim()) return "Event name is required.";
    if (!form.date) return "Event date is required.";
    if (!form.venueName.trim()) return "Venue name is required.";
    return null;
  }

  async function onSuggestCopy() {
    if (aiBusy) return;
    setAiBusy("copy");
    setAiNote(null);
    try {
      const res = await fetch("/api/ai/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: form.eventName,
          venueName: form.venueName,
          date: form.date,
          artistName: form.artistName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (data.headline && !form.eventName.trim()) {
        setForm((f) => ({ ...f, eventName: data.headline }));
      }
      if (data.tagline) setTagline(data.tagline);
      setAiNote(`AI: ${data.headline} — ${data.tagline}`);
    } catch (e) {
      setAiNote(
        e instanceof Error ? `Copy AI: ${e.message}` : "Copy AI failed.",
      );
    } finally {
      setAiBusy(null);
    }
  }

  async function onSuggestTemplate() {
    if (aiBusy) return;
    setAiBusy("recommend");
    setAiNote(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: form.eventName,
          venueName: form.venueName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setTemplateId(data.templateId);
      setAccentColor(data.accentColor);
      setAiNote(`AI picked: ${data.templateId} — ${data.reason}`);
    } catch (e) {
      setAiNote(
        e instanceof Error
          ? `Template AI: ${e.message}`
          : "Template AI failed.",
      );
    } finally {
      setAiBusy(null);
    }
  }

  async function onGenerateBackground() {
    if (aiBusy) return;
    if (!aiPrompt.trim()) {
      setAiNote("Describe what you want in the background first.");
      return;
    }
    setAiBusy("image");
    setAiNote("Generating background image (this takes ~15s)...");
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, aspect: "portrait" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setPhotoBase64(data.photoBase64);
      setAiNote("AI background loaded into the photo slot.");
    } catch (e) {
      setAiNote(
        e instanceof Error ? `Image AI: ${e.message}` : "Image AI failed.",
      );
    } finally {
      setAiBusy(null);
    }
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
          logoBase64,
          accentColor,
          tagline,
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
    <main className="relative mx-auto w-full max-w-[960px] px-4 py-8 sm:py-12">
      <header className="mb-10 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> AI-powered flyer studio
        </div>
        <h1 className="bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          FlyerForge
        </h1>
        <p className="mx-auto max-w-[560px] text-sm text-muted-foreground sm:text-base">
          One photo in. Six sized flyer assets out.
          Pick a template, let AI write the copy, download a ZIP.
        </p>
      </header>

      {status.kind === "success" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> All done.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Downloaded{" "}
              <span className="font-mono text-foreground">{status.filename}</span>.
            </p>
            {status.warning ? (
              <p className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
                {status.warning}
              </p>
            ) : null}
            <Button onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Generate another
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UploadZone
                  photoBase64={photoBase64}
                  onPhotoChange={setPhotoBase64}
                />
                <div className="rounded-lg border border-border bg-card/50 p-3">
                  <Label htmlFor="ai-image-prompt" className="text-xs">
                    Or describe a background for AI
                  </Label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="ai-image-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="dreamy neon skyline at midnight, photographic"
                      disabled={aiBusy !== null}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onGenerateBackground}
                      disabled={aiBusy !== null}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      {aiBusy === "image" ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <LogoUpload
                  logoBase64={logoBase64}
                  onLogoChange={setLogoBase64}
                />
                <div className="space-y-2">
                  <Label className="text-xs">Accent color</Label>
                  <ColorPicker
                    value={accentColor}
                    onChange={setAccentColor}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>3. Event details</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onSuggestCopy}
                    disabled={aiBusy !== null}
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    {aiBusy === "copy" ? "Thinking..." : "Suggest copy"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EventForm value={form} onChange={setForm} />
                <div className="space-y-1.5">
                  <Label htmlFor="tagline">Tagline (optional)</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="ONE NIGHT ONLY"
                  />
                </div>
                {aiNote ? (
                  <p className="rounded-md border border-primary/30 bg-primary/10 p-2 text-xs text-foreground">
                    {aiNote}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>4. Template</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onSuggestTemplate}
                    disabled={aiBusy !== null}
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    {aiBusy === "recommend" ? "Thinking..." : "Suggest template"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TemplatePicker value={templateId} onChange={pickTemplate} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Generate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-md border border-border bg-card/50 p-3">
                  <div className="flex flex-col">
                    <Label htmlFor="remove-bg-switch">
                      Remove photo background
                    </Label>
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

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Live preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LivePreview
                  templateId={templateId}
                  formData={form}
                  photoBase64={photoBase64}
                  logoBase64={logoBase64}
                  accentColor={accentColor}
                  tagline={tagline}
                  onShuffleTemplate={shuffleTemplate}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </main>
  );
}
