import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const SupportSchema = z.object({ kind: z.enum(['bug', 'contact']), message: z.string().trim().min(2).max(5000) }).strict();

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const input = SupportSchema.parse(await request.json());
    const sql = getDb();
    const rows = await sql`INSERT INTO support_requests(user_id, kind, message) VALUES (${user.uid}, ${input.kind}, ${input.message}) RETURNING id, kind, status, created_at`;
    return NextResponse.json({ request: rows[0] }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Unable to send support request');
  }
}
