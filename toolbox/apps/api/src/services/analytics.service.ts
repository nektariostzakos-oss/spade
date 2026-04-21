import { prisma } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

export interface ProAnalytics {
  window: { fromDate: Date; toDate: Date };
  views: number;
  videoCount: number;
  followers: number;
  leadsReceived: number;
  leadsAccepted: number;
  responseRate: number;
  earningsCents: number;
  topVideos: Array<{ id: string; caption: string | null; viewCount: number; likeCount: number }>;
}

export const proAnalytics = async (authed: AuthedUser): Promise<Result<ProAnalytics>> => {
  const user = await prisma.user.findUnique({
    where: { clerkId: authed.clerkId },
    include: { proProfile: true },
  });
  if (!user?.proProfile) return err(appError('NOT_FOUND', 'No pro profile'));
  const pro = user.proProfile;

  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [videos, leads, bookings, followers] = await Promise.all([
    prisma.video.findMany({
      where: { creatorId: user.id },
      orderBy: { viewCount: 'desc' },
    }),
    prisma.lead.findMany({
      where: { proId: pro.id, sentAt: { gte: fromDate } },
    }),
    prisma.booking.aggregate({
      where: { proId: user.id, completedAt: { gte: fromDate } },
      _sum: { amountCents: true, platformFeeCents: true },
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
  ]);

  const accepted = leads.filter((l) => l.status === 'ACCEPTED' || l.status === 'WON').length;
  const responded = leads.filter((l) => l.respondedAt !== null).length;

  const gross = bookings._sum.amountCents ?? 0;
  const fees = bookings._sum.platformFeeCents ?? 0;

  return ok({
    window: { fromDate, toDate },
    views: videos.reduce((a, v) => a + v.viewCount, 0),
    videoCount: videos.length,
    followers,
    leadsReceived: leads.length,
    leadsAccepted: accepted,
    responseRate: leads.length === 0 ? 0 : responded / leads.length,
    earningsCents: gross - fees,
    topVideos: videos
      .slice(0, 5)
      .map(({ id, caption, viewCount, likeCount }) => ({ id, caption, viewCount, likeCount })),
  });
};
