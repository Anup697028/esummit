import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getRulesDownloadConfig } from '@/lib/rules';
import type { EventSlug } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function getContentType(filename: string) {
  if (filename.toLowerCase().endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (filename.toLowerCase().endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/octet-stream';
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rate = checkRateLimit(_request, 'rules-download', 60, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { slug } = await params;
  const eventSlug = slug as EventSlug;
  const config = getRulesDownloadConfig(eventSlug);

  if (!config?.available) {
    return NextResponse.json({ error: 'Rules download unavailable' }, { status: 404 });
  }

  const rulesDirectory = path.join(process.cwd(), 'rules');
  for (const candidate of config.fileCandidates) {
    const filePath = path.join(rulesDirectory, candidate);
    try {
      await access(filePath);
      const fileBuffer = await readFile(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': getContentType(candidate),
          'Content-Disposition': `attachment; filename="${candidate}"`
        }
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: 'Rules file not found' }, { status: 404 });
}
