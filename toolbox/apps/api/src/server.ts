import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { createLogger } from '@toolbox/shared';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { healthRoutes } from './routes/health';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    loggerInstance: createLogger('api'),
    trustProxy: true,
    disableRequestLogging: false,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? '*').split(','),
    credentials: true,
  });
  await app.register(sensible);

  await app.register(healthRoutes, { prefix: '/v1' });

  return app;
}
