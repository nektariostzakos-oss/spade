import { prisma } from '@/lib/prisma';
import { decideVerification } from './actions';

export default async function VerificationQueue() {
  const items = await prisma.proProfile.findMany({
    where: { OR: [{ licenseStatus: 'PENDING' }, { insuranceStatus: 'PENDING' }] },
    include: { user: true },
    orderBy: { updatedAt: 'asc' },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold">Verification queue</h1>
      <p className="mb-6 text-sm text-[#A8A8A8]">
        {items.length} pro{items.length === 1 ? '' : 's'} awaiting decision.
      </p>
      <div className="flex flex-col gap-4">
        {items.map((p) => (
          <article
            key={p.id}
            className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-5"
          >
            <header className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold">{p.businessName}</h2>
                <p className="text-sm text-[#A8A8A8]">
                  {p.user.displayName} · {p.user.city ?? 'unknown city'}
                </p>
                <p className="mt-1 font-mono text-xs uppercase text-[#6E6E6E]">
                  Trades: {p.trades.join(', ') || '—'} · Radius {p.serviceRadiusKm}km
                </p>
              </div>
              <div className="flex gap-2">
                <form action={decideVerification.bind(null, p.id, 'approve')}>
                  <button
                    type="submit"
                    className="h-10 rounded-md bg-[#FFC107] px-4 font-bold text-[#0A0A0A]"
                  >
                    Approve
                  </button>
                </form>
                <form action={decideVerification.bind(null, p.id, 'reject')}>
                  <button
                    type="submit"
                    className="h-10 rounded-md border border-[#3A3A3A] px-4 text-[#FAFAFA] hover:border-[#EF4444]"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </header>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <Doc label="License" status={p.licenseStatus} url={p.licenseDocumentUrl} />
              <Doc label="Insurance" status={p.insuranceStatus} url={p.insuranceDocumentUrl} />
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-10 text-center text-[#A8A8A8]">
            Inbox zero. Nothing to verify.
          </p>
        )}
      </div>
    </main>
  );
}

function Doc({ label, status, url }: { label: string; status: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2">
      <div>
        <p className="text-xs uppercase text-[#6E6E6E]">{label}</p>
        <p className="text-sm">{status}</p>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#0EA5E9] hover:underline"
        >
          View
        </a>
      ) : (
        <span className="text-sm text-[#6E6E6E]">No doc</span>
      )}
    </div>
  );
}
