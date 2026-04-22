import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "settings.json");

export type SmtpSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: "tls" | "ssl" | "none";
};

export type BrandingSettings = {
  logoUrl: string;
  logoUrlDark?: string;
  faviconUrl: string;
  wordmark: string;
  tagline_en: string;
  tagline_el: string;
};

export type BusinessHours = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  open: string;
  close: string;
  closed: boolean;
  // Optional second session for days with a midday break (e.g. 10:00-14:00 + 17:00-21:00).
  // If omitted, the day has a single continuous open-close window.
  open2?: string;
  close2?: string;
};

export type BusinessSettings = {
  name: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  hours: BusinessHours[];
  social: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    tiktok: string;
  };
  priceRange: string;
  timezone?: string; // IANA name, e.g. "Europe/Athens". Used for slot/today calcs.
  /** Target link for the post-visit review email. Defaults to a Google
   * search for the business name + city if not set. */
  reviewUrl?: string;
};

export type NavLink = {
  id: string;
  label_en: string;
  label_el: string;
  href: string;
  enabled: boolean;
};

export type NavSettings = {
  links: NavLink[];
  bookLabel_en: string;
  bookLabel_el: string;
  bookHref: string;
};

export type EmailTemplate = {
  subject_en: string;
  subject_el: string;
  body_en: string;
  body_el: string;
};

export type EmailTemplates = {
  confirmation: EmailTemplate;
  reminder: EmailTemplate;
};

export type AnalyticsSettings = {
  ga4: string;
  gtm: string;
  metaPixel: string;
};

export type AiSettings = {
  apiKey: string;
  unsplashKey?: string;
};

export type ThemeSettings = {
  background: string;
  foreground: string;
  primary: string;
  primaryAccent: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  muted: string;
  muted2: string;
};

export type FontChoice =
  | "geist"
  | "inter"
  | "manrope"
  | "playfair"
  | "cormorant"
  | "fraunces";

export type TypographySettings = {
  headingFont: FontChoice;
  bodyFont: FontChoice;
};

export const FONT_VAR: Record<FontChoice, string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
  manrope: "var(--font-manrope)",
  playfair: "var(--font-playfair)",
  cormorant: "var(--font-cormorant)",
  fraunces: "var(--font-fraunces)",
};

export const FONT_LABEL: Record<FontChoice, string> = {
  geist: "Geist (modern sans)",
  inter: "Inter (neutral sans)",
  manrope: "Manrope (geometric sans)",
  playfair: "Playfair Display (classic serif)",
  cormorant: "Cormorant Garamond (elegant serif)",
  fraunces: "Fraunces (modern serif)",
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  headingFont: "playfair",
  bodyFont: "geist",
};

export const DEFAULT_THEME: ThemeSettings = {
  background: "#0a0806",
  foreground: "#f5efe6",
  primary: "#c9a961",
  primaryAccent: "#d4b878",
  surface: "rgba(255, 255, 255, 0.03)",
  surfaceStrong: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.1)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  muted: "rgba(245, 239, 230, 0.65)",
  muted2: "rgba(245, 239, 230, 0.45)",
};

export type BookingMode = "appointment" | "reservation";

export type AppSettings = {
  smtp?: SmtpSettings;
  branding?: BrandingSettings;
  business?: BusinessSettings;
  nav?: NavSettings;
  templates?: EmailTemplates;
  analytics?: AnalyticsSettings;
  ai?: AiSettings;
  theme?: ThemeSettings;
  typography?: TypographySettings;
  bookingMode?: BookingMode;
  industryId?: string;
  onboarded?: boolean;
};

export async function loadIndustryId(): Promise<string> {
  const s = await loadSettings();
  return typeof s.industryId === "string" ? s.industryId : "barber";
}

export const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: "/brand/default-logo.svg",
  faviconUrl: "/favicon.ico",
  wordmark: "OAKLINE",
  tagline_en: "Scissors · London",
  tagline_el: "Ψαλίδι · Λονδίνο",
};

export const DEFAULT_ANALYTICS: AnalyticsSettings = {
  ga4: "",
  gtm: "",
  metaPixel: "",
};

