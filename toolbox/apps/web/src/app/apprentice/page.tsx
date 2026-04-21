import { api } from '@/lib/api';

interface Apprenticeship {
  id: string;
  title: string;
  trade: string;
  locationCity: string | null;
  locationState: string | null;
  paid: boolean;
  durationMonths: number | null;
  description: string;
}

export default async function ApprenticePage() {
  const res = await api<Apprenticeship[]>('/v1/apprenticeships?limit=50');
  const items = res.ok ? res.data : [];

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
          Apprentice mode
        </p>
        <h1 className="mt-1 text-3xl font-bold">Trade careers, not college debt</h1>
        <p className="mt-2 max-w-xl text-text-secondary">
          Paid apprenticeships near you. No tuition, real tools, real money from day one.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-text-secondary">
          Open programs ({items.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((a) => (
            <article
              key={a.id}
              className="rounded-lg border border-border-subtle bg-surface-1 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-accent-primary">
                  {a.trade.toLowerCase().replace('_', ' ')}
                </span>
                {a.paid && (
                  <span className="rounded-full bg-semantic-success px-2 py-0.5 text-xs font-bold uppercase text-text-inverse">
                    Paid
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-lg font-semibold">{a.title}</h3>
              <p className="text-sm text-text-secondary">
                {[a.locationCity, a.locationState].filter(Boolean).join(', ')}
                {a.durationMonths ? ` · ${a.durationMonths} mo` : ''}
              </p>
              <p className="mt-2 text-sm text-text-primary">{a.description}</p>
            </article>
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-text-tertiary">No programs listed yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
