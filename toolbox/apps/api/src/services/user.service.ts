import { prisma, type User } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

export const getOrCreateUser = async (authed: AuthedUser): Promise<Result<User>> => {
  const existing = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (existing) return ok(existing);
  try {
    const created = await prisma.user.create({
      data: {
        clerkId: authed.clerkId,
        email: authed.email,
        phone: authed.phone,
        displayName:
          authed.email?.split('@')[0] ??
          authed.phone ??
          `user_${authed.clerkId.slice(-6)}`,
      },
    });
    return ok(created);
  } catch (e) {
    return err(appError('INTERNAL', 'Failed to bootstrap user', { cause: String(e) }));
  }
};

export const getMe = async (authed: AuthedUser): Promise<Result<User & { proProfile: unknown }>> => {
  const user = await prisma.user.findUnique({
    where: { clerkId: authed.clerkId },
    include: { proProfile: true },
  });
  if (!user) return err(appError('NOT_FOUND', 'User not found'));
  return ok(user);
};
