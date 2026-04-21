import TranslatedPageHeader from "../components/TranslatedPageHeader";
import CartView from "../components/CartView";

export const metadata = {
  title: "Cart — Spade Barber",
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
