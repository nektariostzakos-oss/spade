import { createReviewInput } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createReview, listReviewsForUser } from '../services/review.service';

export async function reviewRoutes(app: FastifyInstance): Promise<void> {
  app.post('/reviews', { schema: { body: createReviewInput } }, async (request) =>
    createReview(request.requireAuth(), request.body),
  );

  app.get(
    '/users/:id/reviews',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => listReviewsForUser(request.params.id),
  );
}
