import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const ActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('end'), reason: z.string().max(120).optional() }),
  z.object({ action: z.literal('checkin'), comfortable: z.boolean() }),
  z.object({ action: z.literal('report'), reason: z.string().trim().min(2).max(1000) }),
]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const input = ActionSchema.parse(await request.json());
    const sql = getDb();
    const rows = await sql`SELECT * FROM learning_sessions WHERE id = ${id}::uuid AND (teacher_id = ${user.uid} OR learner_id = ${user.uid}) LIMIT 1`;
    const session = rows[0];
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (input.action === 'end') {
      const updated = await sql`
        UPDATE learning_sessions SET
          status = CASE WHEN status = 'cancelled' THEN status ELSE 'completed' END,
          ended_at = COALESCE(ended_at, now()),
          duration_seconds = CASE WHEN started_at IS NULL THEN 0 ELSE GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(ended_at, now()) - started_at))::int) END,
          ended_reason = ${input.reason ?? 'user_ended'}
        WHERE id = ${session.id}
        RETURNING *
      `;
      await sql`INSERT INTO analytics_events(user_id, event_name, metadata) VALUES (${user.uid}, 'session_ended', ${JSON.stringify({ sessionId: id })}::jsonb)`;
      return NextResponse.json({ session: updated[0] });
    }

    if (input.action === 'checkin') {
      await sql`INSERT INTO moderation_events(session_id, actor_id, event_type, metadata) VALUES (${session.id}, ${user.uid}, 'safety_checkin', ${JSON.stringify({ comfortable: input.comfortable })}::jsonb)`;
      return NextResponse.json({ ok: true });
    }

    await sql`INSERT INTO moderation_events(session_id, actor_id, event_type, metadata) VALUES (${session.id}, ${user.uid}, 'user_report', ${JSON.stringify({ reason: input.reason })}::jsonb)`;
    await sql`UPDATE learning_sessions SET status = 'cancelled', ended_at = COALESCE(ended_at, now()), ended_reason = 'user_report' WHERE id = ${session.id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, 'Unable to update session');
  }
}
