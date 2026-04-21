import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

function pick(re: RegExp, html: string): string {
  const m = html.match(re);
  return m ? (m[1] || "").trim() : "";
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  let url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  let html = "";
  let finalUrl = url;
  try {
    const r = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 AtelierImport/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    finalUrl = r.url || url;
    html = await r.text();
  } catch {
    return NextResponse.json({ error: "Could not reach that URL." }, { status: 400 });
  }

  const title = pick(/<title[^>]*>([^<]+)<\/title>/i, html);
  const description =
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i, html) ||
    pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i, html);
  const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, html);
  const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i, html);
  const icon =
    pick(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i, html) ||
    pick(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i, html);
  const phone = pick(/(?:tel:|"telephone"\s*:\s*")(\+?[\d\s\-().]{6,})/i, html);
  const email =
    pick(/mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i, html) ||
    pick(/"email"\s*:\s*"([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})"/i, html);
  const address = pick(/"streetAddress"\s*:\s*"([^"]+)"/i, html);
  const city = pick(/"addressLocality"\s*:\s*"([^"]+)"/i, html);
  const postal = pick(/"postalCode"\s*:\s*"([^"]+)"/i, html);
  const country = pick(/"addressCountry"\s*:\s*"([^"]+)"/i, html);

  return NextResponse.json({
    ok: true,
    source: finalUrl,
    title: ogTitle || title,
    description,
    favicon: icon ? resolveUrl(finalUrl, icon) : "",
    ogImage: ogImage ? resolveUrl(finalUrl, ogImage) : "",
    phone,
    email,
    address,
    city,
    postal,
    country,
  });
}
