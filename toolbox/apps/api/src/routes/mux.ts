import { muxWebhookEvent } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import { handleMuxWebhook } from '../services/mux.service';

export async function muxRoutes(app: FastifyInstance): Promise<void> {
  app.post('/mux', async (request, reply) => {
    const parsed = muxWebhookEvent.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ ok: false });
    const res = await handleMuxWebhook(parsed.data);
    return reply.status(res.ok ? 200 : 400).send(res);
  });
}
