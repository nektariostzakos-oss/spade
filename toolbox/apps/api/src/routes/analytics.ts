import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { proAnalytics } from '../services/analytics.service';
import { mySaves, publicProfile } from '../services/library.service';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/me/analytics', async (request) => proAnalytics(request.requireAuth()));
  app.get('/me/saves', async (request) => mySaves(request.requireAuth()));
  app.get(
    '/users/:id',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => publicProfile(request.params.id),
  );
}
