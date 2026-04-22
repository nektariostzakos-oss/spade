import { loadBranding, loadBusiness, loadSmtp, loadAnalytics } from "./settings";
import { listAdminStaff } from "./customStaff";
import { listAdminServices } from "./customServices";

export type ChecklistItem = {
  key: string;
  label: string;
  href: string;
  section: string;
  optional?: boolean;
  done: boolean;
  hint?: string;
};

/**
 * Go-live readiness. Each item either "✓ done" or "⚠ needs attention"
 * with a deep-link into the admin panel section that fixes it.
 */
export async function getLaunchChecklist(): Promise<{
  items: ChecklistItem[];
  doneCount: number;
  totalRequired: number;
}> {
  const [branding, business, smtp, analytics, staff, services] = await Promise.all([
    loadBranding(),
    loadBusiness(),
    loadSmtp(),
    loadAnalytics(),
    listAdminStaff(),
    listAdminServices(),
  ]);

  const items: ChecklistItem[] = [
    {
      key: "brand",
      section: "1. Brand",
      href: "/admin#settings",
      label: "Wordmark, tagline and logo set",
      done: !!(branding.wordmark && (branding.tagline_en || branding.tagline_el)),
      hint: branding.wordmark ? undefined : "Set your brand name and tagline.",
    },
    {
      key: "business",
      section: "2. Business",
      href: "/admin#settings",
      label: "Business name, address, phone, email",
      done: !!(business.name && business.streetAddress && business.city && business.phone && business.email),
      hint: business.phone ? undefined : "Fill in shop location and contact details.",
    },
    {
      key: "timezone",
      section: "2. Business",
      href: "/admin#settings",
      label: "Timezone set (IANA)",
      done: !!business.timezone,
      hint: "Slot times depend on this — default Europe/Athens.",
    },
    {
      key: "hours",
      section: "3. Hours",
      href: "/admin#settings",
      label: "Opening hours configured",
      done: (business.hours?.length ?? 0) >= 7 && business.hours.some((h) => !h.closed),
      hint: "Add an open/close time for each day you're in.",
    },
    {
      key: "staff",
      section: "4. Staff",
      href: "/admin#staff",
      label: "At least one stylist",
      done: staff.filter((s) => s.enabled !== false).length > 0,
    },
    {
      key: "services",
      section: "5. Services",
      href: "/admin#services",
      label: "At least one service with a price",
      done: services.filter((s) => s.enabled !== false && s.price > 0).length > 0,
    },
    {
      key: "smtp",
      section: "7. Email",
      href: "/admin#settings",
      label: "SMTP credentials configured",
      done: !!(smtp.host && smtp.user),
      hint: "Without SMTP, confirmation + reminder emails run in preview mode only.",
    },
    {
      key: "analytics",
      section: "10. Analytics",
      href: "/admin#settings",
      optional: true,
      label: "Analytics connected (GA4 / GTM / Meta Pixel)",
      done: !!(analytics.ga4 || analytics.gtm || analytics.metaPixel),
      hint: "Optional, but highly recommended before go-live.",
    },
  ];

  const required = items.filter((i) => !i.optional);
  const doneCount = required.filter((i) => i.done).length;

  return { items, doneCount, totalRequired: required.length };
}
