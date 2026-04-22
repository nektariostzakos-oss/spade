import Link from "next/link";

export const metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function ShopThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-lg rounded-2xl border p-10 text-center"
        style={{ borderColor: "color-mix(in srgb, var(--gold) 40%, transparent)", background: "color-mix(in srgb, var(--gold) 6%, transparent)" }}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a961] text-2xl text-black">
          ✓
        </div>
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Payment received.
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
          Thank you — we&rsquo;ll prepare your order. A receipt from our payment
          provider is on its way to your inbox.
        </p>
        {order && (
          <p className="mt-6 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-2)" }}>
            Order · {order}
          </p>
        )}
        <Link
          href="/shop"
          className="mt-10 inline-flex items-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-widest"
          style={{ background: "var(--gold)", color: "var(--background)" }}
        >
          Keep shopping
        </Link>
      </div>
    </main>
  );
}
