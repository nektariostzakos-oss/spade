import Anthropic from "@anthropic-ai/sdk";

export type GeneratedBundle = {
  hero: {
    pill_en: string;
    pill_el: string;
    title_en: string;
    title_el: string;
    titleAccent_en: string;
    titleAccent_el: string;
    subtitle_en: string;
    subtitle_el: string;
    meta1_en: string;
    meta1_el: string;
    meta2_en: string;
    meta2_el: string;
  };
  about: {
    eyebrow_en: string;
    eyebrow_el: string;
    title_en: string;
    title_el: string;
    p1_en: string;
    p1_el: string;
    p2_en: string;
    p2_el: string;
    p3_en: string;
    p3_el: string;
  };
  services: {
    eyebrow_en: string;
    eyebrow_el: string;
    title_en: string;
    title_el: string;
    items: Array<{
      name_en: string;
      name_el: string;
      price: number;
      duration: number;
      desc_en: string;
      desc_el: string;
    }>;
  };
  cta: {
    eyebrow_en: string;
    eyebrow_el: string;
    title_en: string;
    title_el: string;
    subtitle_en: string;
    subtitle_el: string;
  };
  faq: {
    eyebrow_en: string;
    eyebrow_el: string;
    title_en: string;
    title_el: string;
    items: Array<{ q_en: string; q_el: string; a_en: string; a_el: string }>;
  };
  testimonials: {
    eyebrow_en: string;
    eyebrow_el: string;
    title_en: string;
    title_el: string;
  };
  gallery_strip: {
    eyebrow_en: string;
    eyebrow_el: string;
    title_en: string;
    title_el: string;
  };
  footer: {
    lede_en: string;
    lede_el: string;
    cta_en: string;
    cta_el: string;
    tagline_en: string;
    tagline_el: string;
  };
  seo: {
    home: SeoEntry;
    services: SeoEntry;
    shop: SeoEntry;
    gallery: SeoEntry;
    about: SeoEntry;
    contact: SeoEntry;
    book: SeoEntry;
  };
  branding: {
    wordmark: string;
    tagline_en: string;
    tagline_el: string;
  };
  book_button: {
    label_en: string;
    label_el: string;
  };
  theme: {
    background: string;
    foreground: string;
    primary: string;
    primaryAccent: string;
  };
  images: Array<{
    key: string;
    query: string;
  }>;
};

export const IMAGE_SLOTS = [
  "hero_bg",
  "hero_side",
  "gallery_1",
  "gallery_2",
  "gallery_3",
  "gallery_4",
  "gallery_5",
  "gallery_6",
  "cta_bg",
  "about_image",
  "contact_image",
] as const;

type SeoEntry = {
  title_en: string;
  title_el: string;
  description_en: string;
  description_el: string;
};

const SEO_ENTRY_SCHEMA = {
  type: "object",
  properties: {
    title_en: { type: "string" },
    title_el: { type: "string" },
    description_en: { type: "string" },
    description_el: { type: "string" },
  },
  required: ["title_en", "title_el", "description_en", "description_el"],
  additionalProperties: false,
};

