import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { isAllowedAdmin } from '@/lib/auth';

export async function requireAdminRequest(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    const email = String(decoded.email ?? '').toLowerCase();
    if (!email || !isAllowedAdmin(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}