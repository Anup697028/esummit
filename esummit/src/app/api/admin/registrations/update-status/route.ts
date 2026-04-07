import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { notifyRejection, notifyTeam } from '@/lib/registrations';
import type { RegistrationRecord } from '@/lib/types';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

const updateStatusSchema = z.object({
  registrationId: z.string().trim().min(1),
  status: z.enum(['Pending Verification', 'Approved', 'Rejected']),
  rejectionReason: z.string().optional().default('')
});

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'admin-update-status', 40, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authError = await requireAdminRequest(request);
  if (authError) {
    return authError;
  }

  const parsed = updateStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const { registrationId, status, rejectionReason } = parsed.data;

  const normalizedRejectionReason = String(rejectionReason ?? '').trim();
  if (status === 'Rejected' && !normalizedRejectionReason) {
    return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
  }

  const docRef = adminDb.collection('registrations').doc(String(registrationId));
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  const record = snapshot.data() as RegistrationRecord;

  if (record.status === status) {
    return NextResponse.json({ ok: true, alreadyUpdated: true });
  }

  await docRef.set(
    status === 'Rejected'
      ? { status, rejection_reason: normalizedRejectionReason, rejectedAt: new Date().toISOString() }
      : { status },
    { merge: true }
  );

  if (status === 'Approved' && !record.notified) {
    const mailResult = await notifyTeam({ ...record, status: 'Approved' });
    if (!mailResult.ok) {
      console.error('Approval mail failed', { registrationId, status, reason: mailResult.error });
      return NextResponse.json({ error: mailResult.error ?? 'Failed to send approval email' }, { status: 502 });
    }
    await docRef.set(
      {
        notified: true,
        notifiedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }

  if (status === 'Rejected') {
    const mailResult = await notifyRejection({ ...record, status: 'Rejected' }, normalizedRejectionReason);
    if (!mailResult.ok) {
      console.error('Rejection mail failed', { registrationId, status, reason: mailResult.error });
      return NextResponse.json({ error: mailResult.error ?? 'Failed to send rejection email' }, { status: 502 });
    }
  }

  console.info('Registration status updated', {
    registrationId,
    from: record.status,
    to: status,
    rejectionReason: status === 'Rejected' ? normalizedRejectionReason : undefined
  });

  return NextResponse.json({ ok: true });
}
