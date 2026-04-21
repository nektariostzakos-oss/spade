import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getMe, getOrCreateUser } from '../services/user.service';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/auth/bootstrap',
    {
      schema: {
        response: {
          200: z.object({ ok: z.literal(true), data: z.any() }),
        },
      },
    },
    async (request) => {
      const authed = request.requireAuth();
      return getOrCreateUser(authed);
    },
  );

  app.get('/auth/me', async (request) => {
    const authed = request.requireAuth();
    return getMe(authed);
  });
}
