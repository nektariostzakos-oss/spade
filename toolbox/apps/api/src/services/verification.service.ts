import { prisma, type ProProfile } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

const requireAdmin = async (authed: AuthedUser) => {
  const admin = await prisma.user.findFirst({
    where: { clerkId: authed.clerkId, role: 'ADMIN' },
  });
  if (!admin) return err(appError('FORBIDDEN', 'Admin only'));
  return ok(admin);
};

export const pendingVerifications = async (authed: AuthedUser) => {
  const gate = await requireAdmin(authed);
  if (!gate.ok) return gate;
  const items = await prisma.proProfile.findMany({
    where: {
      OR: [{ licenseStatus: 'PENDING' }, { insuranceStatus: 'PENDING' }],
    },
    include: { user: true },
    orderBy: { updatedAt: 'asc' },
    take: 50,
  });
  return ok(items);
};

export type VerificationDecision = 'approve' | 'reject';

export const decideVerification = async (
  authed: AuthedUser,
  proId: string,
  decision: VerificationDecision,
): Promise<Result<ProProfile>> => {
  const gate = await requireAdmin(authed);
  if (!gate.ok) return gate;
  const status = decision === 'approve' ? 'VERIFIED' : 'REJECTED';
  const updated = await prisma.proProfile.update({
    where: { id: proId },
    data: { licenseStatus: status, insuranceStatus: status },
  });
  return ok(updated);
};
