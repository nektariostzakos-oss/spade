import type { Metadata } from "next";
import About from "../components/About";
import Team from "../components/Team";
import CTA from "../components/CTA";
import TranslatedPageHeader from "../components/TranslatedPageHeader";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_about", { path: "/about" });
}

export default function AboutPage() {
  return (
    <main className="relative">
      <TranslatedPageHeader
        section="page_team"
        eyebrowKey="page.team.eyebrow"
        titleKey="page.team.title"
        subKey="page.team.sub"
      />
      <About />
      <Team />
      <CTA />
    </main>
  );
}
