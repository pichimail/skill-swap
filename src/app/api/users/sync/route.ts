import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

const UserSchema = z.object({
  id: z.string().min(1).max(191),
  email: z.string().email().nullable().optional(),
  displayName: z.string().max(160).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const input = UserSchema.parse(await request.json());
    const sql = getDb();

    const rows = await sql`
      INSERT INTO users (id, email, display_name, updated_at)
      VALUES (${input.id}, ${input.email ?? null}, ${input.displayName ?? null}, now())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        updated_at = now()
      RETURNING id, email, display_name
    `;

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error('User sync failed:', error);
    return NextResponse.json({ error: 'Unable to sync user' }, { status: 400 });
  }
}
