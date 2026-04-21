import type { Metadata } from "next";
import ContactInfo from "../components/ContactInfo";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_contact", { path: "/contact" });
}

export default function ContactPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_contact"
        eyebrowKey="page.contact.eyebrow"
        titleKey="page.contact.title"
        subKey="page.contact.sub"
      />
      <ContactInfo />
      <CTA />
    </main>
  );
}
