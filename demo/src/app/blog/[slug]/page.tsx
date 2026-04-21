import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { findPage, listPages } from "../../../lib/pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await findPage(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.title_en,
    description: p.excerpt_en,
    openGraph: {
      title: p.title_en,
      description: p.excerpt_en,
      images: p.image ? [{ url: p.image }] : [],
      type: "article",
      publishedTime: p.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPage(slug);
  if (!post || !post.published || post.kind !== "post") notFound();
  const all = await listPages("post");
  const related = all
    .filter((p) => p.published && p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <article className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-[10px] uppercase tracking-widest text-white/50 hover:text-[#c9a961]">
          ← Blog
        </Link>
        <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">
          {post.category || "General"}
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{post.title_en}</h1>
        <p className="mt-4 text-sm text-white/50">
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {post.image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-[#14110d]">
            <Image
              src={post.image}
              alt={post.title_en}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-drop-cap mt-12 max-w-none prose-headings:font-serif prose-headings:text-[var(--foreground)] prose-headings:tracking-tight prose-p:text-[var(--muted)] prose-p:leading-[1.85] prose-a:text-[var(--gold)] prose-strong:text-[var(--foreground)]"
          dangerouslySetInnerHTML={{ __html: renderBody(post.body_en) }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-6xl">
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-[#c9a961]">Related</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[#c9a961]/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#14110d]">
                  {r.image && (
                    <Image src={r.image} alt={r.title_en} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#c9a961]">{r.category}</p>
                  <h3 className="mt-1 font-serif text-lg text-white">{r.title_en}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function renderBody(body: string): string {
  if (!body) return "";
  if (/<[a-z][\s\S]*>/i.test(body)) return body;
  return body
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}
