import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();
    const totals = await sql`
      SELECT
        count(*) FILTER (WHERE status = 'completed')::int AS total_sessions,
        COALESCE(sum(duration_seconds) FILTER (WHERE status = 'completed' AND learner_id = ${user.uid}), 0)::bigint AS learned_seconds,
        COALESCE(sum(duration_seconds) FILTER (WHERE status = 'completed' AND teacher_id = ${user.uid}), 0)::bigint AS taught_seconds
      FROM learning_sessions WHERE teacher_id = ${user.uid} OR learner_id = ${user.uid}
    `;
    const people = await sql`
      SELECT count(DISTINCT CASE WHEN user_a = ${user.uid} THEN user_b ELSE user_a END)::int AS people_met
      FROM matches WHERE status = 'accepted' AND (user_a = ${user.uid} OR user_b = ${user.uid})
    `;
    const topSkills = await sql`
      SELECT s.id, s.name, count(*)::int AS sessions
      FROM learning_sessions ls JOIN skills s ON s.id = ls.skill_id
      WHERE ls.teacher_id = ${user.uid} AND ls.status = 'completed'
      GROUP BY s.id, s.name ORDER BY sessions DESC, s.name LIMIT 5
    `;
    const totalSessions = Number(totals[0]?.total_sessions ?? 0);
    const learnedSeconds = Number(totals[0]?.learned_seconds ?? 0);
    const taughtSeconds = Number(totals[0]?.taught_seconds ?? 0);
    const badges = [
      ...(totalSessions >= 1 ? [{ id: 'first-swap', label: 'First swap' }] : []),
      ...(taughtSeconds >= 18_000 ? [{ id: 'mentor-5h', label: '5h mentor' }] : []),
      ...(totalSessions >= 10 ? [{ id: 'ten-sessions', label: '10 sessions' }] : []),
    ];
    return NextResponse.json({
      analytics: {
        totalSessions,
        learnedSeconds,
        taughtSeconds,
        learnedHours: Math.round((learnedSeconds / 3600) * 10) / 10,
        taughtHours: Math.round((taughtSeconds / 3600) * 10) / 10,
        peopleMet: Number(people[0]?.people_met ?? 0),
        skillPoints: totalSessions * 10,
        topSkills,
        badges,
      },
    });
  } catch (error) {
    return apiError(error, 'Unable to load analytics');
  }
}
