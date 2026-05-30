import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/lib/authConfig';
import { enforceHourlyPhoneRateLimit } from '@/lib/authRateLimit';
import {
  customerCredentialEmail,
  customerCredentialPassword,
  normalizeGhanaPhone,
  validateSignupPin,
} from '@/lib/customerAuth';
import {
  getSupabaseAuthConfig,
  getSupabaseNetworkErrorMessage,
  isBodyTooLarge,
} from '@/lib/supabaseAuthServer';

export const dynamic = 'force-dynamic';

type SignupPayload = {
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

  let payload: SignupPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const phone = normalizeString(payload.phone);
  const pin = normalizeString(payload.pin);

  if (!phone || !pin) {
    return NextResponse.json({ error: 'Phone number and PIN are required.' }, { status: 400 });
  }

  let canonicalLocalPhone: string;
  try {
    canonicalLocalPhone = normalizeGhanaPhone(phone).local;
    validateSignupPin(pin);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid phone or PIN.',
        signup_failed_stage: 'input_validation',
      },
      { status: 400 }
    );
  }
  const rateLimitState = await enforceHourlyPhoneRateLimit('customer_signup', canonicalLocalPhone, 3);
  if (!rateLimitState.allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Try again in about an hour.' },
      { status: 429 }
    );
  }

  if (rateLimitState.reason === 'backend_unavailable') {
    console.error('customer_signup_rate_limit_failed', {
      signup_failed_stage: 'rate_limit',
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

  let hiddenEmail: string;
  let paddedPin: string;
  try {
    hiddenEmail = customerCredentialEmail(canonicalLocalPhone);
    paddedPin = customerCredentialPassword(pin);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid phone or PIN.',
        signup_failed_stage: 'input_validation',
      },
      { status: 400 }
    );
  }

  try {
    const { url, anonKey } = getSupabaseAuthConfig();

    const authSignupResponse = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: hiddenEmail,
        password: paddedPin,
        data: {
          phone: canonicalLocalPhone,
        },
      }),
      cache: 'no-store',
    });

    const authBody = await authSignupResponse.json();

    if (!authSignupResponse.ok) {
      const message = authBody?.msg || authBody?.error_description || 'Signup failed.';
      return NextResponse.json(
        { error: message, signup_failed_stage: 'auth_signup' },
        { status: 400 }
      );
    }

    const userId = authBody.user?.id as string | undefined;
    const accessToken = authBody.access_token as string | undefined;
    const refreshToken = authBody.refresh_token as string | undefined;

    if (!userId || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Signup succeeded but no session was returned.', signup_failed_stage: 'auth_session' },
        { status: 502 }
      );
    }

    const customerInsertResponse = await fetch(`${url}/rest/v1/customers`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id: userId,
        phone: canonicalLocalPhone,
      }),
      cache: 'no-store',
    });

    const customerInsertBody = await customerInsertResponse.json().catch(() => null);

    if (!customerInsertResponse.ok) {
      const insertMessage =
        customerInsertBody?.message ||
        customerInsertBody?.hint ||
        customerInsertBody?.details ||
        'Unable to create customer profile.';

      console.error('customer_signup_profile_insert_failed', {
        signup_failed_stage: 'profile_insert',
        message: insertMessage,
        user_id: userId,
      });

      return NextResponse.json(
        { error: insertMessage, signup_failed_stage: 'profile_insert' },
        { status: 400 }
      );
    }

    return NextResponse.json({ userId, accessToken, refreshToken }, { status: 201 });
  } catch (error) {
    const networkMessage = getSupabaseNetworkErrorMessage(error);
    console.error('customer_signup_failed', {
      signup_failed_stage: 'upstream_error',
      message: error instanceof Error ? error.message : 'unknown',
      cause: error instanceof Error ? (error.cause as { code?: string } | undefined)?.code : undefined,
    });

    return NextResponse.json(
      { error: networkMessage ?? 'Unable to process signup right now.', signup_failed_stage: 'upstream_error' },
      { status: 500 }
    );
  }
}
