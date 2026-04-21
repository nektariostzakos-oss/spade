import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { saveSection } from "../../../lib/content";
import { loadSettings, saveSettings } from "../../../lib/settings";
import { generateBrandContent } from "../../../lib/aiGenerate";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    apiKey: providedKey,
    industryLabel,
    brandDescription,
    tone,
    business: bizOverride,
  } = body as {
    apiKey?: string;
    industryLabel?: string;
    brandDescription?: string;
    tone?: string;
    business?: {
      name?: string;
      city?: string;
      country?: string;
      phone?: string;
      email?: string;
    };
  };

  const settings = await loadSettings();
  const apiKey =
    (providedKey && providedKey !== "********" ? providedKey : "") ||
    settings.ai?.apiKey ||
    process.env.ANTHROPIC_API_KEY ||
    "";
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Anthropic API key not configured. Add one in Settings → Brand or set the ANTHROPIC_API_KEY env var.",
      },
      { status: 400 }
    );
  }

  const biz = {
    name: bizOverride?.name || settings.business?.name || "",
    city: bizOverride?.city || settings.business?.city || "",
    country: bizOverride?.country || settings.business?.country || "",
    phone: bizOverride?.phone || settings.business?.phone || "",
    email: bizOverride?.email || settings.business?.email || "",
  };

  if (!biz.name) {
    return NextResponse.json(
      { error: "Business name is required before generating content." },
      { status: 400 }
    );
  }

  let bundle;
  try {
    bundle = await generateBrandContent({
      apiKey,
      business: biz,
      industryLabel: industryLabel || "service business",
      brandDescription: brandDescription || "",
      tone: tone || "warm, professional",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await Promise.all([
    saveSection("hero", bundle.hero),
    saveSection("about", bundle.about),
    saveSection("services", {
      eyebrow_en: bundle.services.eyebrow_en,
      eyebrow_el: bundle.services.eyebrow_el,
      title_en: bundle.services.title_en,
      title_el: bundle.services.title_el,
      items: bundle.services.items.map((s, i) => ({
        id: `svc-${i + 1}`,
        name_en: s.name_en,
        name_el: s.name_el,
        price: s.price,
        duration: s.duration,
        desc_en: s.desc_en,
        desc_el: s.desc_el,
      })),
    }),
    saveSection("cta", bundle.cta),
    saveSection("faq", bundle.faq),
    saveSection("testimonials", bundle.testimonials),
    saveSection("gallery_strip", bundle.gallery_strip),
    saveSection("footer", bundle.footer),
    saveSection("seo_home", bundle.seo.home),
    saveSection("seo_services", bundle.seo.services),
    saveSection("seo_shop", bundle.seo.shop),
    saveSection("seo_gallery", bundle.seo.gallery),
    saveSection("seo_about", bundle.seo.about),
    saveSection("seo_contact", bundle.seo.contact),
    saveSection("seo_book", bundle.seo.book),
  ]);

  const current = await loadSettings();
  await saveSettings({
    ...current,
    branding: {
      ...(current.branding ?? {}),
      logoUrl: current.branding?.logoUrl ?? "/brand/default-logo.svg",
      faviconUrl: current.branding?.faviconUrl ?? "/favicon.ico",
      wordmark: bundle.branding.wordmark,
      tagline_en: bundle.branding.tagline_en,
      tagline_el: bundle.branding.tagline_el,
    },
    nav: {
      links: current.nav?.links ?? [],
      bookLabel_en: bundle.book_button.label_en,
      bookLabel_el: bundle.book_button.label_el,
      bookHref: current.nav?.bookHref || "/book",
    },
    ai: { apiKey },
  });

  return NextResponse.json({ ok: true, bundle });
}
