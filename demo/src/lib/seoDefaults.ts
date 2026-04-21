import type { BusinessSettings } from "./settings";

export type SeoBlock = {
  title_en: string;
  title_el: string;
  description_en: string;
  description_el: string;
};

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export function seoDefaults(page: string, b: BusinessSettings): SeoBlock {
  const name = b.name || "Oakline Scissors";
  const city = b.city || "London";
  const phone = b.phone || "";
  const addr = [b.streetAddress, b.city].filter(Boolean).join(", ");

  const base: Record<string, SeoBlock> = {
    seo_home: {
      title_en: clip(`${name} — Barber Shop in ${city}`, 60),
      title_el: clip(`${name} — Κουρείο ${city}`, 60),
      description_en: clip(
        `${name} in ${city}: classic cuts, sharp fades, beard trims, and hot-towel shaves. Walk-ins welcome, online booking in under a minute. Call ${phone}.`,
        158
      ),
      description_el: clip(
        `${name} στο ${city}: κλασικά κουρέματα, fades, περιποίηση γενειάδας και ξυρίσματα με ζεστή πετσέτα. Online ραντεβού σε ένα λεπτό. Καλέστε ${phone}.`,
        158
      ),
    },
    seo_services: {
      title_en: clip(`Haircuts, Beards & Shave Prices | ${name} ${city}`, 60),
      title_el: clip(`Υπηρεσίες & Τιμές | ${name} ${city}`, 60),
      description_en: clip(
        `Full service menu and pricing at ${name}, ${city}. Men's haircuts, fades, beard sculpt, hot-towel shave, full grooming. Book the chair online.`,
        158
      ),
      description_el: clip(
        `Πλήρης κατάλογος υπηρεσιών και τιμών στο ${name}, ${city}. Κουρέματα, fades, περιποίηση γενειάδας, ξύρισμα, full grooming. Κλείστε online.`,
        158
      ),
    },
    seo_shop: {
      title_en: clip(`Grooming Products — ${name} Shop`, 60),
      title_el: clip(`Προϊόντα Περιποίησης — ${name}`, 60),
      description_en: clip(
        `Pomade, beard oil, shampoo, combs, straight razors, and gift vouchers from ${name} in ${city}. Shop the shelves our barbers actually use.`,
        158
      ),
      description_el: clip(
        `Πομάδες, λάδια γενειάδας, σαμπουάν, χτένες, ξυράφια και δωροκάρτες από το ${name} στο ${city}. Τα προϊόντα που χρησιμοποιούμε στην καρέκλα.`,
        158
      ),
    },
    seo_gallery: {
      title_en: clip(`Barber Portfolio — Cuts, Fades & Beards | ${name}`, 60),
      title_el: clip(`Portfolio — Κουρέματα, Fades, Γενειάδες | ${name}`, 60),
      description_en: clip(
        `Fresh work from the chair at ${name}, ${city}. Recent haircuts, fades, beard shapes, and shop moments. See the style before you book.`,
        158
      ),
      description_el: clip(
        `Πρόσφατες δουλειές από την καρέκλα του ${name}, ${city}. Κουρέματα, fades, περιποίηση γενειάδας. Δες το στυλ πριν κλείσεις ραντεβού.`,
        158
      ),
    },
    seo_about: {
      title_en: clip(`Meet the Team — ${name} Barbers, ${city}`, 60),
      title_el: clip(`Η Ομάδα — ${name}, ${city}`, 60),
      description_en: clip(
        `The barbers behind ${name} in ${city}. Years of chair time, classic craft, modern style. Book directly with the barber you want.`,
        158
      ),
      description_el: clip(
        `Οι barbers πίσω από το ${name} στο ${city}. Χρόνια εμπειρίας, κλασική τέχνη, μοντέρνο στυλ. Κλείσε ραντεβού απευθείας με τον barber που θες.`,
        158
      ),
    },
    seo_contact: {
      title_en: clip(`Contact & Directions — ${name}, ${city}`, 60),
      title_el: clip(`Επικοινωνία & Πρόσβαση — ${name}, ${city}`, 60),
      description_en: clip(
        `Visit ${name} at ${addr}. Call ${phone} or email ${b.email}. Opening hours, directions, and online booking on one page.`,
        158
      ),
      description_el: clip(
        `Επισκεφθείτε το ${name} στο ${addr}. Καλέστε ${phone} ή email ${b.email}. Ωράριο, χάρτης και online ραντεβού.`,
        158
      ),
    },
    seo_book: {
      title_en: clip(`Book Online — ${name} ${city}`, 60),
      title_el: clip(`Online Ραντεβού — ${name} ${city}`, 60),
      description_en: clip(
        `Book a chair at ${name} in ${city} in under a minute. Pick your service, your barber, and your time. Email confirmation + reminder included.`,
        158
      ),
      description_el: clip(
        `Κλείστε ραντεβού στο ${name}, ${city}, σε λιγότερο από ένα λεπτό. Υπηρεσία, barber και ώρα της επιλογής σας. Email επιβεβαίωσης και υπενθύμιση.`,
        158
      ),
    },
  };

  return (
    base[page] ?? {
      title_en: name,
      title_el: name,
      description_en: `${name} in ${city}.`,
      description_el: `${name} στο ${city}.`,
    }
  );
}
