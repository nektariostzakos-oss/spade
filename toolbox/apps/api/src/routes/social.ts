import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { toggleFollow, toggleLike, toggleSave } from '../services/social.service';

export async function socialRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/videos/:id/like',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => toggleLike(request.requireAuth(), request.params.id),
  );

  app.post(
    '/videos/:id/save',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => toggleSave(request.requireAuth(), request.params.id),
  );

  app.post(
    '/users/:id/follow',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => toggleFollow(request.requireAuth(), request.params.id),
  );
}
