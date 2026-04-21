import ServicesMenu from "../components/ServicesMenu";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";

export const metadata = {
  title: "Services — Spade Barber",
};

export default function ServicesPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_services"
        eyebrowKey="page.services.eyebrow"
        titleKey="page.services.title"
        subKey="page.services.sub"
      />
      <ServicesMenu />
      <FAQ />
      <CTA />
    </main>
  );
}
