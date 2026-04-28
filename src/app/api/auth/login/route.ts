import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthConfig, isBodyTooLarge } from '@/lib/supabaseAuthServer';

export const dynamic = 'force-dynamic';

type LoginPayload = {
  email?: string;
  password?: string;
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

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
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
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json(
      {
        accessToken: responseBody.access_token,
        refreshToken: responseBody.refresh_token,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Unable to process login right now.' }, { status: 500 });
  }
}
