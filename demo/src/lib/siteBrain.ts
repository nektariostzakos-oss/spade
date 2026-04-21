/**
 * Compact JSON-to-text "site brain" that becomes the system-prompt context
 * for the AI concierge. Pulled fresh from disk, cached in-process for 60s.
 */

import { loadSettings, loadBusiness, loadBranding } from "./settings";
import { listProducts } from "./products";
import { getActiveServices } from "./customServices";
import { getActiveStaff } from "./customStaff";
import { loadContent } from "./content";

const TTL_MS = 60_000;
let cache: { at: number; text: string } | null = null;

function days(hours: { day: string; open: string; close: string; closed: boolean }[]): string {
  const ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const LABELS: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  return hours
    .slice()
    .sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day))
    .map((h) => (h.closed ? `${LABELS[h.day]}: closed` : `${LABELS[h.day]}: ${h.open}–${h.close}`))
    .join(" · ");
}

export async function getSiteBrain(siteUrl = ""): Promise<string> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.text;

  const [settings, business, branding, products, services, staff, content] = await Promise.all([
    loadSettings(),
    loadBusiness(),
    loadBranding(),
    listProducts().catch(() => []),
    getActiveServices().catch(() => []),
    getActiveStaff().catch(() => []),
    loadContent().catch(() => ({})) as Promise<Record<string, unknown>>,
  ]);

  const lines: string[] = [];
  lines.push(`BUSINESS`);
  lines.push(`- Name: ${business.name}`);
  if (branding.tagline_en) lines.push(`- Tagline: ${branding.tagline_en}`);
  const addr = [business.streetAddress, business.postalCode, business.city, business.country].filter(Boolean).join(", ");
  if (addr) lines.push(`- Address: ${addr}`);
  if (business.phone) lines.push(`- Phone: ${business.phone}`);
  if (business.email) lines.push(`- Email: ${business.email}`);
  if (business.social?.whatsapp) lines.push(`- WhatsApp: ${business.social.whatsapp}`);
  if (business.social?.instagram) lines.push(`- Instagram: ${business.social.instagram}`);
  if (business.hours?.length) lines.push(`- Hours: ${days(business.hours)}`);

  if (services.length) {
    lines.push(`\nSERVICES (${services.length})`);
    for (const s of services.slice(0, 20)) {
      lines.push(`- ${s.name} · ${s.duration}min · €${s.price}${s.desc ? ` — ${s.desc}` : ""}`);
    }
  }

  if (staff.length) {
    lines.push(`\nTEAM`);
    for (const m of staff.slice(0, 10)) {
      lines.push(`- ${m.name}${m.role ? ` · ${m.role}` : ""}`);
    }
  }

  if (products.length) {
    lines.push(`\nSHOP (${products.length} products)`);
    const byCat = new Map<string, typeof products>();
    for (const p of products) {
      const c = p.category_en || "Other";
      if (!byCat.has(c)) byCat.set(c, []);
      byCat.get(c)!.push(p);
    }
    for (const [cat, items] of byCat) {
      lines.push(`· ${cat}: ${items.slice(0, 6).map((p) => `${p.name_en} (€${p.price})`).join(", ")}`);
    }
  }

  const faq = (content as { faq?: { items?: Array<{ q_en?: string; a_en?: string }> } }).faq;
  if (faq?.items?.length) {
    lines.push(`\nFAQ`);
    for (const item of faq.items.slice(0, 8)) {
      if (!item.q_en) continue;
      const q = item.q_en.trim();
      const a = (item.a_en || "").trim().replace(/\s+/g, " ").slice(0, 240);
      lines.push(`- Q: ${q}\n  A: ${a}`);
    }
  }

  if (siteUrl) {
    lines.push(`\nBOOKING`);
    lines.push(`- Direct link: ${siteUrl.replace(/\/$/, "")}/book`);
    lines.push(`- WhatsApp booking also welcome${business.social?.whatsapp ? ` at ${business.social.whatsapp}` : ""}`);
  }

  const text = lines.join("\n");
  cache = { at: Date.now(), text };
  return text;
}

export function invalidateSiteBrain() {
  cache = null;
}
