import { describe, expect, it } from 'vitest';
import { appError, err, httpStatusFor, ok } from '../result';

describe('Result<T>', () => {
  it('ok wraps data', () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe(42);
  });

  it('err wraps an AppError', () => {
    const r = err(appError('NOT_FOUND', 'gone'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('NOT_FOUND');
  });

  it.each([
    ['VALIDATION', 400],
    ['UNAUTHORIZED', 401],
    ['PAYMENT_REQUIRED', 402],
    ['FORBIDDEN', 403],
    ['NOT_FOUND', 404],
    ['CONFLICT', 409],
    ['RATE_LIMITED', 429],
    ['INTERNAL', 500],
    ['UPSTREAM', 502],
  ] as const)('maps %s -> %i', (code, status) => {
    expect(httpStatusFor(code)).toBe(status);
  });
});
