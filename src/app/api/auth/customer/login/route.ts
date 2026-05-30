import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/lib/authConfig';
import { enforceHourlyPhoneRateLimit } from '@/lib/authRateLimit';
import {
  customerCredentialEmail,
  customerCredentialPassword,
  normalizeGhanaPhone,
} from '@/lib/customerAuth';
import {
  getSupabaseAuthConfig,
  getSupabaseNetworkErrorMessage,
  isBodyTooLarge,
} from '@/lib/supabaseAuthServer';

export const dynamic = 'force-dynamic';

type LoginPayload = {
  phone?: string;
  pin?: string;
};

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? '';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
  }

  let payload: LoginPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const phone = normalizeString(payload.phone);
  const pin = normalizeString(payload.pin);

  if (!phone || !pin) {
    return NextResponse.json(
      { error: 'Phone number and PIN are required.', login_failed_reason: 'missing_credentials' },
      { status: 400 }
    );
  }

  let canonicalLocalPhone: string;
  let email: string;
  let password: string;
  try {
    canonicalLocalPhone = normalizeGhanaPhone(phone).local;
    email = customerCredentialEmail(canonicalLocalPhone);
    password = customerCredentialPassword(pin);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid phone or PIN.',
        login_failed_reason: 'invalid_input',
      },
      { status: 400 }
    );
  }

  const rateLimitState = await enforceHourlyPhoneRateLimit('customer_login', canonicalLocalPhone, 5);
  if (!rateLimitState.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in about an hour.' },
      { status: 429 }
    );
  }

  if (rateLimitState.reason === 'backend_unavailable') {
    console.error('customer_login_rate_limit_failed', {
      login_failed_reason: 'rate_limit',
      message: 'Rate limiter backend unavailable. Proceeding with fail-open policy.',
      phone: canonicalLocalPhone,
    });
  }

  if (AUTH_CONFIG.method === 'otp') {
    return NextResponse.json(
      {
        requiresOtp: true,
        method: 'otp',
        phone: canonicalLocalPhone,
      },
      { status: 202 }
    );
  }

  try {
    const { url, anonKey } = getSupabaseAuthConfig();
    const supabaseResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const responseBody = await supabaseResponse.json();

    if (!supabaseResponse.ok) {
      const message = responseBody?.msg || responseBody?.error_description || 'Invalid credentials.';
      return NextResponse.json(
        { error: message, login_failed_reason: 'invalid_credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        accessToken: responseBody.access_token,
        refreshToken: responseBody.refresh_token,
      },
      { status: 200 }
    );
  } catch (error) {
    const networkMessage = getSupabaseNetworkErrorMessage(error);
    console.error('customer_login_failed', {
      login_failed_reason: 'upstream_error',
      message: error instanceof Error ? error.message : 'unknown',
      cause: error instanceof Error ? (error.cause as { code?: string } | undefined)?.code : undefined,
    });

    return NextResponse.json(
      { error: networkMessage ?? 'Unable to process login right now.', login_failed_reason: 'upstream_error' },
      { status: 500 }
    );
  }
}
