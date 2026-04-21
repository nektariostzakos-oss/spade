import type { FastifyInstance } from 'fastify';
import { adminRoutes } from './admin';
import { authRoutes } from './auth';
import { feedRoutes } from './feed';
import { healthRoutes } from './health';
import { muxRoutes } from './mux';
import { proRoutes } from './pros';
import { socialRoutes } from './social';
import { videoRoutes } from './videos';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(
    async (v1) => {
      await healthRoutes(v1);
      await authRoutes(v1);
      await proRoutes(v1);
      await videoRoutes(v1);
      await feedRoutes(v1);
      await socialRoutes(v1);
      await adminRoutes(v1);
    },
    { prefix: '/v1' },
  );
  await app.register(muxRoutes, { prefix: '/webhooks' });
}
