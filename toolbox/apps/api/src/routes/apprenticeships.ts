import { TRADES } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listApprenticeships } from '../services/apprenticeship.service';

export async function apprenticeshipRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/apprenticeships',
    {
      schema: {
        querystring: z.object({
          trade: z.enum(TRADES).optional(),
          state: z.string().max(32).optional(),
          paidOnly: z.coerce.boolean().optional(),
          limit: z.coerce.number().int().min(1).max(100).optional(),
        }),
      },
    },
    async (request) =>
      listApprenticeships({
        trade: request.query.trade ?? null,
        state: request.query.state ?? null,
        paidOnly: request.query.paidOnly ?? false,
        limit: request.query.limit,
      }),
  );
}
