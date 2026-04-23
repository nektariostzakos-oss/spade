import { prisma } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

const requireUser = async (authed: AuthedUser) => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('UNAUTHORIZED', 'No user'));
  return ok(user);
};

export const toggleLike = async (
  authed: AuthedUser,
  videoId: string,
): Promise<Result<{ liked: boolean; likeCount: number }>> => {
  const gate = await requireUser(authed);
  if (!gate.ok) return gate;
  const user = gate.data;
  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId: user.id, videoId } },
  });
  if (existing) {
    const [, video] = await prisma.$transaction([
      prisma.like.delete({ where: { userId_videoId: { userId: user.id, videoId } } }),
      prisma.video.update({
        where: { id: videoId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);
    return ok({ liked: false, likeCount: video.likeCount });
  }
  const [, video] = await prisma.$transaction([
    prisma.like.create({ data: { userId: user.id, videoId } }),
    prisma.video.update({
      where: { id: videoId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    }),
  ]);
  return ok({ liked: true, likeCount: video.likeCount });
};

export const toggleSave = async (
  authed: AuthedUser,
  videoId: string,
): Promise<Result<{ saved: boolean }>> => {
  const gate = await requireUser(authed);
  if (!gate.ok) return gate;
  const user = gate.data;
  const existing = await prisma.savedVideo.findUnique({
    where: { userId_videoId: { userId: user.id, videoId } },
  });
  if (existing) {
    await prisma.savedVideo.delete({
      where: { userId_videoId: { userId: user.id, videoId } },
    });
    return ok({ saved: false });
  }
  await prisma.savedVideo.create({ data: { userId: user.id, videoId } });
  return ok({ saved: true });
};

export const toggleFollow = async (
  authed: AuthedUser,
  targetUserId: string,
): Promise<Result<{ following: boolean }>> => {
  const gate = await requireUser(authed);
  if (!gate.ok) return gate;
  if (gate.data.id === targetUserId)
    return err(appError('VALIDATION', 'Cannot follow yourself'));
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: gate.data.id, followingId: targetUserId } },
  });
  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId: gate.data.id, followingId: targetUserId },
      },
    });
    return ok({ following: false });
  }
  await prisma.follow.create({
    data: { followerId: gate.data.id, followingId: targetUserId },
  });
  return ok({ following: true });
};
