import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type RateBucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 8;
const CLEANUP_INTERVAL_MS = 5 * 60_000;
const AUTH_ENDPOINTS = new Set(['/api/auth/login', '/api/auth/signup']);
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    'upgrade-insecure-requests',
  ].join('; '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const buckets = new Map<string, RateBucket>();
let lastCleanupAt = Date.now();

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }

  // Reduce technology fingerprinting in edge responses.
  response.headers.delete('x-powered-by');
  response.headers.set('Server', 'edge');

  return response;
}

function readClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = xForwardedFor?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();

  return firstForwardedIp || realIp || 'unknown';
}

function cleanupBuckets(now: number): void {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  lastCleanupAt = now;
}

function checkRateLimit(request: NextRequest): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  cleanupBuckets(now);

  const ip = readClientIp(request);
  const key = `${request.nextUrl.pathname}:${ip}`;
  const existingBucket = buckets.get(key);

  if (!existingBucket || existingBucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfter: WINDOW_MS };
  }

  existingBucket.count += 1;
  const retryAfter = Math.max(1_000, existingBucket.resetAt - now);

  if (existingBucket.count > MAX_ATTEMPTS_PER_WINDOW) {
    return { limited: true, retryAfter };
  }

  return { limited: false, retryAfter };
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const transferEncoding = request.headers.get('transfer-encoding')?.toLowerCase() || '';

  // CVE mitigation: reject chunked framing on risky methods at the edge.
  if ((method === 'DELETE' || method === 'OPTIONS') && transferEncoding.includes('chunked')) {
    const rejected = NextResponse.json(
      { error: 'Chunked transfer encoding is not accepted for this method.' },
      { status: 400 }
    );
    return applySecurityHeaders(rejected);
  }

  if (AUTH_ENDPOINTS.has(pathname)) {
    const { limited, retryAfter } = checkRateLimit(request);

    if (limited) {
      const blocked = NextResponse.json(
        { error: 'Too many authentication attempts. Please try again shortly.' },
        { status: 429 }
      );
      blocked.headers.set('Retry-After', String(Math.ceil(retryAfter / 1_000)));
      return applySecurityHeaders(blocked);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
