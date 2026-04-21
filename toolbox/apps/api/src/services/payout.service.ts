import { prisma, type ProProfile } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';
import { createExpressAccount, createOnboardingLink } from './stripe.service';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';

export const getOrCreateConnectLink = async (
  authed: AuthedUser,
): Promise<Result<{ url: string; accountId: string }>> => {
  const user = await prisma.user.findUnique({
    where: { clerkId: authed.clerkId },
    include: { proProfile: true },
  });
  if (!user?.proProfile) return err(appError('NOT_FOUND', 'No pro profile'));

  let pro: ProProfile = user.proProfile;
  if (!pro.stripeAccountId) {
    const account = await createExpressAccount({
      email: user.email,
      country: user.country ?? 'US',
    });
    pro = await prisma.proProfile.update({
      where: { id: pro.id },
      data: { stripeAccountId: account.id },
    });
  }

  const link = await createOnboardingLink(
    pro.stripeAccountId!,
    `${WEB_URL}/profile?payout=refresh`,
    `${WEB_URL}/profile?payout=done`,
  );
  return ok({ url: link.url, accountId: pro.stripeAccountId! });
};
