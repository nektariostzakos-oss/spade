import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFlow from "../components/BookingFlow";
import TranslatedPageHeader from "../components/TranslatedPageHeader";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_book", { path: "/book" });
}

export default function BookPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_book"
        eyebrowKey="page.book.eyebrow"
        titleKey="page.book.title"
        subKey="page.book.sub"
      />
      <Suspense fallback={<div className="px-6 py-20 text-center opacity-40">…</div>}>
        <BookingFlow />
      </Suspense>
    </main>
  );
}
