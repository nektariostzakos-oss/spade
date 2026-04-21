import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  decideVerification,
  pendingVerifications,
} from '../services/verification.service';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.get('/admin/verifications', async (request) => {
    const authed = request.requireAuth();
    return pendingVerifications(authed);
  });

  app.post(
    '/admin/verifications/:proId',
    {
      schema: {
        params: z.object({ proId: z.string().min(1) }),
        body: z.object({ decision: z.enum(['approve', 'reject']) }),
      },
    },
    async (request) => {
      const authed = request.requireAuth();
      return decideVerification(authed, request.params.proId, request.body.decision);
    },
  );
}
