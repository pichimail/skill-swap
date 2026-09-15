import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const AccountSchema = z.object({ action: z.enum(['deactivate', 'reactivate']) }).strict();

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    const { action } = AccountSchema.parse(await request.json());
    const sql = getDb();
    if (action === 'deactivate') {
      await sql`UPDATE users SET is_active = false, deactivated_at = now(), updated_at = now() WHERE id = ${user.uid}`;
    } else {
      await sql`UPDATE users SET is_active = true, deactivated_at = NULL, updated_at = now() WHERE id = ${user.uid}`;
    }
    return NextResponse.json({ ok: true, active: action === 'reactivate' });
  } catch (error) {
    return apiError(error, 'Unable to update account');
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();
    await sql`DELETE FROM users WHERE id = ${user.uid}`;
    return NextResponse.json({ ok: true, firebaseDeleteRequired: true });
  } catch (error) {
    return apiError(error, 'Unable to delete account');
  }
}
