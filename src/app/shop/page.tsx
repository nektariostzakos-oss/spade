import TranslatedPageHeader from "../components/TranslatedPageHeader";
import ShopGrid from "../components/ShopGrid";
import CTA from "../components/CTA";
import { listProducts } from "../../lib/products";

export const metadata = {
  title: "Shop — Spade Barber",
};

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
