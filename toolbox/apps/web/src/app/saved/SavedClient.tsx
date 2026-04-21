'use client';

import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Video {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  creator: { displayName: string; city: string | null };
}

export function SavedClient() {
  const { getToken } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    let live = true;
    (async () => {
      const token = await getToken();
      const res = await api<Video[]>('/v1/me/saves', { token });
      if (live && res.ok) setVideos(res.data);
    })();
    return () => {
      live = false;
    };
  }, [getToken]);

  if (videos.length === 0) return <p className="text-text-secondary">No saves yet.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {videos.map((v) => (
        <Link
          key={v.id}
          href={`/v/${v.id}`}
          className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-black"
        >
          {v.thumbnailUrl && (
            <Image
              src={v.thumbnailUrl}
              alt={v.caption ?? ''}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition group-hover:scale-105"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="line-clamp-2 text-xs text-text-primary">{v.caption ?? ''}</p>
            <p className="font-mono text-[10px] uppercase text-text-tertiary">
              @{v.creator.displayName}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
