import type { Metadata } from "next";
import MenuList from "../components/MenuList";
import CTA from "../components/CTA";
import { listProducts } from "../../lib/products";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_shop", { path: "/menu" });
}

export default async function MenuPage() {
  const products = await listProducts();
  return (
    <main className="relative">
      <section className="px-6 pt-24 pb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--gold)" }}>
          Our menu
        </p>
        <h1 className="mt-3 font-serif text-5xl sm:text-6xl" style={{ color: "var(--foreground)" }}>
          The full menu.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm" style={{ color: "var(--muted)" }}>
          Five courses, cooked the way we were taught. The staples never change; five or six dishes rotate every ten days with the market.
        </p>
      </section>
      <MenuList products={products} />
      <CTA />
    </main>
  );
}
