import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { loadSettings, saveSettings, type BusinessSettings } from "../../../lib/settings";
import { createUser, findUserByEmail, signSession } from "../../../lib/users";
import { recordInstall } from "../../../lib/installStats";

const DATA_DIR = path.join(process.cwd(), "data");
const DEMOS_DIR = path.join(process.cwd(), "demos");
const COOKIE = "spade_session";

type Input = {
  templateId: string;
  mode: "clean" | "demo";
  business: {
    name: string;
    city: string;
    country?: string;
    streetAddress?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  };
  admin: {
    email: string;
    password: string;
  };
  teammates?: string[];
};

// Files whose content is BUSINESS DATA and should be cleared in "clean" mode
const OPERATIONAL = new Set([
  "bookings.json",
  "orders.json",
  "views.json",
  "clients.json",
  "audit.json",
  "waitlist.json",
  "reviews.json",
  "emails.log.json",
]);

// Files that represent TEMPLATE CONTENT (always copy from bundle)
const TEMPLATE_FILES = new Set([
  "products.json",
  "pages.json",
  "blog-categories.json",
  "services.json",
  "staff.json",
  "content.json",
]);

async function copyIfExists(src: string, dst: string) {
  try {
    const raw = await fs.readFile(src, "utf-8");
    await fs.writeFile(dst, raw, "utf-8");
    return true;
  } catch {
    return false;
  }
}

async function writeEmptyArray(dst: string) {
  await fs.writeFile(dst, "[]\n", "utf-8");
}

export async function POST(req: NextRequest) {
  const current = await loadSettings();
  if (current.onboarded) {
    return NextResponse.json(
      { error: "This site is already set up. Sign in at /admin/login." },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Partial<Input>;
  if (!body.templateId || !body.mode || !body.business || !body.admin) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!body.business.name || !body.business.city) {
    return NextResponse.json({ error: "Business name and city are required." }, { status: 400 });
  }
  if (!body.admin.email || !body.admin.password) {
    return NextResponse.json({ error: "Admin email and password are required." }, { status: 400 });
  }
  if (body.admin.password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // Load template meta
  const templateDir = path.join(DEMOS_DIR, body.templateId);
  let meta: Record<string, unknown>;
  try {
    meta = JSON.parse(await fs.readFile(path.join(templateDir, "meta.json"), "utf-8"));
  } catch {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  const existing = await findUserByEmail(body.admin.email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 }
    );
  }

  await fs.mkdir(DATA_DIR, { recursive: true });

  // 1. Copy template content files
  const templateDataDir = path.join(templateDir, "data");
  let templateFiles: string[] = [];
  try {
    templateFiles = await fs.readdir(templateDataDir);
  } catch {}
  for (const f of templateFiles) {
    if (!TEMPLATE_FILES.has(f)) continue;
    await copyIfExists(path.join(templateDataDir, f), path.join(DATA_DIR, f));
  }

  // 2. Operational data: either empty or carry demo samples
  for (const f of OPERATIONAL) {
    const bundlePath = path.join(templateDataDir, f);
    const dst = path.join(DATA_DIR, f);
    if (body.mode === "demo") {
      const copied = await copyIfExists(bundlePath, dst);
      if (!copied) await writeEmptyArray(dst);
    } else {
      await writeEmptyArray(dst);
    }
  }

  // 3. Admin user
  await createUser({
    email: body.admin.email,
    password: body.admin.password,
    role: "admin",
  });

  // 3b. Invited teammates (placeholder passwords — they'll reset on first login)
  if (Array.isArray(body.teammates)) {
    for (const email of body.teammates) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
      try {
        await createUser({
          email,
          password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
          role: "barber",
        });
      } catch {
        // skip duplicates
      }
    }
  }

  // 4. Settings: business, branding, theme, typography, nav from template meta
  const business: BusinessSettings = {
    name: body.business.name,
    streetAddress: body.business.streetAddress || "",
    city: body.business.city,
    postalCode: body.business.postalCode || "",
    country: body.business.country || "GR",
    phone: body.business.phone || "",
    email: body.business.email || body.admin.email,
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

  const metaBranding = (meta.branding as Record<string, string> | undefined) ?? {};
  const metaTheme = (meta.theme as Record<string, string> | undefined) ?? {};
  const metaTypography = (meta.typography as Record<string, string> | undefined) ?? {};

  await saveSettings({
    ...current,
    business,
    branding: {
      logoUrl: "/brand/default-logo.svg",
      faviconUrl: "/favicon.ico",
      wordmark: metaBranding.wordmark || body.business.name.toUpperCase(),
      tagline_en: metaBranding.tagline_en || "",
      tagline_el: metaBranding.tagline_el || metaBranding.tagline_en || "",
    },
    theme: Object.keys(metaTheme).length > 0 ? (metaTheme as never) : current.theme,
    typography: Object.keys(metaTypography).length > 0 ? (metaTypography as never) : current.typography,
    onboarded: true,
  });

  // Record installation for the counter
  await recordInstall().catch(() => {});

  // 5. Sign in
  const user = await findUserByEmail(body.admin.email);
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

  return NextResponse.json({
    ok: true,
    template: body.templateId,
    mode: body.mode,
    summary: {
      adminEmail: body.admin.email,
      businessName: body.business.name,
    },
  });
}
