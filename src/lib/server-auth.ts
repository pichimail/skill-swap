import 'server-only';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export async function requireUser(request?: Request): Promise<AuthUser> {
  void request;
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;
  if (!sessionUser?.id) throw new AuthError('Authentication required', 401);

  return {
    uid: sessionUser.id,
    email: sessionUser.email ?? null,
    displayName: sessionUser.name ?? null,
  };
}

export function requireOwnership(user: AuthUser, ownerId: string) {
  if (user.uid !== ownerId) throw new AuthError('Forbidden', 403);
}
