import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { createLiveKitToken, getLiveKitConfig } from '@/lib/livekit';
import { requireUser } from '@/lib/server-auth';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const sql = getDb();
    const rows = await sql`SELECT * FROM learning_sessions WHERE id = ${id}::uuid AND (teacher_id = ${user.uid} OR learner_id = ${user.uid}) AND status IN ('scheduled','active') LIMIT 1`;
    const session = rows[0];
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (!getLiveKitConfig()) return NextResponse.json({ error: 'Live calling is not configured' }, { status: 503 });
    const credentials = await createLiveKitToken(session.livekit_room, user);
    await sql`UPDATE learning_sessions SET status = 'active', started_at = COALESCE(started_at, now()) WHERE id = ${session.id}`;
    return NextResponse.json({ ...credentials, room: session.livekit_room, sessionId: session.id });
  } catch (error) {
    return apiError(error, 'Unable to join session');
  }
}
