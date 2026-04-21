import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oakline.studio";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Meta-ExternalAgent",
  "DuckAssistBot",
  "Amazonbot",
  "cohere-ai",
  "FacebookBot",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/setup"],
      },
      ...AI_CRAWLERS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/setup"],
      })),
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/llms.txt`],
    host: SITE_URL,
  };
}
