import { NextResponse } from 'next/server';
import { createRegistration } from '@/lib/registrations';
import { eventBySlug } from '@/lib/events';
import type { EventSlug } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

function validateParticipants(eventSlug: EventSlug, participantNames: string[]) {
  const event = eventBySlug(eventSlug);
  if (!event) return 'Invalid event';

  const count = participantNames.length;
  if (eventSlug === 'quiz' && count !== 2) return 'Quiz requires exactly 2 participants';
  if (eventSlug === 'elocution' && count !== 2) return 'Elocution requires exactly 2 participants';
  if (eventSlug !== 'quiz' && eventSlug !== 'elocution' && eventSlug !== 'speaker-session' && (count < 3 || count > 4)) {
    return 'This event requires 3 to 4 participants';
  }
  if (eventSlug === 'speaker-session' && (count === 1 || (count >= 3 && count <= 4))) return null;
  if (eventSlug === 'speaker-session') return 'Speaker session allows either 1 participant (individual) or 3 to 4 participants (university)';
  return null;
}

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'register-submit', 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const payload = await request.json();
    const eventSlug = payload.event as EventSlug;
    const event = eventBySlug(eventSlug);
    if (!event) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const participantNames = Array.isArray(payload.participantNames) ? payload.participantNames : [];
    const participantUsns = Array.isArray(payload.participantUsns) ? payload.participantUsns : [];
    const teamLeaderName = String(payload.teamLeaderName ?? '').trim();
    const email = String(payload.email ?? '').trim();
    const phone = String(payload.phone ?? '').trim();
    const participantError = validateParticipants(eventSlug, participantNames);
    if (participantError) {
      return NextResponse.json({ error: participantError }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 });
    }

    if (!teamLeaderName) {
      return NextResponse.json({ error: 'Team leader name is required' }, { status: 400 });
    }

    if (participantUsns.some((usn: unknown) => String(usn ?? '').trim().length === 0)) {
      return NextResponse.json({ error: 'USN is required for every participant' }, { status: 400 });
    }

    const record = await createRegistration({
      event: eventSlug,
      teamName: String(payload.teamName ?? ''),
      teamLeaderName,
      participants: participantNames.map((name: string, index: number) => ({ name, usn: String(participantUsns[index] ?? '').trim() })),
      email,
      phone,
      college: String(payload.college ?? ''),
      semester: String(payload.semester ?? ''),
      transactionId: String(payload.transactionId ?? ''),
      screenshotUrl: String(payload.screenshotUrl ?? '')
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register';
    const safeMessages = new Set([
      'Invalid event',
      'Quiz requires exactly 2 participants',
      'Elocution requires exactly 2 participants',
      'This event requires 3 to 4 participants',
      'Speaker session allows either 1 participant (individual) or 3 to 4 participants (university)',
      'Invalid email address',
      'Phone number must be exactly 10 digits',
      'Team leader name is required',
      'USN is required for every participant',
      'This email is already registered for another event',
      'Team name already exists for this event',
      'Registration limit reached',
      'Registration is closed for this event'
    ]);
    if (!safeMessages.has(message)) {
      console.error('Registration submission failed', { message });
      return NextResponse.json({ error: 'Failed to register' }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
