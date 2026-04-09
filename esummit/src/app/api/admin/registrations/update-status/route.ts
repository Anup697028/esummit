import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { notifyTeam } from '@/lib/registrations';
import type { RegistrationRecord } from '@/lib/types';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { eventBySlug } from '@/lib/events';

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

  const docRef = adminDb.collection('registrations').doc(String(registrationId));
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  const record = snapshot.data() as RegistrationRecord;

  if (record.status === status) {
    return NextResponse.json({ ok: true, alreadyUpdated: true });
  }

  if (status === 'Rejected') {
    const event = eventBySlug(record.event);
    if (!event) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const slotsUsed =
      record.event === 'speaker-session'
        ? Math.max(1, record.participants?.length ?? 0)
        : record.event === 'quiz'
          ? Math.max(0, record.participants?.length ?? 0)
          : 1;

    await adminDb.runTransaction(async (transaction) => {
      const eventRef = adminDb.collection('events').doc(record.event);
      const eventSnapshot = await transaction.get(eventRef);
      const currentCount = Number(eventSnapshot.data()?.registered_count ?? 0);
      const nextCount = Math.max(0, currentCount - slotsUsed);

      transaction.delete(docRef);
      transaction.set(
        eventRef,
        {
          registered_count: nextCount,
          fee: event.fee,
          registration_open: nextCount < event.maxTeams,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    });

    console.info('Registration rejected and deleted', {
      registrationId,
      from: record.status,
      to: status,
      rejectionReason: String(rejectionReason ?? '').trim() || 'Not provided'
    });

    return NextResponse.json({ ok: true, deleted: true });
  }

  await docRef.set(
    { status },
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

  console.info('Registration status updated', {
    registrationId,
    from: record.status,
    to: status
  });

  return NextResponse.json({ ok: true });
}
