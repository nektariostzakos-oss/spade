import Link from "next/link";

export const metadata = {
  title: "Page not found — Oakline Scissors",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--gold)" }}>
          404
        </p>
        <h1
          className="mt-3 font-serif text-4xl sm:text-5xl"
          style={{ color: "var(--foreground)" }}
        >
          Lost the thread.
        </h1>
        <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
          That page moved, renamed, or was never here. Try one of these instead:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "var(--gold)", color: "var(--background)" }}
          >
            Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            Services
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            Book
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
