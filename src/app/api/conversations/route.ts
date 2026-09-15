import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const ConversationSchema = z.object({ matchId: z.string().uuid() }).strict();

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();
    const rows = await sql`
      SELECT c.id, c.match_id, c.updated_at,
        other.user_id AS other_user_id, u.display_name AS other_display_name, u.avatar_url AS other_avatar_url,
        last_message.body AS last_message, last_message.created_at AS last_message_at,
        COALESCE(unread.count, 0)::int AS unread_count
      FROM conversation_members mine
      JOIN conversations c ON c.id = mine.conversation_id
      JOIN LATERAL (SELECT cm.user_id FROM conversation_members cm WHERE cm.conversation_id = c.id AND cm.user_id <> ${user.uid} LIMIT 1) other ON true
      JOIN users u ON u.id = other.user_id
      LEFT JOIN LATERAL (SELECT body, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) last_message ON true
      LEFT JOIN LATERAL (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id <> ${user.uid} AND m.created_at > COALESCE(mine.last_read_at, 'epoch'::timestamptz)) unread ON true
      WHERE mine.user_id = ${user.uid}
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ${user.uid} AND b.blocked_id = other.user_id) OR (b.blocker_id = other.user_id AND b.blocked_id = ${user.uid}))
      ORDER BY COALESCE(last_message.created_at, c.updated_at) DESC
      LIMIT 100
    `;
    return NextResponse.json({ conversations: rows });
  } catch (error) {
    return apiError(error, 'Unable to load conversations');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { matchId } = ConversationSchema.parse(await request.json());
    const sql = getDb();
    const matches = await sql`SELECT * FROM matches WHERE id = ${matchId}::uuid AND status = 'accepted' AND (user_a = ${user.uid} OR user_b = ${user.uid}) LIMIT 1`;
    const match = matches[0];
    if (!match) return NextResponse.json({ error: 'Accepted match not found' }, { status: 404 });
    const rows = await sql`INSERT INTO conversations(match_id) VALUES (${match.id}) ON CONFLICT(match_id) DO UPDATE SET updated_at = now() RETURNING id, match_id, updated_at`;
    await sql`INSERT INTO conversation_members(conversation_id, user_id) VALUES (${rows[0].id}, ${match.user_a}), (${rows[0].id}, ${match.user_b}) ON CONFLICT DO NOTHING`;
    return NextResponse.json({ conversation: rows[0] });
  } catch (error) {
    return apiError(error, 'Unable to create conversation');
  }
}
