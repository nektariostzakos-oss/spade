import { createJobInput } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import { createJob, getMyJobs } from '../services/job.service';

export async function jobsRoutes(app: FastifyInstance): Promise<void> {
  app.post('/jobs', { schema: { body: createJobInput } }, async (request) => {
    const authed = request.requireAuth();
    return createJob(authed, request.body);
  });

  app.get('/jobs/mine', async (request) => {
    const authed = request.requireAuth();
    return getMyJobs(authed);
  });
}
