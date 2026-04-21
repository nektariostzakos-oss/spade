import { listPages } from "../../../lib/pages";
import { loadBranding, loadBusiness } from "../../../lib/settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oakline.studio";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [posts, branding, business] = await Promise.all([
    listPages("post").catch(() => []),
    loadBranding().catch(() => ({ wordmark: "Oakline" })),
    loadBusiness().catch(() => ({ name: "Oakline" })),
  ]);
  const published = posts
    .filter((p) => p.published)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 50);

  const brandName = branding.wordmark || business.name || "Oakline";
  const items = published
    .map((p) => {
      const pubDate = p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${escape(p.title_en || p.title_el || "Untitled")}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.category ? `<category>${escape(p.category)}</category>` : ""}
      <description>${escape(p.excerpt_en || p.excerpt_el || "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(brandName)} · Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>${escape(`Latest articles from ${brandName}.`)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=600, stale-while-revalidate=3600",
    },
  });
}
