import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { saveSection } from "../../../lib/content";
import {
  loadSettings,
  saveSettings,
  type BusinessSettings,
} from "../../../lib/settings";
import { createUser, findUserByEmail, signSession } from "../../../lib/users";
import { generateBrandContent } from "../../../lib/aiGenerate";
import { fetchAndStoreImages } from "../../../lib/unsplash";

export const maxDuration = 300;

const COOKIE = "spade_session";

type Input = {
  businessName: string;
  industry: string;
  industryLabel: string;
  city: string;
  country: string;
  phone: string;
  brandDescription: string;
  tone: string;
  adminEmail: string;
  adminPassword: string;
  anthropicKey: string;
  unsplashKey?: string;
};

export async function POST(req: NextRequest) {
  const current = await loadSettings();
  if (current.onboarded) {
    return NextResponse.json(
      { error: "This site is already set up. Sign in at /admin/login." },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Partial<Input>;
  const required: (keyof Input)[] = [
    "businessName",
    "industryLabel",
    "city",
    "adminEmail",
    "adminPassword",
    "brandDescription",
    "anthropicKey",
  ];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === "") {
      return NextResponse.json(
        { error: `Missing field: ${f}` },
        { status: 400 }
      );
    }
  }
  if (String(body.adminPassword).length < 8) {
    return NextResponse.json(
      { error: "Admin password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const input = body as Input;

  // 1. Create the admin user (fail early if email taken)
  const existing = await findUserByEmail(input.adminEmail);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 }
    );
  }

  // 2. Generate brand copy
  let bundle;
  try {
    bundle = await generateBrandContent({
      apiKey: input.anthropicKey,
      business: {
        name: input.businessName,
        city: input.city,
        country: input.country || "",
        phone: input.phone || "",
        email: input.adminEmail,
      },
      industryLabel: input.industryLabel,
      brandDescription: input.brandDescription,
      tone: input.tone || "warm, professional",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI generation failed";
    return NextResponse.json(
      { error: `AI generation failed: ${msg}` },
      { status: 500 }
    );
  }

  // 3. Fetch images (optional — skip if no Unsplash key)
  let imageMap: Record<string, { url: string; author: string; authorUrl: string }> = {};
  if (input.unsplashKey && input.unsplashKey.trim()) {
    try {
      imageMap = await fetchAndStoreImages(
        bundle.images,
        input.unsplashKey.trim()
      );
    } catch (e) {
      // Continue without images — don't fail the whole setup
      console.error("Image fetch failed:", e);
    }
  }

  const img = (key: string, fallback = "") =>
    imageMap[key]?.url || fallback;

  // 4. Create admin user
  await createUser({
    email: input.adminEmail,
    password: input.adminPassword,
    role: "admin",
  });

  // 5. Build business object
  const business: BusinessSettings = {
    name: input.businessName,
    streetAddress: "",
    city: input.city,
    postalCode: "",
    country: input.country || "GR",
    phone: input.phone || "",
    email: input.adminEmail,
    latitude: null,
    longitude: null,
    hours: [
      { day: "mon", open: "09:00", close: "21:00", closed: false },
      { day: "tue", open: "09:00", close: "21:00", closed: false },
      { day: "wed", open: "09:00", close: "21:00", closed: false },
      { day: "thu", open: "09:00", close: "21:00", closed: false },
      { day: "fri", open: "09:00", close: "21:00", closed: false },
      { day: "sat", open: "09:00", close: "21:00", closed: false },
      { day: "sun", open: "00:00", close: "00:00", closed: true },
    ],
    social: { instagram: "", facebook: "", whatsapp: "", tiktok: "" },
    priceRange: "€€",
  };

  // 6. Save content sections
  const heroContent: Record<string, unknown> = { ...bundle.hero };
  if (img("hero_bg")) heroContent.bgImage = img("hero_bg");
  if (img("hero_side")) heroContent.sideImage = img("hero_side");

  const ctaContent: Record<string, unknown> = { ...bundle.cta };
  if (img("cta_bg")) ctaContent.bgImage = img("cta_bg");

  const aboutContent: Record<string, unknown> = { ...bundle.about };
  if (img("about_image")) aboutContent.image = img("about_image");

  const contactContent: Record<string, unknown> = {};
  if (img("contact_image")) contactContent.image = img("contact_image");

  const galleryImages = [
    img("gallery_1"),
    img("gallery_2"),
    img("gallery_3"),
    img("gallery_4"),
    img("gallery_5"),
    img("gallery_6"),
  ].filter(Boolean);

  await Promise.all([
    saveSection("hero", heroContent),
    saveSection("about", aboutContent),
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
    saveSection("cta", ctaContent),
    saveSection("faq", bundle.faq),
    saveSection("testimonials", bundle.testimonials),
    saveSection("gallery_strip", {
      ...bundle.gallery_strip,
      images: galleryImages.map((src) => ({ src })),
    }),
    saveSection("gallery", {
      items: galleryImages.map((src) => ({
        src,
        tag: "Recent",
        big: false,
      })),
    }),
    saveSection("footer", bundle.footer),
    saveSection("contact", contactContent),
    saveSection("seo_home", bundle.seo.home),
    saveSection("seo_services", bundle.seo.services),
    saveSection("seo_shop", bundle.seo.shop),
    saveSection("seo_gallery", bundle.seo.gallery),
    saveSection("seo_about", bundle.seo.about),
    saveSection("seo_contact", bundle.seo.contact),
    saveSection("seo_book", bundle.seo.book),
  ]);

  // 7. Save settings + theme + branding + nav
  await saveSettings({
    ...current,
    business,
    branding: {
      logoUrl: "/brand/default-logo.svg",
      faviconUrl: "/favicon.ico",
      wordmark: bundle.branding.wordmark,
      tagline_en: bundle.branding.tagline_en,
      tagline_el: bundle.branding.tagline_el,
    },
    nav: {
      links: [
        { id: "home", label_en: "Home", label_el: "Αρχική", href: "/", enabled: true },
        { id: "services", label_en: "Services", label_el: "Υπηρεσίες", href: "/services", enabled: true },
        { id: "shop", label_en: "Shop", label_el: "Κατάστημα", href: "/shop", enabled: true },
        { id: "gallery", label_en: "Gallery", label_el: "Γκαλερί", href: "/gallery", enabled: true },
        { id: "team", label_en: "Team", label_el: "Ομάδα", href: "/about", enabled: true },
        { id: "contact", label_en: "Contact", label_el: "Επικοινωνία", href: "/contact", enabled: true },
      ],
      bookLabel_en: bundle.book_button.label_en,
      bookLabel_el: bundle.book_button.label_el,
      bookHref: "/book",
    },
    theme: {
      background: bundle.theme.background,
      foreground: bundle.theme.foreground,
      primary: bundle.theme.primary,
      primaryAccent: bundle.theme.primaryAccent,
      surface: "rgba(255, 255, 255, 0.04)",
      surfaceStrong: "rgba(255, 255, 255, 0.07)",
      border: "rgba(255, 255, 255, 0.1)",
      borderStrong: "rgba(255, 255, 255, 0.18)",
      muted: "rgba(255, 255, 255, 0.65)",
      muted2: "rgba(255, 255, 255, 0.45)",
    },
    ai: {
      apiKey: input.anthropicKey,
      unsplashKey: input.unsplashKey || "",
    },
    onboarded: true,
  });

  // 8. Sign in the new admin
  const user = await findUserByEmail(input.adminEmail);
  if (user) {
    const token = await signSession(user.id);
    const c = await cookies();
    c.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  return NextResponse.json({ ok: true });
}
