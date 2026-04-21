import type { MetadataRoute } from "next";
import { listProducts } from "../lib/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spade.gr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/services",
    "/shop",
    "/gallery",
    "/about",
    "/contact",
    "/book",
    "/cart",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/book" ? 0.9 : 0.7,
  }));

  let products: MetadataRoute.Sitemap = [];
  try {
    const list = await listProducts();
    products = list.map((p) => ({
        url: `${SITE_URL}/shop/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    // products file may be empty on first deploy; skip
  }

  return [...staticPages, ...products];
}
