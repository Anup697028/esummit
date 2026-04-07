import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  const isHttps = request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:';
  if (isHttps) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}

function isAllowedOrigin(request: NextRequest, origin: string) {
  const requestOrigin = request.nextUrl.origin;
  if (origin === requestOrigin) {
    return true;
  }

  const configuredOrigin = process.env.APP_ORIGIN;
  if (configuredOrigin && origin === configuredOrigin) {
    return true;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && origin === `https://${vercelUrl}`) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    applySecurityHeaders(response, request);
    return response;
  }

  const origin = request.headers.get('origin');
  if (origin && !isAllowedOrigin(request, origin)) {
    const denied = NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
    applySecurityHeaders(denied, request);
    denied.headers.set('Vary', 'Origin');
    return denied;
  }

  if (request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    if (origin) {
      preflight.headers.set('Access-Control-Allow-Origin', origin);
      preflight.headers.set('Vary', 'Origin');
    }
    preflight.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    preflight.headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    applySecurityHeaders(preflight, request);
    return preflight;
  }

  const response = NextResponse.next();
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }
  applySecurityHeaders(response, request);
  return response;
}

export const config = {
  matcher: ['/:path*']
};
