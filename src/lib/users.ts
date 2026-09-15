import 'server-only';

import { getDb } from '@/lib/db';
import type { AuthUser } from '@/lib/server-auth';

export async function ensureUser(user: AuthUser) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO users (id, email, display_name, is_active, last_seen_at, updated_at)
    VALUES (${user.uid}, ${user.email}, ${user.displayName}, true, now(), now())
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, users.email),
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      last_seen_at = now(),
      updated_at = now()
    RETURNING id, email, display_name, avatar_url, bio, location, timezone, is_active
  `;
  return rows[0];
}
