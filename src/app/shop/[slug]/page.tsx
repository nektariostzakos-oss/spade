import { notFound } from "next/navigation";
import { findProduct, listProducts } from "../../../lib/products";
import ProductDetail from "../../components/ProductDetail";

export async function generateStaticParams() {
  const all = await listProducts();
  return all.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) notFound();
  return (
    <main className="relative pt-32">
      <ProductDetail product={product} />
    </main>
  );
}
