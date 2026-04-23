import { prisma } from '@toolbox/db';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getFeed } from '../services/feed.service';

export async function feedRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/feed',
    {
      schema: {
        querystring: z.object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(50).default(20),
          city: z.string().optional(),
        }),
      },
    },
    async (request) => {
      const { cursor, limit, city } = request.query;
      let userId: string | null = null;
      if (request.auth) {
        const u = await prisma.user.findUnique({
          where: { clerkId: request.auth.clerkId },
          select: { id: true },
        });
        userId = u?.id ?? null;
      }
      return getFeed({ cursor: cursor ?? null, limit, city: city ?? null, userId });
    },
  );
}
