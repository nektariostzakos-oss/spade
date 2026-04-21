import { embedText, toPgVector } from '@toolbox/ai';
import { prisma, Prisma, type ProProfile } from '@toolbox/db';
import {
  appError,
  err,
  ok,
  type ProOnboardingInput,
  type Result,
} from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

export const onboardPro = async (
  authed: AuthedUser,
  input: ProOnboardingInput,
): Promise<Result<ProProfile>> => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('NOT_FOUND', 'Sign in before onboarding'));

  const existing = await prisma.proProfile.findUnique({ where: { userId: user.id } });
  if (existing) return err(appError('CONFLICT', 'Pro profile already exists'));

  const textForEmbedding = [
    input.businessName,
    input.bio ?? '',
    input.trades.join(', '),
    input.city,
  ]
    .filter(Boolean)
    .join('\n');

  const embedding = await embedText(textForEmbedding);

  const pro = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        role: 'PRO',
        displayName: input.businessName,
        bio: input.bio ?? undefined,
        avatarUrl: input.avatarUrl ?? undefined,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        city: input.city,
        country: input.country,
      },
    });
    const created = await tx.proProfile.create({
      data: {
        userId: user.id,
        businessName: input.businessName,
        trades: input.trades,
        serviceRadiusKm: input.serviceRadiusKm,
        licenseNumber: input.licenseNumber,
        licenseState: input.licenseState,
        licenseDocumentUrl: input.licenseDocumentUrl,
        insuranceDocumentUrl: input.insuranceDocumentUrl,
      },
    });
    await tx.$executeRaw(
      Prisma.sql`UPDATE "ProProfile" SET embedding = ${toPgVector(embedding)}::vector WHERE id = ${created.id}`,
    );
    return created;
  });

  return ok(pro);
};

export const getMyProProfile = async (
  authed: AuthedUser,
): Promise<Result<ProProfile>> => {
  const profile = await prisma.proProfile.findFirst({
    where: { user: { clerkId: authed.clerkId } },
  });
  if (!profile) return err(appError('NOT_FOUND', 'No pro profile'));
  return ok(profile);
};
