import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { liveKitRoomName } from '@/lib/matching';
import { requireUser } from '@/lib/server-auth';

const SessionSchema = z.object({ matchId: z.string().uuid() }).strict();

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();
    const rows = await sql`
      SELECT ls.id, ls.match_id, ls.teacher_id, ls.learner_id, ls.skill_id, ls.started_at, ls.ended_at, ls.status, ls.duration_seconds, ls.ended_reason, ls.created_at, s.name AS skill_name
      FROM learning_sessions ls LEFT JOIN skills s ON s.id = ls.skill_id
      WHERE ls.teacher_id = ${user.uid} OR ls.learner_id = ${user.uid}
      ORDER BY ls.created_at DESC LIMIT 100
    `;
    return NextResponse.json({ sessions: rows });
  } catch (error) {
    return apiError(error, 'Unable to load sessions');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { matchId } = SessionSchema.parse(await request.json());
    const sql = getDb();
    const matches = await sql`
      SELECT m.*,
        EXISTS(SELECT 1 FROM user_skills us WHERE us.user_id = m.user_a AND us.skill_id = m.skill_id AND us.kind = 'teach') AS a_teaches,
        EXISTS(SELECT 1 FROM user_skills us WHERE us.user_id = m.user_b AND us.skill_id = m.skill_id AND us.kind = 'teach') AS b_teaches
      FROM matches m
      WHERE m.id = ${matchId}::uuid AND m.status = 'accepted' AND (m.user_a = ${user.uid} OR m.user_b = ${user.uid}) LIMIT 1
    `;
    const match = matches[0];
    if (!match) return NextResponse.json({ error: 'Accepted match not found' }, { status: 404 });
    const teacherId = match.a_teaches && !match.b_teaches ? match.user_a : match.b_teaches && !match.a_teaches ? match.user_b : match.user_a;
    const learnerId = teacherId === match.user_a ? match.user_b : match.user_a;
    const existing = await sql`SELECT * FROM learning_sessions WHERE match_id = ${match.id} AND status IN ('scheduled','active') ORDER BY created_at DESC LIMIT 1`;
    if (existing[0]) {
      const session = existing[0];
      if (!session.livekit_room) {
        const room = liveKitRoomName(String(session.id));
        const updated = await sql`UPDATE learning_sessions SET livekit_room = ${room} WHERE id = ${session.id} RETURNING *`;
        return NextResponse.json({ session: updated[0], existing: true });
      }
      return NextResponse.json({ session, existing: true });
    }
    const rows = await sql`
      INSERT INTO learning_sessions(match_id, teacher_id, learner_id, skill_id, status)
      VALUES (${match.id}, ${teacherId}, ${learnerId}, ${match.skill_id}, 'scheduled')
      RETURNING *
    `;
    const room = liveKitRoomName(String(rows[0].id));
    const updated = await sql`UPDATE learning_sessions SET livekit_room = ${room} WHERE id = ${rows[0].id} RETURNING *`;
    return NextResponse.json({ session: updated[0] }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Unable to create session');
  }
}
