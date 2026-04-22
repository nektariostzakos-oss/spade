import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { loadSettings, saveSettings, type BusinessSettings } from "../../../lib/settings";
import { createUser, findUserByEmail, signSession } from "../../../lib/users";
import { recordInstall } from "../../../lib/installStats";

// Crypto-strong random password for invited teammates. They can't use it to
// log in directly — the account is flagged mustChangePassword, and the
// teammate is expected to hit /admin/reset with their email.
function randomTeammatePassword(): string {
  return randomBytes(18).toString("base64url");
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) return true; // local dev curl — allow
  const expected = new Set([`http://${host}`, `https://${host}`]);
  if (origin && expected.has(origin)) return true;
  if (referer) {
    try {
      const r = new URL(referer);
      if (expected.has(`${r.protocol}//${r.host}`)) return true;
    } catch {}
  }
  // No Origin and no matching Referer → refuse. Browsers always send one for
  // same-site POSTs, so a missing pair means a cross-site form submission.
  return !origin && !referer;
}

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

// Runtime data — per-install records. Always empty on fresh install unless
// the buyer explicitly picked "demo" mode (then we carry the showcase samples
// so they can see how it feels populated).
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

// Catalogue data — services, staff, products, pages, blog taxonomy, site
// copy. In demo mode we copy the template's showcase content. In clean mode
// the buyer starts with a genuinely empty catalogue and builds it themselves
// — otherwise "clean" is just a re-skinned demo.
const TEMPLATE_ARRAYS = new Set([
  "products.json",
  "pages.json",
  "blog-categories.json",
  "services.json",
  "staff.json",
]);
const TEMPLATE_OBJECTS = new Set([
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

async function writeEmptyObject(dst: string) {
  await fs.writeFile(dst, "{}\n", "utf-8");
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin install requests refused." }, { status: 403 });
  }

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

  const templateDataDir = path.join(templateDir, "data");

  // 1. Catalogue data (services / staff / products / pages / blog / content).
  // Demo mode copies the showcase; clean mode writes empty defaults so the
  // buyer actually starts from a blank site.
  for (const f of TEMPLATE_ARRAYS) {
    const dst = path.join(DATA_DIR, f);
    if (body.mode === "demo") {
      const copied = await copyIfExists(path.join(templateDataDir, f), dst);
      if (!copied) await writeEmptyArray(dst);
    } else {
      await writeEmptyArray(dst);
    }
  }
  for (const f of TEMPLATE_OBJECTS) {
    const dst = path.join(DATA_DIR, f);
    if (body.mode === "demo") {
      const copied = await copyIfExists(path.join(templateDataDir, f), dst);
      if (!copied) await writeEmptyObject(dst);
    } else {
      await writeEmptyObject(dst);
    }
  }

  // 2. Operational data (bookings / orders / views / clients / audit / etc).
  // Demo mode carries sample records if the bundle has any; clean mode is
  // always empty.
  for (const f of OPERATIONAL) {
    const dst = path.join(DATA_DIR, f);
    if (body.mode === "demo") {
      const copied = await copyIfExists(path.join(templateDataDir, f), dst);
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

  // 3b. Invited teammates — crypto-strong placeholder, flagged must-change.
  // Teammates activate via "Forgot password" on /admin/login. We deliberately
  // don't log or email the generated password; it exists only to satisfy the
  // passwordHash requirement until they set their own.
  if (Array.isArray(body.teammates)) {
    for (const email of body.teammates) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
      try {
        await createUser({
          email,
          password: randomTeammatePassword(),
          role: "barber",
          mustChangePassword: true,
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
    priceRange: "££",
  };

  const metaBranding = (meta.branding as Record<string, string> | undefined) ?? {};
  const metaTheme = (meta.theme as Record<string, string> | undefined) ?? {};
  const metaTypography = (meta.typography as Record<string, string> | undefined) ?? {};
  const metaNav = meta.nav as
    | { links?: Array<{ id: string; label_en: string; label_el: string; href: string; enabled?: boolean }>; bookLabel_en?: string; bookLabel_el?: string; bookHref?: string }
    | undefined;

  // If the buyer picked "demo" mode we keep the template's own wordmark/logo
  // so the seeded content still looks coherent. On "clean" mode we always
  // stamp the buyer's business name — otherwise the template's brand bleeds
  // into their live site (e.g. "SPADE" showing up on a yoga studio).
  const useTemplateBrand = body.mode === "demo";
  await saveSettings({
    ...current,
    business,
    branding: {
      logoUrl: useTemplateBrand ? (metaBranding.logoUrl || "") : "",
      faviconUrl: useTemplateBrand ? (metaBranding.faviconUrl || "") : "",
      wordmark: useTemplateBrand && metaBranding.wordmark
        ? metaBranding.wordmark
        : body.business.name.toUpperCase().slice(0, 24),
      tagline_en: useTemplateBrand ? (metaBranding.tagline_en || "") : "",
      tagline_el: useTemplateBrand
        ? (metaBranding.tagline_el || metaBranding.tagline_en || "")
        : "",
    },
    nav: metaNav && Array.isArray(metaNav.links) && metaNav.links.length > 0
      ? {
          links: metaNav.links.map((l) => ({ ...l, enabled: l.enabled !== false })),
          bookLabel_en: metaNav.bookLabel_en || "Book",
          bookLabel_el: metaNav.bookLabel_el || "Κράτηση",
          bookHref: metaNav.bookHref || "/book",
        }
      : current.nav,
    theme: Object.keys(metaTheme).length > 0 ? (metaTheme as never) : current.theme,
    typography: Object.keys(metaTypography).length > 0 ? (metaTypography as never) : current.typography,
    bookingMode: meta.bookingMode === "reservation" ? "reservation" : "appointment",
    industryId: typeof meta.industryId === "string" ? (meta.industryId as string) : "barber",
    // NB: onboarded stays false here — we only flip it after the session is
    // successfully signed below. Otherwise a cookie failure locks the buyer
    // out of the wizard AND the admin, with no recovery path.
    onboarded: false,
  });

  // 5. Sign in — must succeed before we flip onboarded, so a failure here
  // leaves the buyer able to retry the install rather than stranded.
  const user = await findUserByEmail(body.admin.email);
  if (!user) {
    return NextResponse.json(
      { error: "Admin account was not created. Try again." },
      { status: 500 }
    );
  }
  try {
    const token = await signSession(user.id);
    const c = await cookies();
    c.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Could not sign you in. Try visiting /admin/login." },
      { status: 500 }
    );
  }

  // Session is live — lock in the install.
  await saveSettings({ ...(await loadSettings()), onboarded: true });
  await recordInstall().catch(() => {});

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
