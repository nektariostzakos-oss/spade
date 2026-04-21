import { prisma, type Video } from '@toolbox/db';
import { ok, type Result } from '@toolbox/shared';

export interface FeedItem extends Video {
  creator: { id: string; displayName: string; avatarUrl: string | null; city: string | null };
  liked?: boolean;
  saved?: boolean;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

export const getFeed = async (params: {
  cursor?: string | null;
  limit?: number;
  userId?: string | null;
  city?: string | null;
}): Promise<Result<FeedPage>> => {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
  const cursor = params.cursor ?? undefined;

  const rows = await prisma.video.findMany({
    where: {
      status: 'READY',
      visibility: 'PUBLIC',
      ...(params.city ? { city: params.city } : {}),
    },
    include: {
      creator: { select: { id: true, displayName: true, avatarUrl: true, city: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];

  let liked = new Set<string>();
  let saved = new Set<string>();
  if (params.userId && items.length > 0) {
    const ids = items.map((i) => i.id);
    const [likes, saves] = await Promise.all([
      prisma.like.findMany({
        where: { userId: params.userId, videoId: { in: ids } },
        select: { videoId: true },
      }),
      prisma.savedVideo.findMany({
        where: { userId: params.userId, videoId: { in: ids } },
        select: { videoId: true },
      }),
    ]);
    liked = new Set(likes.map((l) => l.videoId));
    saved = new Set(saves.map((s) => s.videoId));
  }

  return ok({
    items: items.map((v) => ({ ...v, liked: liked.has(v.id), saved: saved.has(v.id) })),
    nextCursor: hasMore && last ? last.id : null,
  });
};
