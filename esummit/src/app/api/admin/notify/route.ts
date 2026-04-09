import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'admin-notify', 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authError = await requireAdminRequest(request);
  if (authError) {
    return authError;
  }

  return NextResponse.json({ error: 'Manual notification is disabled in the current email workflow.' }, { status: 403 });
}
