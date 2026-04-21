import ContactInfo from "../components/ContactInfo";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";

export const metadata = {
  title: "Contact — Spade Barber",
};

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
