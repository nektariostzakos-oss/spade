import { prisma } from '@toolbox/db';
import { appError, err, ok, type CreateReviewInput, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

export const createReview = async (
  authed: AuthedUser,
  input: CreateReviewInput,
): Promise<Result<{ reviewId: string }>> => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('UNAUTHORIZED', 'No user'));

  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) return err(appError('NOT_FOUND', 'Booking not found'));
  if (booking.homeownerId !== user.id)
    return err(appError('FORBIDDEN', 'Only the homeowner can review'));
  if (booking.status !== 'COMPLETED')
    return err(appError('CONFLICT', 'Booking is not complete'));

  const existing = await prisma.review.findUnique({ where: { bookingId: booking.id } });
  if (existing) return err(appError('CONFLICT', 'Already reviewed'));

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: {
        bookingId: booking.id,
        raterId: user.id,
        rateeId: booking.proId,
        stars: input.stars,
        text: input.text ?? null,
        photos: input.photos ?? [],
      },
    });
    const agg = await tx.review.aggregate({
      where: { rateeId: booking.proId },
      _avg: { stars: true },
      _count: { _all: true },
    });
    await tx.proProfile.updateMany({
      where: { userId: booking.proId },
      data: {
        ratingAvg: agg._avg.stars ?? 0,
        ratingCount: agg._count._all,
      },
    });
    return r;
  });

  return ok({ reviewId: review.id });
};

export const listReviewsForUser = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: { rateeId: userId },
    include: { rater: { select: { displayName: true, avatarUrl: true, city: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return ok(reviews);
};
