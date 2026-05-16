import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthConfig, isBodyTooLarge } from '@/lib/supabaseAuthServer';
import {
  normalizeGhanaPhone,
  sellerCredentialEmail,
  sellerCredentialPassword,
} from '@/lib/sellerAuth';

export const dynamic = 'force-dynamic';

type SignupPayload = {
  businessName?: string;
  ownerName?: string;
  phone?: string;
  pin?: string;
  location?: string;
  category?: string;
};

function normalizeString(value: string | undefined): string {
  return value?.trim() || '';
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

  const businessName = normalizeString(payload.businessName);
  const ownerName = normalizeString(payload.ownerName);
  const phone = normalizeString(payload.phone);
  const pin = normalizeString(payload.pin);
  const location = normalizeString(payload.location);
  const category = normalizeString(payload.category);

  if (!businessName || !ownerName || !phone || !pin || !location || !category) {
    return NextResponse.json({ error: 'All signup fields are required.' }, { status: 400 });
  }

  let canonicalLocalPhone: string;
  let hiddenEmail: string;
  let paddedPin: string;
  try {
    canonicalLocalPhone = normalizeGhanaPhone(phone).local;
    hiddenEmail = sellerCredentialEmail(canonicalLocalPhone);
    paddedPin = sellerCredentialPassword(pin);
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
    const supabaseResponse = await fetch(`${url}/auth/v1/signup`, {
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
          full_name: ownerName,
          phone,
        },
      }),
      cache: 'no-store',
    });

    const responseBody = await supabaseResponse.json();

    if (!supabaseResponse.ok) {
      const message = responseBody?.msg || responseBody?.error_description || 'Signup failed.';
      return NextResponse.json(
        { error: message, signup_failed_stage: 'auth_signup' },
        { status: 400 }
      );
    }

    const userId = responseBody.user?.id as string | undefined;
    const accessToken = responseBody.access_token as string | undefined;
    const refreshToken = responseBody.refresh_token as string | undefined;

    if (!userId || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Signup succeeded but no session was returned.', signup_failed_stage: 'auth_session' },
        { status: 502 }
      );
    }

    const insertResponse = await fetch(`${url}/rest/v1/sellers`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        business_name: businessName,
        owner_name: ownerName,
        phone: canonicalLocalPhone,
        location,
        food_category: category,
        status: 'pending',
      }),
      cache: 'no-store',
    });

    const insertBody = await insertResponse.json().catch(() => null);
    if (!insertResponse.ok) {
      const insertMessage =
        insertBody?.message || insertBody?.hint || insertBody?.details || 'Unable to create seller profile.';
      console.error('seller_signup_profile_insert_failed', {
        signup_failed_stage: 'profile_insert',
        message: insertMessage,
        user_id: userId,
      });
      return NextResponse.json(
        { error: insertMessage, signup_failed_stage: 'profile_insert' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        userId,
        accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('seller_signup_failed', {
      signup_failed_stage: 'upstream_error',
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to process signup right now.', signup_failed_stage: 'upstream_error' },
      { status: 500 }
    );
  }
}
