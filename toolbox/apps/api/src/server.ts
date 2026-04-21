import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { createLogger } from '@toolbox/shared';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { authPlugin } from './plugins/auth';
import { errorPlugin } from './plugins/error';
import { registerRoutes } from './routes';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    loggerInstance: createLogger('api'),
    trustProxy: true,
    disableRequestLogging: false,
    bodyLimit: 10 * 1024 * 1024,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? '*').split(','),
    credentials: true,
  });
  await app.register(sensible);
  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX ?? 600),
    timeWindow: '1 minute',
  });
  await app.register(errorPlugin);
  await app.register(authPlugin);
  await registerRoutes(app);

  return app;
}
