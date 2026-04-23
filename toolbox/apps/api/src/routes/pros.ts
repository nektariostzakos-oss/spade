import { proOnboardingInput } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import { getMyProProfile, onboardPro } from '../services/pro.service';

export async function proRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/pros/onboard',
    { schema: { body: proOnboardingInput } },
    async (request) => {
      const authed = request.requireAuth();
      return onboardPro(authed, request.body);
    },
  );

  app.get('/pros/me', async (request) => {
    const authed = request.requireAuth();
    return getMyProProfile(authed);
  });
}
