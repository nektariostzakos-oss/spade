import type { FastifyInstance } from 'fastify';
import { listActiveStreams, startLive } from '../services/live.service';

export async function liveRoutes(app: FastifyInstance): Promise<void> {
  app.post('/live/start', async (request) => startLive(request.requireAuth()));
  app.get('/live/active', async () => listActiveStreams());
}
