import { prisma } from '@toolbox/db';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const job = await prisma.job.findFirst({
    where: { id, homeowner: { clerkId: userId } },
    include: {
      leads: {
        include: { pro: { include: { user: true } } },
        orderBy: { matchScore: 'desc' },
      },
    },
  });
  if (!job) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
          {job.status} · {job.urgency}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{job.description}</h1>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-text-secondary">
          Matched pros ({job.leads.length})
        </h2>
        <div className="flex flex-col gap-3">
          {job.leads.map((l) => (
            <article
              key={l.id}
              className="rounded-lg border border-border-subtle bg-surface-1 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{l.pro.businessName}</p>
                  <p className="text-sm text-text-secondary">
                    {l.pro.user.city ?? '—'} · {l.distanceKm.toFixed(1)}km · ★ {l.pro.ratingAvg.toFixed(1)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    l.status === 'ACCEPTED'
                      ? 'bg-semantic-success text-text-inverse'
                      : l.status === 'DECLINED' || l.status === 'EXPIRED'
                        ? 'bg-surface-2 text-text-tertiary'
                        : 'bg-accent-primary text-text-inverse'
                  }`}
                >
                  {l.status}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-text-tertiary">
                match {(l.matchScore * 100).toFixed(0)}%
              </p>
            </article>
          ))}
          {job.leads.length === 0 && (
            <p className="rounded-lg border border-border-subtle bg-surface-1 p-6 text-center text-text-secondary">
              No pros available nearby yet. We'll keep looking.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
