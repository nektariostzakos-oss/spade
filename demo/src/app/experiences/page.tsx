import type { Metadata } from "next";
import ServicesMenu from "../components/ServicesMenu";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import { buildPageMetadata } from "../../lib/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("seo_services", { path: "/experiences" });
}

export default function ExperiencesPage() {
  return (
    <main className="relative">
      <section className="px-6 pt-24 pb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--gold)" }}>
          Beyond the table
        </p>
        <h1 className="mt-3 font-serif text-5xl sm:text-6xl" style={{ color: "var(--foreground)" }}>
          Experiences.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm" style={{ color: "var(--muted)" }}>
          Private dining, chef's table, wine pairings, and a two-hour pasta class with Marco. Reserve any of them separately.
        </p>
      </section>
      <ServicesMenu />
      <FAQ />
      <CTA />
    </main>
  );
}
