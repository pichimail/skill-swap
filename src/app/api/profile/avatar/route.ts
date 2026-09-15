import { del, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';
import { ensureUser } from '@/lib/users';

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

function safeExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (fromName && fromName.length <= 8) return fromName;
  const subtype = file.type.split('/')[1]?.replace(/[^a-z0-9]/g, '');
  return subtype || 'jpg';
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Avatar image is required' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    if (file.size < 1 || file.size > MAX_AVATAR_BYTES) return NextResponse.json({ error: 'Avatar must be 4 MB or smaller' }, { status: 400 });

    const sql = getDb();
    const previous = await sql`SELECT avatar_url FROM users WHERE id = ${user.uid} LIMIT 1`;
    const blob = await put(`avatars/${encodeURIComponent(user.uid)}/avatar.${safeExtension(file)}`, file, { access: 'public', addRandomSuffix: true });
    await sql`UPDATE users SET avatar_url = ${blob.url}, updated_at = now() WHERE id = ${user.uid}`;

    const previousUrl = previous[0]?.avatar_url as string | null | undefined;
    if (previousUrl?.includes('blob.vercel-storage.com')) {
      try { await del(previousUrl); } catch { console.warn('Unable to delete replaced avatar blob'); }
    }

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return apiError(error, 'Unable to upload avatar');
  }
}
