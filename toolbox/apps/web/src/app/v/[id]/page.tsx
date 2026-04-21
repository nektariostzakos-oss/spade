import { api } from '@/lib/api';
import type { Video } from '@toolbox/shared';
import { notFound } from 'next/navigation';
import { Player } from './Player';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  const res = await api<Video>(`/v1/videos/${id}`);
  if (!res.ok) notFound();
  const v = res.data;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col gap-4 px-0 py-6 md:py-12">
      <div className="aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
        {v.muxPlaybackId && <Player playbackId={v.muxPlaybackId} />}
      </div>
      <div className="px-5">
        {v.caption && <p className="text-base text-text-primary">{v.caption}</p>}
        {v.hashtags.length > 0 && (
          <p className="mt-2 text-sm text-semantic-info">
            {v.hashtags.map((h) => `#${h}`).join(' ')}
          </p>
        )}
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-text-tertiary">
          {v.trade ?? ''} {v.city ? `· ${v.city}` : ''}
        </p>
      </div>
    </main>
  );
}