const BUNDLE_SCHEMA = {
  type: "object",
  properties: {
    hero: {
      type: "object",
      properties: {
        pill_en: { type: "string" },
        pill_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
        titleAccent_en: { type: "string" },
        titleAccent_el: { type: "string" },
        subtitle_en: { type: "string" },
        subtitle_el: { type: "string" },
        meta1_en: { type: "string" },
        meta1_el: { type: "string" },
        meta2_en: { type: "string" },
        meta2_el: { type: "string" },
      },
      required: [
        "pill_en",
        "pill_el",
        "title_en",
        "title_el",
        "titleAccent_en",
        "titleAccent_el",
        "subtitle_en",
        "subtitle_el",
        "meta1_en",
        "meta1_el",
        "meta2_en",
        "meta2_el",
      ],
      additionalProperties: false,
    },
    about: {
      type: "object",
      properties: {
        eyebrow_en: { type: "string" },
        eyebrow_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
        p1_en: { type: "string" },
        p1_el: { type: "string" },
        p2_en: { type: "string" },
        p2_el: { type: "string" },
        p3_en: { type: "string" },
        p3_el: { type: "string" },
      },
      required: [
        "eyebrow_en",
        "eyebrow_el",
        "title_en",
        "title_el",
        "p1_en",
        "p1_el",
        "p2_en",
        "p2_el",
        "p3_en",
        "p3_el",
      ],
      additionalProperties: false,
    },
    services: {
      type: "object",
      properties: {
        eyebrow_en: { type: "string" },
        eyebrow_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name_en: { type: "string" },
              name_el: { type: "string" },
              price: { type: "number" },
              duration: { type: "number" },
              desc_en: { type: "string" },
              desc_el: { type: "string" },
            },
            required: [
              "name_en",
              "name_el",
              "price",
              "duration",
              "desc_en",
              "desc_el",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["eyebrow_en", "eyebrow_el", "title_en", "title_el", "items"],
      additionalProperties: false,
    },
    cta: {
      type: "object",
      properties: {
        eyebrow_en: { type: "string" },
        eyebrow_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
        subtitle_en: { type: "string" },
        subtitle_el: { type: "string" },
      },
      required: [
        "eyebrow_en",
        "eyebrow_el",
        "title_en",
        "title_el",
        "subtitle_en",
        "subtitle_el",
      ],
      additionalProperties: false,
    },
    faq: {
      type: "object",
      properties: {
        eyebrow_en: { type: "string" },
        eyebrow_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              q_en: { type: "string" },
              q_el: { type: "string" },
              a_en: { type: "string" },
              a_el: { type: "string" },
            },
            required: ["q_en", "q_el", "a_en", "a_el"],
            additionalProperties: false,
          },
        },
      },
      required: ["eyebrow_en", "eyebrow_el", "title_en", "title_el", "items"],
      additionalProperties: false,
    },
    testimonials: {
      type: "object",
      properties: {
        eyebrow_en: { type: "string" },
        eyebrow_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
      },
      required: ["eyebrow_en", "eyebrow_el", "title_en", "title_el"],
      additionalProperties: false,
    },
    gallery_strip: {
      type: "object",
      properties: {
        eyebrow_en: { type: "string" },
        eyebrow_el: { type: "string" },
        title_en: { type: "string" },
        title_el: { type: "string" },
      },
      required: ["eyebrow_en", "eyebrow_el", "title_en", "title_el"],
      additionalProperties: false,
    },
    footer: {
      type: "object",
      properties: {
        lede_en: { type: "string" },
        lede_el: { type: "string" },
        cta_en: { type: "string" },
        cta_el: { type: "string" },
        tagline_en: { type: "string" },
        tagline_el: { type: "string" },
      },
      required: [
        "lede_en",
        "lede_el",
        "cta_en",
        "cta_el",
        "tagline_en",
        "tagline_el",
      ],
      additionalProperties: false,
    },
    seo: {
      type: "object",
      properties: {
        home: SEO_ENTRY_SCHEMA,
        services: SEO_ENTRY_SCHEMA,
        shop: SEO_ENTRY_SCHEMA,
        gallery: SEO_ENTRY_SCHEMA,
        about: SEO_ENTRY_SCHEMA,
        contact: SEO_ENTRY_SCHEMA,
        book: SEO_ENTRY_SCHEMA,
      },
      required: [
        "home",
        "services",
        "shop",
        "gallery",
        "about",
        "contact",
        "book",
      ],
      additionalProperties: false,
    },
    branding: {
      type: "object",
      properties: {
        wordmark: { type: "string" },
        tagline_en: { type: "string" },
        tagline_el: { type: "string" },
      },
      required: ["wordmark", "tagline_en", "tagline_el"],
      additionalProperties: false,
    },
    book_button: {
      type: "object",
      properties: {
        label_en: { type: "string" },
        label_el: { type: "string" },
      },
      required: ["label_en", "label_el"],
      additionalProperties: false,
    },
    theme: {
      type: "object",
      properties: {
        background: { type: "string", description: "Main page bg — hex color" },
        foreground: { type: "string", description: "Primary text color — hex" },
        primary: {
          type: "string",
          description: "Brand accent color (buttons, highlights) — hex",
        },
        primaryAccent: {
          type: "string",
          description: "Lighter variant of primary — hex",
        },
      },
      required: ["background", "foreground", "primary", "primaryAccent"],
      additionalProperties: false,
    },
    images: {
      type: "array",
      description:
        "Image search queries — one per slot. Keys: hero_bg, hero_side, gallery_1..gallery_6, cta_bg, about_image, contact_image",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          query: {
            type: "string",
            description:
              "Unsplash search query — specific, evocative, 2-5 words. e.g. 'moody barbershop chair vintage', 'sunlit yoga studio wooden floor'",
          },
        },
        required: ["key", "query"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "hero",
    "about",
    "services",
    "cta",
    "faq",
    "testimonials",
    "gallery_strip",
    "footer",
    "seo",
    "branding",
    "book_button",
    "theme",
    "images",
  ],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are a senior brand copywriter and bilingual (English + Greek) SEO specialist for local service businesses.

