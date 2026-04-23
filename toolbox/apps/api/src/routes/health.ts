import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const healthResponse = z.object({
  ok: z.literal(true),
  service: z.string(),
  version: z.string(),
  uptimeSec: z.number(),
});

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      schema: {
        response: { 200: healthResponse },
      },
    },
    async () => ({
      ok: true as const,
      service: 'toolbox-api',
      version: process.env.APP_VERSION ?? '0.0.0',
      uptimeSec: Math.round(process.uptime()),
    }),
  );
}
