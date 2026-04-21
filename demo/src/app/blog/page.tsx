import type { Metadata } from "next";
import { listPages } from "../../lib/pages";
import BlogList from "../components/BlogList";

export const metadata: Metadata = {
  title: "Blog",
  description: "Grooming tips, styling guides and stories from Spade.",
};

export default async function BlogIndexPage() {
  const all = await listPages("post");
  const published = all.filter((p) => p.published);
  return <BlogList posts={published} />;
}
