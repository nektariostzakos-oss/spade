import Hero from "./components/Hero";
import InfoStrip from "./components/InfoStrip";
import ServicesPreview from "./components/ServicesPreview";
import ShopPreview from "./components/ShopPreview";
import GalleryStrip from "./components/GalleryStrip";
import BlogStrip from "./components/BlogStrip";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <InfoStrip />
      <ServicesPreview />
      <ShopPreview />
      <GalleryStrip />
      <BlogStrip />
      <Testimonials />
      <CTA />
    </main>
  );
}
