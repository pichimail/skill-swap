import 'server-only';

import { verifyFirebaseIdToken } from '@/lib/firebase-admin';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export class AuthError extends Error {
  readonly status: 401 | 403 | 503;

  constructor(message: string, status: 401 | 403 | 503 = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export function parseBearerToken(header: string | null) {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function isDemoAuthAllowed(nodeEnv = process.env.NODE_ENV, flag = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH) {
  return nodeEnv !== 'production' && flag === 'true';
}

type TokenVerifier = (token: string) => Promise<{ uid: string; email?: string; name?: string }>;

export async function requireUser(request: Request, verifier: TokenVerifier = verifyFirebaseIdToken): Promise<AuthUser> {
  const token = parseBearerToken(request.headers.get('authorization'));
  if (!token) throw new AuthError('Authentication required', 401);

  try {
    const decoded = await verifier(token);
    if (!decoded.uid) throw new AuthError('Invalid authentication token', 401);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.warn('Firebase token verification failed');
    throw new AuthError('Invalid or expired authentication token', 401);
  }
}

export function requireOwnership(user: AuthUser, ownerId: string) {
  if (user.uid !== ownerId) throw new AuthError('Forbidden', 403);
}
