import { appError, httpStatusFor, type AppError, type AppErrorCode } from '@toolbox/shared';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';

interface WithCode {
  statusCode?: number;
  code?: string;
  message?: string;
  validation?: unknown;
}

const zodToAppError = (err: ZodError): AppError =>
  appError('VALIDATION', 'Invalid request', { issues: err.flatten() });

export const errorPlugin = fp(async function errorPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const w = error as WithCode;
    if (error instanceof ZodError) {
      const e = zodToAppError(error);
      return reply.status(400).send({ ok: false, error: e });
    }
    if (w.validation) {
      const e = appError('VALIDATION', w.message ?? 'Invalid request', { validation: w.validation });
      return reply.status(400).send({ ok: false, error: e });
    }
    const code = (w.code as AppErrorCode | undefined) ?? 'INTERNAL';
    const status = w.statusCode ?? httpStatusFor(code);
    request.log.error({ err: error, code, status }, 'request failed');
    return reply.status(status).send({
      ok: false,
      error: appError(code, w.message ?? 'Internal server error'),
    });
  });
});
