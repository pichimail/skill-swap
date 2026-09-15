import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();

    const rows = await sql`
      INSERT INTO users (id, email, display_name, is_active, updated_at)
      VALUES (${user.uid}, ${user.email}, ${user.displayName}, true, now())
      ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        is_active = true,
        deactivated_at = NULL,
        updated_at = now()
      RETURNING id, email, display_name, avatar_url, bio, location, timezone, is_active
    `;

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    return apiError(error, 'Unable to sync user');
  }
}
