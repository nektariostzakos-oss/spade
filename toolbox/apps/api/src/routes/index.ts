import type { FastifyInstance } from 'fastify';
import { adminRoutes } from './admin';
import { analyticsRoutes } from './analytics';
import { apprenticeshipRoutes } from './apprenticeships';
import { authRoutes } from './auth';
import { feedRoutes } from './feed';
import { healthRoutes } from './health';
import { jobsRoutes } from './jobs';
import { leadsRoutes } from './leads';
import { liveRoutes } from './live';
import { muxRoutes } from './mux';
import { proRoutes } from './pros';
import { reviewRoutes } from './reviews';
import { socialRoutes } from './social';
import { stripeRoutes } from './stripe';
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
      await jobsRoutes(v1);
      await leadsRoutes(v1);
      await reviewRoutes(v1);
      await analyticsRoutes(v1);
      await liveRoutes(v1);
      await apprenticeshipRoutes(v1);
      await adminRoutes(v1);
    },
    { prefix: '/v1' },
  );
  await app.register(muxRoutes, { prefix: '/webhooks' });
  await app.register(stripeRoutes, { prefix: '/webhooks' });
}
