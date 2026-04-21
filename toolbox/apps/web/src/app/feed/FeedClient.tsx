'use client';

import { useAuth } from '@clerk/nextjs';
import MuxPlayer from '@mux/mux-player-react';
import { Bookmark, Heart, Share2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface Item {
  id: string;
  muxPlaybackId: string | null;
  caption: string | null;
  hashtags: string[];
  trade: string | null;
  city: string | null;
  likeCount: number;
  liked?: boolean;
  saved?: boolean;
  creator: { id: string; displayName: string; avatarUrl: string | null; city: string | null };
}

interface FeedResponse {
  items: Item[];
  nextCursor: string | null;
}

export function FeedClient({ initial }: { initial: FeedResponse }) {
  const [items, setItems] = useState<Item[]>(initial.items);
  const [cursor, setCursor] = useState<string | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    const res = await api<FeedResponse>(`/v1/feed?limit=8&cursor=${cursor}`);
    setLoading(false);
    if (res.ok) {
      setItems((prev) => [...prev, ...res.data.items]);
      setCursor(res.data.nextCursor);
    }
  }, [cursor, loading]);

  return (
    <div
      className="h-dvh snap-y snap-mandatory overflow-y-scroll"
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight > el.scrollHeight - el.clientHeight) {
          void loadMore();
        }
      }}
    >
      {items.map((item, i) => (
        <FeedSlide key={item.id} item={item} eager={i < 2} />
      ))}
      {items.length === 0 && (
        <div className="flex h-dvh items-center justify-center px-6 text-center text-text-secondary">
          No videos yet. Be the first.
        </div>
      )}
    </div>
  );
}

function FeedSlide({ item, eager }: { item: Item; eager: boolean }) {
  const { getToken, isSignedIn } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(eager);
  const [liked, setLiked] = useState(Boolean(item.liked));
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [saved, setSaved] = useState(Boolean(item.saved));

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => setActive((entries[0]?.intersectionRatio ?? 0) > 0.7),
      { threshold: [0, 0.7, 1] },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const onLike = async () => {
    if (!isSignedIn) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    const token = await getToken();
    await api(`/v1/videos/${item.id}/like`, { method: 'POST', token });
  };

  const onSave = async () => {
    if (!isSignedIn) return;
    setSaved((s) => !s);
    const token = await getToken();
    await api(`/v1/videos/${item.id}/save`, { method: 'POST', token });
  };

  return (
    <section
      ref={ref}
      className="relative flex h-dvh w-full snap-start snap-always items-center justify-center bg-black"
    >
      <div className="relative h-full w-full max-w-[480px] overflow-hidden">
        {item.muxPlaybackId && (
          <MuxPlayer
            playbackId={item.muxPlaybackId}
            streamType="on-demand"
            autoPlay={active ? 'muted' : false}
            paused={!active}
            muted
            loop
            playsInline
            primaryColor="#FFC107"
            style={{ width: '100%', height: '100%', aspectRatio: '9 / 16' }}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-5">
          <div className="pointer-events-auto max-w-[70%]">
            <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
              @{item.creator.displayName}
              {item.creator.city ? ` · ${item.creator.city}` : ''}
            </p>
            {item.caption && <p className="mt-1 text-base text-text-primary">{item.caption}</p>}
            {item.hashtags.length > 0 && (
              <p className="mt-1 text-sm text-semantic-info">
                {item.hashtags.map((h) => `#${h}`).join(' ')}
              </p>
            )}
          </div>
          <div className="pointer-events-auto flex flex-col items-center gap-4">
            <ActionButton onClick={onLike} active={liked} label={likeCount}>
              <Heart size={28} strokeWidth={2} fill={liked ? '#FFC107' : 'none'} />
            </ActionButton>
            <ActionButton onClick={onSave} active={saved} label="Save">
              <Bookmark size={28} strokeWidth={2} fill={saved ? '#FFC107' : 'none'} />
            </ActionButton>
            <ActionButton onClick={() => navigator.share?.({ url: window.location.href })} label="Share">
              <Share2 size={28} strokeWidth={2} />
            </ActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-tap min-w-tap flex-col items-center gap-1 rounded-full ${
        active ? 'text-accent-primary' : 'text-text-primary'
      }`}
    >
      {children}
      <span className="font-mono text-xs">{label}</span>
    </button>
  );
}
