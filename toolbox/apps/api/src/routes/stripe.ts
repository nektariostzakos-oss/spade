import type { FastifyInstance } from 'fastify';
import { prisma } from '@toolbox/db';

export async function stripeRoutes(app: FastifyInstance): Promise<void> {
  app.post('/stripe', { config: { rawBody: true } }, async (request, reply) => {
    const event = request.body as { type: string; data: { object: Record<string, unknown> } };
    if (!event?.type) return reply.status(400).send({ ok: false });

    if (event.type === 'account.updated') {
      const acct = event.data.object as { id?: string; payouts_enabled?: boolean };
      if (acct.id && acct.payouts_enabled !== undefined) {
        await prisma.proProfile.updateMany({
          where: { stripeAccountId: acct.id },
          data: {},
        });
      }
    }
    return reply.status(200).send({ ok: true });
  });
}
