import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

const toggleSchema = z.object({
  event: z.enum(['ideathon', 'fusion-x', 'case-study', 'quiz', 'elocution', 'speaker-session']),
  registrationOpen: z.boolean()
});

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'admin-toggle-registration', 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authError = await requireAdminRequest(request);
  if (authError) {
    return authError;
  }

  const parsed = toggleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const { event, registrationOpen } = parsed.data;
  await adminDb.collection('events').doc(event).set({ registration_open: registrationOpen }, { merge: true });

  console.info('Registration toggle updated', { event, registrationOpen });
  return NextResponse.json({ ok: true });
}
