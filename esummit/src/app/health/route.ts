import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'e-summit-mitt',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
