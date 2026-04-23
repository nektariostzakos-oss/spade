import { prisma, type Trade } from '@toolbox/db';
import { ok } from '@toolbox/shared';

export const listApprenticeships = async (params: {
  trade?: Trade | null;
  state?: string | null;
  paidOnly?: boolean;
  limit?: number;
}) => {
  const rows = await prisma.apprenticeship.findMany({
    where: {
      ...(params.trade ? { trade: params.trade } : {}),
      ...(params.state ? { locationState: params.state } : {}),
      ...(params.paidOnly ? { paid: true } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(params.limit ?? 50, 100),
  });
  return ok(rows);
};
