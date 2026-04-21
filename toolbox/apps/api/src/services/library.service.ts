import { prisma } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

export const mySaves = async (authed: AuthedUser): Promise<Result<unknown>> => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('UNAUTHORIZED', 'No user'));
  const saves = await prisma.savedVideo.findMany({
    where: { userId: user.id },
    include: {
      video: {
        include: {
          creator: { select: { id: true, displayName: true, avatarUrl: true, city: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return ok(saves.map((s) => s.video));
};

export const publicProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { proProfile: true },
  });
  if (!user) return err(appError('NOT_FOUND', 'User not found'));
  const [videos, reviews, followerCount] = await Promise.all([
    prisma.video.findMany({
      where: { creatorId: user.id, status: 'READY', visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      take: 24,
    }),
    prisma.review.findMany({
      where: { rateeId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
  ]);
  return ok({ user, videos, reviews, followerCount });
};
