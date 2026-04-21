'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Analytics {
  views: number;
  videoCount: number;
  followers: number;
  leadsReceived: number;
  leadsAccepted: number;
  responseRate: number;
  earningsCents: number;
  topVideos: Array<{ id: string; caption: string | null; viewCount: number; likeCount: number }>;
}

export function DashboardClient() {
  const { getToken } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const token = await getToken();
      const res = await api<Analytics>('/v1/me/analytics', { token });
      if (!live) return;
      if (res.ok) setData(res.data);
      else setErr(res.error.message);
    })();
    return () => {
      live = false;
    };
  }, [getToken]);

  if (err) return <p className="text-semantic-danger">{err}</p>;
  if (!data) return <p className="text-text-secondary">Loading…</p>;

  return (
    <>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Views" value={data.views.toLocaleString()} />
        <Stat label="Leads" value={`${data.leadsReceived}`} sub={`${data.leadsAccepted} accepted`} />
        <Stat label="Response rate" value={`${Math.round(data.responseRate * 100)}%`} />
        <Stat label="Earnings" value={`$${(data.earningsCents / 100).toFixed(0)}`} />
      </section>
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-text-secondary">
          Top videos
        </h2>
        <div className="flex flex-col gap-2">
          {data.topVideos.map((v) => (
            <a
              key={v.id}
              href={`/v/${v.id}`}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-1 px-4 py-3 hover:border-border-default"
            >
              <span className="truncate text-text-primary">
                {v.caption ?? '(no caption)'}
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                {v.viewCount.toLocaleString()} views · {v.likeCount} likes
              </span>
            </a>
          ))}
          {data.topVideos.length === 0 && (
            <p className="text-text-tertiary">No videos posted yet.</p>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-1 p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">{label}</p>
      <p className="mt-1 text-3xl font-black text-text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-tertiary">{sub}</p>}
    </div>
  );
}
