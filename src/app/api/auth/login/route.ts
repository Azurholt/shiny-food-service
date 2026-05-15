import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthConfig, isBodyTooLarge } from '@/lib/supabaseAuthServer';
import {
  normalizeGhanaPhone,
  sellerCredentialEmail,
  sellerCredentialPassword,
} from '@/lib/sellerAuth';

export const dynamic = 'force-dynamic';

type LoginPayload = {
  phone?: string;
  pin?: string;
};

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

  const phone = payload.phone?.trim() ?? '';
  const pin = payload.pin?.trim() ?? '';

  if (!phone || !pin) {
    return NextResponse.json(
      { error: 'Phone number and PIN are required.', login_failed_reason: 'missing_credentials' },
      { status: 400 }
    );
  }

  let email: string;
  let password: string;
  try {
    const canonicalPhone = normalizeGhanaPhone(phone);
    email = sellerCredentialEmail(canonicalPhone.local);
    password = sellerCredentialPassword(pin);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid phone or PIN.',
        login_failed_reason: 'invalid_input',
      },
      { status: 400 }
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
        {
          error: message,
          login_failed_reason: 'invalid_credentials',
        },
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
    console.error('seller_login_failed', {
      login_failed_reason: 'upstream_error',
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to process login right now.', login_failed_reason: 'upstream_error' },
      { status: 500 }
    );
  }
}
