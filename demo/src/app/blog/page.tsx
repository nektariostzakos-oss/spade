import type { Metadata } from "next";
import { listPages } from "../../lib/pages";
import BlogList from "../components/BlogList";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursalon.local";

export const metadata: Metadata = {
  title: "Blog",
  description: "Cutting technique, colour science and studio stories from Your Salon.",
  alternates: {
    canonical: "/blog",
    languages: { "en-GB": "/blog", "en-US": "/blog" },
  },
  openGraph: {
    title: "Blog · Your Salon",
    description: "Cutting technique, colour science and studio stories from Your Salon.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · Your Salon",
    description: "Cutting technique, colour science and studio stories from Your Salon.",
  },
};

export default async function BlogIndexPage() {
  const all = await listPages("post");
  const published = all.filter((p) => p.published);
  return <BlogList posts={published} />;
}
