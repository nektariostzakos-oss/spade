import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

// Lightweight wire-up that only imports Sentry if the DSN is set at runtime.
// Keeps the dev image small and avoids pulling the Sentry SDK in test.

export const observabilityPlugin = fp(async function observability(app: FastifyInstance) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  const mod = (await import('@sentry/node').catch(() => null)) as typeof import('@sentry/node') | null;
  if (!mod) {
    app.log.warn('SENTRY_DSN set but @sentry/node not installed — skipping');
    return;
  }
  mod.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
  app.addHook('onError', (request, _reply, err, done) => {
    mod.captureException(err, {
      extra: { url: request.url, method: request.method },
    });
    done();
  });
});
