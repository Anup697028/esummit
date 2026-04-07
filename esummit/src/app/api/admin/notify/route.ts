import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { notifyTeam } from '@/lib/registrations';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

const notifySchema = z.object({
  registrationId: z.string().trim().min(1)
});

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'admin-notify', 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authError = await requireAdminRequest(request);
  if (authError) {
    return authError;
  }

  const parsed = notifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const docId = parsed.data.registrationId;
  const snapshot = await adminDb.collection('registrations').doc(docId).get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }
  const record = snapshot.data();
  if (!record) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  if (Boolean((record as { notified?: boolean }).notified)) {
    return NextResponse.json({ ok: true, alreadyNotified: true });
  }

  const mailResult = await notifyTeam(record as never);
  if (!mailResult.ok) {
    console.error('Manual notify mail failed', { registrationId: docId, reason: mailResult.error });
    return NextResponse.json({ error: mailResult.error ?? 'Failed to send notification' }, { status: 502 });
  }

  await adminDb.collection('registrations').doc(docId).set(
    {
      notified: true,
      notifiedAt: new Date().toISOString()
    },
    { merge: true }
  );

  console.info('Manual notify sent', { registrationId: docId });

  return NextResponse.json({ ok: true, alreadyNotified: false });
}
