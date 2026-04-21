import type { Metadata } from "next";
import { listPages } from "../../lib/pages";
import BlogList from "../components/BlogList";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spade.gr";

export const metadata: Metadata = {
  title: "Blog",
  description: "Grooming tips, styling guides and stories from Spade.",
  alternates: {
    canonical: "/blog",
    languages: { "en-US": "/blog", "el-GR": "/blog" },
  },
  openGraph: {
    title: "Blog · Spade Barber Loutraki",
    description: "Grooming tips, styling guides and stories from Spade.",
    url: `${SITE_URL}/blog`,
    type: "website",
    images: [{ url: "/og.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · Spade Barber Loutraki",
    description: "Grooming tips, styling guides and stories from Spade.",
    images: ["/og.jpg"],
  },
};

export default async function BlogIndexPage() {
  const all = await listPages("post");
  const published = all.filter((p) => p.published);
  return <BlogList posts={published} />;
}
