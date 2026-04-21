import type { Metadata } from "next";
import ServicesMenu from "../components/ServicesMenu";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_services", { path: "/services" });
}

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
