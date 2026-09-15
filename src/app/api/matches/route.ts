import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';
import { ensureUser } from '@/lib/users';

const MatchRequestSchema = z.object({ targetUserId: z.string().min(1).max(191), skillId: z.number().int().positive().optional() }).strict();

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    const sql = getDb();
    const view = new URL(request.url).searchParams.get('view');
    if (view === 'mine' || view === 'accepted') {
      const rows = await sql`
        SELECT m.id, m.status, m.score, m.skill_id, m.requested_by, m.created_at, m.accepted_at,
          CASE WHEN m.user_a = ${user.uid} THEN m.user_b ELSE m.user_a END AS other_user_id,
          u.display_name AS other_display_name, u.avatar_url AS other_avatar_url, u.location AS other_location,
          s.name AS skill_name
        FROM matches m
        JOIN users u ON u.id = CASE WHEN m.user_a = ${user.uid} THEN m.user_b ELSE m.user_a END
        LEFT JOIN skills s ON s.id = m.skill_id
        WHERE (m.user_a = ${user.uid} OR m.user_b = ${user.uid})
          AND (${view === 'accepted'} = false OR m.status = 'accepted')
        ORDER BY m.updated_at DESC LIMIT 100
      `;
      return NextResponse.json({ matches: rows });
    }

    const rows = await sql`
      SELECT u.id, u.display_name, u.avatar_url, u.bio, u.location, u.timezone,
        fit.compatibility,
        LEAST(100, fit.compatibility * 50)::int AS score
      FROM users u
      CROSS JOIN LATERAL (
        SELECT count(*)::int AS compatibility
        FROM user_skills mine
        JOIN user_skills theirs ON theirs.skill_id = mine.skill_id AND theirs.user_id = u.id
        WHERE mine.user_id = ${user.uid}
          AND ((mine.kind = 'learn' AND theirs.kind = 'teach') OR (mine.kind = 'teach' AND theirs.kind = 'learn'))
      ) fit
      WHERE u.id <> ${user.uid}
        AND u.is_active = true
        AND fit.compatibility > 0
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ${user.uid} AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = ${user.uid}))
        AND NOT EXISTS (SELECT 1 FROM matches m WHERE ((m.user_a = ${user.uid} AND m.user_b = u.id) OR (m.user_a = u.id AND m.user_b = ${user.uid})) AND m.status IN ('pending','accepted','blocked'))
      ORDER BY score DESC, u.updated_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ candidates: rows });
  } catch (error) {
    return apiError(error, 'Unable to load matches');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    const input = MatchRequestSchema.parse(await request.json());
    if (input.targetUserId === user.uid) return NextResponse.json({ error: 'You cannot match with yourself' }, { status: 400 });
    const sql = getDb();
    const targets = await sql`SELECT id FROM users WHERE id = ${input.targetUserId} AND is_active = true LIMIT 1`;
    if (!targets[0]) return NextResponse.json({ error: 'User unavailable' }, { status: 404 });
    const blocks = await sql`SELECT 1 FROM user_blocks WHERE (blocker_id = ${user.uid} AND blocked_id = ${input.targetUserId}) OR (blocker_id = ${input.targetUserId} AND blocked_id = ${user.uid}) LIMIT 1`;
    if (blocks[0]) return NextResponse.json({ error: 'Match unavailable' }, { status: 403 });
    const existing = await sql`SELECT id, status FROM matches WHERE ((user_a = ${user.uid} AND user_b = ${input.targetUserId}) OR (user_a = ${input.targetUserId} AND user_b = ${user.uid})) AND status IN ('pending','accepted') LIMIT 1`;
    if (existing[0]) return NextResponse.json({ match: existing[0], existing: true });
    const rows = await sql`
      INSERT INTO matches(user_a, user_b, requested_by, skill_id, status, score)
      VALUES (${user.uid}, ${input.targetUserId}, ${user.uid}, ${input.skillId ?? null}, 'pending', 50)
      RETURNING *
    `;
    await sql`INSERT INTO notifications(user_id, type, payload) VALUES (${input.targetUserId}, 'match_request', ${JSON.stringify({ matchId: rows[0].id, fromUserId: user.uid })}::jsonb)`;
    return NextResponse.json({ match: rows[0] }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Unable to create match');
  }
}
