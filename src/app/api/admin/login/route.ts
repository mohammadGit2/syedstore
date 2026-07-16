import { NextResponse } from 'next/server';
import { createAdminSession, verifyPassword } from '@/lib/admin-auth';
import { sanitizeText } from '@/lib/catalog';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!verifyPassword(sanitizeText(body.password))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
