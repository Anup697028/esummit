import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

const checkInSchema = z.object({
  registrationId: z.string().trim().min(1),
  method: z.enum(['manual', 'qr']).default('manual')
});

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'admin-check-in', 80, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authError = await requireAdminRequest(request);
  if (authError) {
    return authError;
  }

  const parsed = checkInSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const { registrationId, method } = parsed.data;
  const docRef = adminDb.collection('registrations').doc(registrationId);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  const existing = snapshot.data() as { checked_in?: boolean };
  if (existing.checked_in) {
    return NextResponse.json({ ok: true, alreadyCheckedIn: true });
  }

  await docRef.set(
    {
      checked_in: true,
      checked_in_time: new Date().toISOString(),
      checkin_method: method
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true, alreadyCheckedIn: false });
}