Voice rules:
- Natural rhythm. Mix short 5-word punches with longer 20-25 word flows.
- Write like a human — specific, grounded, a bit imperfect. Not a brochure.
- No em dashes (—). Use periods, commas, and parentheses instead.
- No clichés: avoid "nestled in", "boasts", "a testament to", "in today's world", "it's worth noting", "when it comes to", "look no further".
- No keyword stuffing. Synonyms and natural phrasing win.
- Reference the specific city and business name. Do not write text that would fit any generic business of this type.
- Match the tone the owner requested.

SEO rules:
- Page titles under 60 characters.
- Meta descriptions 140-160 characters.
- Include the city naturally in title + description.

Services rules:
- Generate 5-7 services that fit the industry exactly.
- Prices realistic for the local market (assume EU/Greece if country is GR).
- Durations in minutes (use 0 for services without a fixed duration like monthly passes).

FAQ rules:
- 5-6 real questions a customer would Google: parking, first-time, cancellation, gift vouchers, payment methods, walk-ins, kids, etc.
- Answers concrete and short (1-2 sentences).

Theme rules — the brand palette must fit the industry + tone:
- Barber/grooming: warm darks + gold/brass accents; spa: cream/sage/terracotta; gym: deep blacks + electric accent (lime/orange/red); clinic/dental: soft neutrals + medical blue/teal; restaurant: warm cream + deep red/green; tutor/consultant: off-white + ink-blue/forest; salon: creams + rose-gold or pastel.
- Return 4 hex colors: background, foreground (text), primary (brand accent), primaryAccent (lighter primary).
- Contrast: foreground must pass WCAG AA on background (>= 4.5:1 ratio).
- Avoid default web hexes like #ff0000, #000000. Use considered tones with depth.

Image rules:
- Emit 11 image search queries, one per slot. Keys (all required, exact strings):
  hero_bg, hero_side, gallery_1, gallery_2, gallery_3, gallery_4, gallery_5, gallery_6, cta_bg, about_image, contact_image
- Queries should be 2-5 words, specific, evocative. Target Unsplash search results.
- Example for a barber: "vintage barbershop chair sunlit", "men haircut scissors macro", "straight razor shave steam".
- Never include the business name — Unsplash doesn't know it. Focus on the craft/scene.

Emit both English (en) and Greek (el) for every text field. Greek should read naturally, not as Google-translate output.`;

export async function generateBrandContent({
  apiKey,
  business,
  industryLabel,
  brandDescription,
  tone,
}: {
  apiKey: string;
  business: {
    name: string;
    city: string;
    country: string;
    phone: string;
    email: string;
  };
  industryLabel: string;
  brandDescription: string;
  tone: string;
}): Promise<GeneratedBundle> {
  const client = new Anthropic({ apiKey });

  const userMessage = `Generate a complete content bundle for this business.

Business
- Name: ${business.name}
- Industry: ${industryLabel}
- City: ${business.city}${business.country ? ", " + business.country : ""}
- Phone: ${business.phone || "(not provided)"}
- Email: ${business.email || "(not provided)"}

Tone: ${tone || "warm, professional"}

Owner's brand description:
"""
${brandDescription || "(no description provided — infer from industry and city)"}
"""

Generate every field in the output_config schema. Make the content feel like it was written for this exact business: reference ${business.city} naturally, match the tone, use service names and FAQs specific to a ${industryLabel.toLowerCase()}.`;

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    output_config: {
      format: { type: "json_schema", schema: BUNDLE_SCHEMA },
      effort: "high",
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const response = await stream.finalMessage();

  if (response.stop_reason === "refusal") {
    throw new Error("Claude refused to generate content for safety reasons.");
  }
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content returned by the model.");
  }
  try {
    return JSON.parse(textBlock.text) as GeneratedBundle;
  } catch {
    throw new Error("Model returned invalid JSON.");
  }
}
