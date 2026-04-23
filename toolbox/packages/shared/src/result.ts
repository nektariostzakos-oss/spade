export type Ok<T> = { ok: true; data: T };
export type Err<E = AppError> = { ok: false; error: E };
export type Result<T, E = AppError> = Ok<T> | Err<E>;

export type AppErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYMENT_REQUIRED'
  | 'UPSTREAM'
  | 'INTERNAL';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });
export const err = <E extends AppError = AppError>(error: E): Err<E> => ({ ok: false, error });

export const appError = (
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppError => ({ code, message, details });

export const httpStatusFor = (code: AppErrorCode): number => {
  switch (code) {
    case 'VALIDATION':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'PAYMENT_REQUIRED':
      return 402;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'RATE_LIMITED':
      return 429;
    case 'UPSTREAM':
      return 502;
    case 'INTERNAL':
      return 500;
  }
};
