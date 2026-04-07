import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import type { RegistrationRecord } from '@/lib/types';
import { eventDefinitions } from '@/lib/events';
import { requireAdminRequest } from '@/lib/admin-api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

function sortByCreatedAtDesc(records: RegistrationRecord[]) {
  return records.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function countRegistrationsForEvent(eventSlug: string, records: RegistrationRecord[]) {
  if (eventSlug !== 'speaker-session') {
    return records.length;
  }

  return records.reduce((total, record) => {
    const participants = Array.isArray(record.participants) ? record.participants.length : 0;
    return total + Math.max(1, participants);
  }, 0);
}

function csvEscape(value: unknown) {
  const text = typeof value === 'string' ? value : value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function extractStoragePathFromUrl(value: string) {
  if (!value) return '';

  if (value.startsWith('gs://')) {
    const parts = value.slice(5).split('/');
    parts.shift();
    return parts.join('/');
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === 'firebasestorage.googleapis.com') {
      const marker = '/o/';
      const markerIndex = parsed.pathname.indexOf(marker);
      if (markerIndex >= 0) {
        return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
      }
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return segments.slice(1).join('/');
    }
  } catch {
    return '';
  }

  return '';
}

async function resolveScreenshotUrl(record: RegistrationRecord) {
  const rawUrl = record.screenshot_url || String((record as unknown as { screenshotUrl?: string }).screenshotUrl ?? '');
  const objectPath = extractStoragePathFromUrl(rawUrl);
  if (!objectPath) {
    return rawUrl;
  }

  try {
    const file = adminStorage.bucket().file(objectPath);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
    return signedUrl;
  } catch {
    return rawUrl;
  }
}

async function recordsToCsv(records: RegistrationRecord[], baseUrl: string) {

  const headers = [
    'registration_id',
    'event',
    'team_name',
    'team_leader_name',
    'team_leader_email',
    'transaction_id',
    'semester',
    'phone',
    'college',
    'status',
    'participant_name',
    'participant_usn',
    'screenshot_link'
  ];

  const rowGroups = await Promise.all(records.map(async (record) => {
    const participants = record.participants?.length ? record.participants : [{ name: '', usn: '' }];
    const openUrl = `${baseUrl}/api/admin/registrations?open=${encodeURIComponent(record.registration_id)}`;
    const screenshotLink = `=HYPERLINK("${openUrl}","OPEN")`;

    return participants.map((participant, index) => [
      index === 0 ? record.registration_id : '',
      index === 0 ? record.event : '',
      index === 0 ? record.team_name : '',
      index === 0 ? record.team_leader_name : '',
      index === 0 ? record.email : '',
      index === 0 ? record.transaction_id : '',
      index === 0 ? record.semester : '',
      index === 0 ? record.phone : '',
      index === 0 ? record.college : '',
      index === 0 ? record.status : '',
      participant.name ?? '',
      participant.usn ?? '',
      index === 0 ? screenshotLink : ''
    ]);
  }));

  const rows = rowGroups.flat();

  return ['\ufeff' + headers.map(csvEscape).join(','), ...rows.map((row) => row.map(csvEscape).join(','))].join('\n');
}

export async function GET(request: Request) {
  const rate = checkRateLimit(request, 'admin-registrations-read', 120, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const url = new URL(request.url);
  const openRegistrationId = url.searchParams.get('open');
  if (openRegistrationId) {
    const snapshot = await adminDb.collection('registrations').doc(openRegistrationId).get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const record = snapshot.data() as RegistrationRecord;
    const screenshotUrl = await resolveScreenshotUrl(record);
    if (!screenshotUrl) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
    }

    return NextResponse.redirect(screenshotUrl);
  }

  const authError = await requireAdminRequest(request);
  if (authError) {
    return authError;
  }

  const summary = url.searchParams.get('summary');
  if (summary === 'counts') {
    const entries = await Promise.all(
      eventDefinitions.map(async (event) => {
        const eventDoc = await adminDb.collection('events').doc(event.slug).get();
        const cachedCount = Number(eventDoc.data()?.registered_count ?? NaN);
        if (event.slug !== 'speaker-session' && Number.isFinite(cachedCount) && cachedCount >= 0) {
          return [event.slug, cachedCount] as const;
        }

        let computedCount = 0;
        if (event.slug === 'speaker-session') {
          const snapshot = await adminDb.collection('registrations').where('event', '==', event.slug).get();
          const records = snapshot.docs.map((doc) => doc.data() as RegistrationRecord);
          computedCount = countRegistrationsForEvent(event.slug, records);
        } else {
          const snapshot = await adminDb.collection('registrations').where('event', '==', event.slug).count().get();
          computedCount = snapshot.data().count;
        }
        await adminDb.collection('events').doc(event.slug).set(
          {
            registered_count: computedCount,
            registration_open: computedCount < event.maxTeams,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
        return [event.slug, computedCount] as const;
      })
    );

    const counts = Object.fromEntries(entries);
    const total = entries.reduce((accumulator, [, count]) => accumulator + count, 0);
    return NextResponse.json({ counts, total });
  }

  const event = url.searchParams.get('event');
  const format = url.searchParams.get('format');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? '50')));

  let records: RegistrationRecord[] = [];
  if (event) {
    const snapshot = await adminDb.collection('registrations').where('event', '==', event).get();
    records = sortByCreatedAtDesc(snapshot.docs.map((doc) => doc.data() as RegistrationRecord));
  } else {
    const snapshot = await adminDb.collection('registrations').orderBy('createdAt', 'desc').get();
    records = snapshot.docs.map((doc) => doc.data() as RegistrationRecord);
  }

  if (format === 'csv') {
    const baseUrl = `${url.protocol}//${url.host}`;
    const csv = await recordsToCsv(records, baseUrl);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${event ?? 'registrations'}-registrations.csv"`
      }
    });
  }

  const shouldPaginate = url.searchParams.has('page') || url.searchParams.has('pageSize');
  if (shouldPaginate) {
    const start = (page - 1) * pageSize;
    const paged = records.slice(start, start + pageSize);
    return NextResponse.json({ records: paged, pagination: { page, pageSize, total: records.length } });
  }

  return NextResponse.json({ records });
}
