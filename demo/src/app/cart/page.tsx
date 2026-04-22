import TranslatedPageHeader from "../components/TranslatedPageHeader";
import CartView from "../components/CartView";

export const metadata = {
  title: "Cart — Your Salon",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_cart"
        eyebrowKey="page.cart.eyebrow"
        titleKey="page.cart.title"
        subKey="page.cart.sub"
      />
      <CartView />
    </main>
  );
}
