import { createClerkClient, verifyToken, type ClerkClient } from '@clerk/backend';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export interface AuthedUser {
  clerkId: string;
  email: string | null;
  phone: string | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthedUser | null;
    requireAuth: () => AuthedUser;
  }
}

let clerk: ClerkClient | null = null;
const getClerk = (): ClerkClient => {
  if (!clerk) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new Error('CLERK_SECRET_KEY is not set');
    clerk = createClerkClient({ secretKey });
  }
  return clerk;
};

async function resolveAuth(request: FastifyRequest): Promise<AuthedUser | null> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    if (!payload.sub) return null;
    const user = await getClerk().users.getUser(payload.sub);
    return {
      clerkId: payload.sub,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      phone: user.primaryPhoneNumber?.phoneNumber ?? null,
    };
  } catch {
    return null;
  }
}

export const authPlugin = fp(async function authPlugin(app: FastifyInstance) {
  app.decorateRequest('auth', null);
  app.decorateRequest('requireAuth', function requireAuth(this: FastifyRequest) {
    if (!this.auth) {
      const err: Error & { statusCode?: number; code?: string } = new Error('Unauthorized');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }
    return this.auth;
  });

  app.addHook('preHandler', async (request) => {
    request.auth = await resolveAuth(request);
  });
});
