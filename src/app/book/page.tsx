import { Suspense } from "react";
import BookingFlow from "../components/BookingFlow";
import TranslatedPageHeader from "../components/TranslatedPageHeader";

export const metadata = {
  title: "Book a chair — Spade Barber",
};

export default function BookPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_book"
        eyebrowKey="page.book.eyebrow"
        titleKey="page.book.title"
        subKey="page.book.sub"
      />
      <Suspense
        fallback={
          <div className="px-6 py-20 text-center text-white/40">…</div>
        }
      >
        <BookingFlow />
      </Suspense>
    </main>
  );
}
