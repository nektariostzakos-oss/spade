import type { Metadata } from "next";
import GalleryGrid from "../components/GalleryGrid";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_gallery", { path: "/gallery" });
}

export default function GalleryPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_gallery"
        eyebrowKey="page.gallery.eyebrow"
        titleKey="page.gallery.title"
        subKey="page.gallery.sub"
      />
      <GalleryGrid />
      <CTA />
    </main>
  );
}
