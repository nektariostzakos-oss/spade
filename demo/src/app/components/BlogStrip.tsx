import Link from "next/link";
import Image from "next/image";
import { listPages } from "../../lib/pages";

export default async function BlogStrip() {
  const all = await listPages("post");
  const posts = all.filter((p) => p.published).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)]">Journal</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Stories from the chair</h2>
          </div>
          <Link href="/blog" className="text-xs uppercase tracking-widest text-white/60 hover:text-[var(--gold)]">
            All posts →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[var(--gold)]/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#14110d]">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.title_en}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-[var(--gold)]">
                  {p.category || "General"}
                </p>
                <h3 className="mt-2 line-clamp-2 font-serif text-xl text-white transition-colors group-hover:text-[var(--gold)]">
                  {p.title_en}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/55">{p.excerpt_en}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
