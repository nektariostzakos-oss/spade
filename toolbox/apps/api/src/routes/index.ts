import type { FastifyInstance } from 'fastify';
import { adminRoutes } from './admin';
import { authRoutes } from './auth';
import { healthRoutes } from './health';
import { proRoutes } from './pros';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(
    async (v1) => {
      await healthRoutes(v1);
      await authRoutes(v1);
      await proRoutes(v1);
      await adminRoutes(v1);
    },
    { prefix: '/v1' },
  );
}