export const DEFAULT_TEMPLATES: EmailTemplates = {
  confirmation: {
    subject_en: "{business} — your booking is confirmed",
    subject_el: "{business} — το ραντεβού σας επιβεβαιώθηκε",
    body_en:
      "Hi {name},\n\nYour booking is confirmed:\n\n· {service} (£{price})\n· With {barber}\n· On {date} at {time}\n\nWe'll send a reminder 8 hours before. Need to reschedule or cancel? Reply to this email or call us at {phone}.\n\nSee you soon,\n{business}",
    body_el:
      "Γεια σου {name},\n\nΤο ραντεβού σου επιβεβαιώθηκε:\n\n· {service} (£{price})\n· Με τον/την {barber}\n· Στις {date} και ώρα {time}\n\nΘα σου στείλουμε υπενθύμιση 8 ώρες πριν. Αν χρειαστεί να αλλάξεις ή να ακυρώσεις, απάντησε σε αυτό το email ή πάρε μας τηλέφωνο στο {phone}.\n\nΘα σε δούμε σύντομα,\n{business}",
  },
  reminder: {
    subject_en: "Reminder · Your {business} appointment in 8 hours",
    subject_el: "Υπενθύμιση · Το ραντεβού σου στο {business} σε 8 ώρες",
    body_en:
      "Hi {name},\n\nA quick reminder — your {business} appointment is in about 8 hours.\n\n· {service}\n· With {barber}\n· {date} at {time}\n\nNeed to reschedule or cancel? Reply to this email or call us at {phone}.\n\nSee you soon,\n{business}",
    body_el:
      "Γεια σου {name},\n\nΥπενθύμιση: το ραντεβού σου στο {business} είναι σε περίπου 8 ώρες.\n\n· {service}\n· Με τον/την {barber}\n· {date} στις {time}\n\nΑν χρειαστεί να αλλάξεις ή να ακυρώσεις, απάντησε σε αυτό το email ή πάρε μας τηλέφωνο στο {phone}.\n\nΤα λέμε σύντομα,\n{business}",
  },
};

export const DEFAULT_NAV: NavSettings = {
  links: [
    { id: "home", label_en: "Home", label_el: "Αρχική", href: "/", enabled: true },
    { id: "services", label_en: "Services", label_el: "Υπηρεσίες", href: "/services", enabled: true },
    { id: "shop", label_en: "Shop", label_el: "Κατάστημα", href: "/shop", enabled: true },
    { id: "gallery", label_en: "Gallery", label_el: "Γκαλερί", href: "/gallery", enabled: true },
    { id: "team", label_en: "Team", label_el: "Ομάδα", href: "/about", enabled: true },
    { id: "contact", label_en: "Contact", label_el: "Επικοινωνία", href: "/contact", enabled: true },
    { id: "blog", label_en: "Blog", label_el: "Blog", href: "/blog", enabled: true },
  ],
  bookLabel_en: "Book",
  bookLabel_el: "Κράτηση",
  bookHref: "/book",
};

export const DEFAULT_BUSINESS: BusinessSettings = {
  name: "Oakline Scissors",
  streetAddress: "47 Cranley Mews",
  city: "London",
  postalCode: "SW7 3BY",
  country: "GB",
  phone: "+44 20 7946 0412",
  email: "hello@oakline.studio",
  timezone: "Europe/London",
  latitude: 51.4935,
  longitude: -0.1781,
  hours: [
    { day: "mon", open: "10:00", close: "17:00", closed: false },
    { day: "tue", open: "10:00", close: "14:00", closed: false, open2: "17:00", close2: "21:00" },
    { day: "wed", open: "10:00", close: "17:00", closed: false },
    { day: "thu", open: "10:00", close: "14:00", closed: false, open2: "17:00", close2: "21:00" },
    { day: "fri", open: "10:00", close: "21:00", closed: false },
    { day: "sat", open: "10:00", close: "21:00", closed: false },
    { day: "sun", open: "00:00", close: "00:00", closed: true },
  ],
  social: {
    instagram: "",
    facebook: "",
    whatsapp: "",
    tiktok: "",
  },
  priceRange: "£££",
};

