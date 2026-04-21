import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { saveSection } from "../../../lib/content";
import { loadSettings, saveSettings } from "../../../lib/settings";
import { getPreset } from "../../../lib/industryPresets";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { presetId } = await req.json();
  const preset = getPreset(String(presetId ?? ""));
  if (!preset) {
    return NextResponse.json({ error: "Unknown preset" }, { status: 400 });
  }

  await saveSection("hero", {
    pill_en: preset.hero.pill_en,
    pill_el: preset.hero.pill_el,
    title_en: preset.hero.title_en,
    title_el: preset.hero.title_el,
    titleAccent_en: preset.hero.titleAccent_en,
    titleAccent_el: preset.hero.titleAccent_el,
    subtitle_en: preset.hero.subtitle_en,
    subtitle_el: preset.hero.subtitle_el,
  });

  await saveSection("services", {
    items: preset.services.map((s, i) => ({
      id: `svc-${i + 1}`,
      name_en: s.name_en,
      name_el: s.name_el,
      price: s.price,
      duration: s.duration,
      desc_en: s.desc_en,
      desc_el: s.desc_el,
    })),
  });

  const current = await loadSettings();
  await saveSettings({
    ...current,
    branding: {
      ...(current.branding ?? {}),
      logoUrl: current.branding?.logoUrl ?? "/brand/default-logo.svg",
      faviconUrl: current.branding?.faviconUrl ?? "/favicon.ico",
      wordmark: preset.wordmark,
      tagline_en: preset.tagline_en,
      tagline_el: preset.tagline_el,
    },
    nav: {
      links: current.nav?.links ?? [],
      bookLabel_en: preset.bookCta_en,
      bookLabel_el: preset.bookCta_el,
      bookHref: current.nav?.bookHref || "/book",
    },
  });

  return NextResponse.json({ ok: true });
}
