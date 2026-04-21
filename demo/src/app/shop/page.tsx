import type { Metadata } from "next";
import TranslatedPageHeader from "../components/TranslatedPageHeader";
import ShopGrid from "../components/ShopGrid";
import CTA from "../components/CTA";
import { listProducts } from "../../lib/products";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_shop", { path: "/shop" });
}

export default async function ShopPage() {
  const products = await listProducts();
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_shop"
        eyebrowKey="page.shop.eyebrow"
        titleKey="page.shop.title"
        subKey="page.shop.sub"
      />
      <ShopGrid products={products} />
      <CTA />
    </main>
  );
}
