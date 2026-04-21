import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { inboxForPro, markLeadViewed, respondToLead } from '../services/lead.service';
import { getOrCreateConnectLink } from '../services/payout.service';

export async function leadsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/leads/inbox', async (request) => {
    const authed = request.requireAuth();
    return inboxForPro(authed);
  });

  app.post(
    '/leads/:id/viewed',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => markLeadViewed(request.requireAuth(), request.params.id),
  );

  app.post(
    '/leads/:id/respond',
    {
      schema: {
        params: z.object({ id: z.string().min(1) }),
        body: z.object({ accept: z.boolean() }),
      },
    },
    async (request) =>
      respondToLead(request.requireAuth(), request.params.id, request.body.accept),
  );

  app.post('/payouts/connect-link', async (request) =>
    getOrCreateConnectLink(request.requireAuth()),
  );
}
