import { loadBusiness } from "../lib/settings";
import { loadContent } from "../lib/content";
import { SERVICES } from "../lib/services";
import { listProducts } from "../lib/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursalon.local";

const DAY_NAME: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type FaqItem = { q_en?: string; q_el?: string; a_en?: string; a_el?: string };
type Testimonial = {
  name?: string;
  quote_en?: string;
  quote_el?: string;
  role_en?: string;
};
type ContentShape = {
  faq?: { items?: FaqItem[] };
  testimonials?: { items?: Testimonial[] };
  services?: { items?: { name_en?: string; price?: number | string; duration?: number | string; desc_en?: string }[] };
};

export default async function JsonLd() {
  const [b, content, products] = await Promise.all([
    loadBusiness(),
    loadContent() as Promise<ContentShape>,
    listProducts().catch(() => []),
  ]);

  const openingHours = b.hours
    .filter((h) => !h.closed)
    .flatMap((h) => {
      const primary = {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAME[h.day],
        opens: h.open,
        closes: h.close,
      };
      if (h.open2 && h.close2) {
        return [
          primary,
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_NAME[h.day],
            opens: h.open2,
            closes: h.close2,
          },
        ];
      }
      return [primary];
    });

  const sameAs = [
    b.social.instagram,
    b.social.facebook,
    b.social.tiktok,
    b.social.whatsapp,
  ].filter(Boolean);

  // Services: prefer admin-edited content, fall back to SERVICES constant
  const serviceItems =
    content.services?.items && content.services.items.length > 0
      ? content.services.items.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name_en,
            description: s.desc_en ?? "",
          },
          price: String(s.price ?? ""),
          priceCurrency: "EUR",
        }))
      : SERVICES.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.desc,
          },
          price: String(s.price),
          priceCurrency: "EUR",
        }));

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "LocalBusiness"],
    "@id": `${SITE_URL}#business`,
    name: b.name,
    image: `${SITE_URL}/og.jpg`,
    url: SITE_URL,
    telephone: b.phone,
    email: b.email,
    priceRange: b.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.streetAddress,
      addressLocality: b.city,
      postalCode: b.postalCode,
      addressCountry: b.country,
    },
    openingHoursSpecification: openingHours,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Barber Services",
      itemListElement: serviceItems,
    },
  };
  if (b.latitude != null && b.longitude != null) {
    org.geo = {
      "@type": "GeoCoordinates",
      latitude: b.latitude,
      longitude: b.longitude,
    };
  }
  if (sameAs.length) org.sameAs = sameAs;

  const reviews = (content.testimonials?.items ?? [])
    .filter((r) => r.name && (r.quote_en || r.quote_el))
    .map((r) => ({
      "@type": "Review",
      reviewBody: r.quote_en || r.quote_el,
      author: { "@type": "Person", name: r.name },
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      itemReviewed: { "@id": `${SITE_URL}#business` },
    }));
  if (reviews.length) {
    org.review = reviews;
    org.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: reviews.length,
    };
  }

  const faqSchema =
    (content.faq?.items ?? []).filter((f) => f.q_en && f.a_en).length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (content.faq?.items ?? [])
            .filter((f) => f.q_en && f.a_en)
            .map((f) => ({
              "@type": "Question",
              name: f.q_en,
              acceptedAnswer: { "@type": "Answer", text: f.a_en },
            })),
        }
      : null;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: b.name,
    inLanguage: ["el-GR", "en"],
    publisher: { "@id": `${SITE_URL}#business` },
  };

  const productList =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${b.name} Shop`,
          itemListElement: products.slice(0, 30).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: p.name_en || p.name_el,
              image: p.image,
              description: p.shortDesc_en || p.shortDesc_el || "",
              url: `${SITE_URL}/shop/${p.slug}`,
              offers: {
                "@type": "Offer",
                price: String(p.price),
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
              },
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {productList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productList) }}
        />
      )}
    </>
  );
}
