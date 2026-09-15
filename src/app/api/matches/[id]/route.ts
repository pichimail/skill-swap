import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const ActionSchema = z.object({ action: z.enum(['accept', 'decline']) }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const input = ActionSchema.parse(await request.json());
    const sql = getDb();
    const matches = await sql`SELECT * FROM matches WHERE id::text = ${id} AND (user_a = ${user.uid} OR user_b = ${user.uid}) LIMIT 1`;
    const match = matches[0];
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.status !== 'pending') return NextResponse.json({ error: 'Match is no longer pending' }, { status: 409 });
    if (match.requested_by === user.uid) return NextResponse.json({ error: 'Requester cannot accept or decline their own request' }, { status: 403 });

    if (input.action === 'decline') {
      await sql`UPDATE matches SET status = 'declined', declined_at = now(), updated_at = now() WHERE id = ${match.id}`;
      return NextResponse.json({ ok: true, status: 'declined' });
    }

    await sql`UPDATE matches SET status = 'accepted', accepted_at = now(), updated_at = now() WHERE id = ${match.id}`;
    const conversations = await sql`
      INSERT INTO conversations(match_id) VALUES (${match.id})
      ON CONFLICT(match_id) DO UPDATE SET updated_at = now()
      RETURNING id
    `;
    const conversationId = conversations[0].id;
    await sql`INSERT INTO conversation_members(conversation_id, user_id) VALUES (${conversationId}, ${match.user_a}), (${conversationId}, ${match.user_b}) ON CONFLICT DO NOTHING`;
    const notifyUser = match.requested_by || (match.user_a === user.uid ? match.user_b : match.user_a);
    if (notifyUser !== user.uid) await sql`INSERT INTO notifications(user_id, type, payload) VALUES (${notifyUser}, 'match_accepted', ${JSON.stringify({ matchId: match.id, conversationId })}::jsonb)`;
    return NextResponse.json({ ok: true, status: 'accepted', conversationId });
  } catch (error) {
    return apiError(error, 'Unable to update match');
  }
}
