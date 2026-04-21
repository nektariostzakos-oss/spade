import { createVideoInput } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createSignedUpload, getVideo } from '../services/mux.service';

export async function videoRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/videos/upload',
    { schema: { body: createVideoInput } },
    async (request) => {
      const authed = request.requireAuth();
      return createSignedUpload(authed, request.body);
    },
  );

  app.get(
    '/videos/:id',
    { schema: { params: z.object({ id: z.string().min(1) }) } },
    async (request) => getVideo(request.params.id),
  );
}