const DEFAULTS: AppSettings = {
  smtp: { host: "", port: 587, user: "", pass: "", from: "", secure: "tls" },
  branding: DEFAULT_BRANDING,
  business: DEFAULT_BUSINESS,
  nav: DEFAULT_NAV,
  templates: DEFAULT_TEMPLATES,
  analytics: DEFAULT_ANALYTICS,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as AppSettings;
    return {
      ...DEFAULTS,
      ...parsed,
      smtp: { ...DEFAULTS.smtp!, ...(parsed.smtp ?? {}) },
      branding: { ...DEFAULT_BRANDING, ...(parsed.branding ?? {}) },
      business: {
        ...DEFAULT_BUSINESS,
        ...(parsed.business ?? {}),
        social: {
          ...DEFAULT_BUSINESS.social,
          ...((parsed.business?.social ?? {}) as Partial<BusinessSettings["social"]>),
        },
        hours:
          Array.isArray(parsed.business?.hours) && parsed.business!.hours.length === 7
            ? parsed.business!.hours
            : DEFAULT_BUSINESS.hours,
      },
      nav: {
        ...DEFAULT_NAV,
        ...(parsed.nav ?? {}),
        links:
          Array.isArray(parsed.nav?.links) && parsed.nav!.links.length > 0
            ? parsed.nav!.links
            : DEFAULT_NAV.links,
      },
      templates: {
        confirmation: {
          ...DEFAULT_TEMPLATES.confirmation,
          ...(parsed.templates?.confirmation ?? {}),
        },
        reminder: {
          ...DEFAULT_TEMPLATES.reminder,
          ...(parsed.templates?.reminder ?? {}),
        },
      },
      analytics: { ...DEFAULT_ANALYTICS, ...(parsed.analytics ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

export async function loadBranding(): Promise<BrandingSettings> {
  const s = await loadSettings();
  return { ...DEFAULT_BRANDING, ...(s.branding ?? {}) };
}

export async function loadBusiness(): Promise<BusinessSettings> {
  const s = await loadSettings();
  return { ...DEFAULT_BUSINESS, ...(s.business ?? {}) };
}

export async function loadNav(): Promise<NavSettings> {
  const s = await loadSettings();
  return { ...DEFAULT_NAV, ...(s.nav ?? {}) };
}

export async function loadAnalytics(): Promise<AnalyticsSettings> {
  const s = await loadSettings();
  return { ...DEFAULT_ANALYTICS, ...(s.analytics ?? {}) };
}

export async function loadTheme(): Promise<ThemeSettings> {
  const s = await loadSettings();
  return { ...DEFAULT_THEME, ...(s.theme ?? {}) };
}

export async function loadTypography(): Promise<TypographySettings> {
  const s = await loadSettings();
  return { ...DEFAULT_TYPOGRAPHY, ...(s.typography ?? {}) };
}

export async function loadBookingMode(): Promise<BookingMode> {
  const s = await loadSettings();
  return s.bookingMode === "reservation" ? "reservation" : "appointment";
}

export async function loadTemplates(): Promise<EmailTemplates> {
  const s = await loadSettings();
  return {
    confirmation: { ...DEFAULT_TEMPLATES.confirmation, ...(s.templates?.confirmation ?? {}) },
    reminder: { ...DEFAULT_TEMPLATES.reminder, ...(s.templates?.reminder ?? {}) },
  };
}

export async function saveSettings(next: AppSettings): Promise<AppSettings> {
  const merged = { ...(await loadSettings()), ...next };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

export async function loadSmtp(): Promise<SmtpSettings> {
  const s = await loadSettings();
  // Settings file wins over env vars; env vars are a fallback for ops setups.
  const fromFile = s.smtp;
  if (fromFile && fromFile.host) return fromFile;
  return {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "",
    secure: (process.env.SMTP_SECURE as SmtpSettings["secure"]) ?? "tls",
  };
}

export async function smtpReady(): Promise<boolean> {
  const s = await loadSmtp();
  return !!(s.host && s.user && s.pass);
}
