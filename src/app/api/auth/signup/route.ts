import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthConfig, isBodyTooLarge } from '@/lib/supabaseAuthServer';

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

  const cleanPhone = phone.replace(/\D/g, '');
  if (!/^0[1-9]\d{8}$/.test(cleanPhone)) {
    return NextResponse.json({ error: 'Enter a valid Ghanaian phone number.' }, { status: 400 });
  }

  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits.' }, { status: 400 });
  }

  const hiddenEmail = `kueue_seller_${cleanPhone}@app.local`;
  const paddedPin = `KUE_${pin}`;

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
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      {
        userId: responseBody.user?.id,
        accessToken: responseBody.access_token,
        refreshToken: responseBody.refresh_token,
        sellerProfile: {
          businessName,
          ownerName,
          phone,
          location,
          category,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Unable to process signup right now.' }, { status: 500 });
  }
}
