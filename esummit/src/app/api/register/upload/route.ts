import { NextResponse } from 'next/server';
import { eventBySlug } from '@/lib/events';
import { adminStorage } from '@/lib/firebase-admin';
import type { EventSlug } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_SIZE = 1 * 1024 * 1024;

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'register-upload', 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const eventSlug = String(formData.get('event') ?? '') as EventSlug;
    const event = eventBySlug(eventSlug);
    if (!event) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Payment screenshot is required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Upload only JPG or PNG' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Screenshot must be 1 MB or smaller' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
    const bucket = adminStorage.bucket();
    const objectPath = `registrations/${event.slug}/${filename}`;
    const objectRef = bucket.file(objectPath);

    await objectRef.save(bytes, {
      metadata: { contentType: file.type },
      resumable: false
    });

    const [signedUrl] = await objectRef.getSignedUrl({
      action: 'read',
      expires: '2100-01-01'
    });

    return NextResponse.json({ screenshotUrl: signedUrl }, { status: 201 });
  } catch (error) {
    console.error('Screenshot upload failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Screenshot upload failed' }, { status: 400 });
  }
}
