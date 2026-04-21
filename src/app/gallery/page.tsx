import GalleryGrid from "../components/GalleryGrid";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";

export const metadata = {
  title: "Gallery — Spade Barber",
};

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
