import BeforeAfter from "./BeforeAfter";
import { listTransformations } from "../../lib/transformations";

export default async function TransformationsStrip() {
  const items = await listTransformations();
  if (items.length === 0) return null;

  return (
    <section className="relative px-6 py-24" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="eyebrow">Before · after</p>
          <h2 className="mt-3 h-section">Drag to see the difference.</h2>
          <p className="mx-auto mt-4 max-w-xl body-prose">
            Three chairs, three before-and-after transformations. Drag the gold handle across each image.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((t) => (
            <article key={t.id} className="group">
              <BeforeAfter before={t.before} after={t.after} alt={t.title_en} />
              <div className="mt-5">
                <h3 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>
                  {t.title_en}
                </h3>
                <p className="mt-1 caption" style={{ color: "var(--muted-2)" }}>
                  {t.caption_en}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
