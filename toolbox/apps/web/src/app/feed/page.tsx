import { api } from '@/lib/api';
import { FeedClient } from './FeedClient';

interface FeedResponse {
  items: Array<{
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
  }>;
  nextCursor: string | null;
}

export default async function FeedPage() {
  const initial = await api<FeedResponse>('/v1/feed?limit=8');
  return (
    <main className="min-h-dvh bg-black">
      <FeedClient initial={initial.ok ? initial.data : { items: [], nextCursor: null }} />
    </main>
  );
}
