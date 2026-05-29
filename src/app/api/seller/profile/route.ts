import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthConfig, isBodyTooLarge } from '@/lib/supabaseAuthServer';

export const dynamic = 'force-dynamic';

type ProfilePayload = {
  direction_note?: unknown;
};

type SupabaseUserResponse = {
  id?: string;
};

type SellerProfileResponse = {
  direction_note?: string | null;
};

function getBearerToken(request: NextRequest): string {
  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new Error('Missing seller session.');
  }
  return token;
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
  }

  let payload: ProfilePayload;
  try {
    payload = (await request.json()) as ProfilePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (typeof payload.direction_note !== 'string') {
    return NextResponse.json({ error: 'Direction note is required.' }, { status: 400 });
  }

  const directionNote = payload.direction_note.trim();
  if (directionNote.length > 200) {
    return NextResponse.json({ error: 'Direction note must be 200 characters or fewer.' }, { status: 400 });
  }

  try {
    const accessToken = getBearerToken(request);
    const { url, anonKey } = getSupabaseAuthConfig();

    const userResponse = await fetch(`${url}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const userBody = (await userResponse.json().catch(() => null)) as SupabaseUserResponse | null;
    if (!userResponse.ok || !userBody?.id) {
      return NextResponse.json({ error: 'You need to sign in again.' }, { status: 401 });
    }

    const updateResponse = await fetch(`${url}/rest/v1/sellers?user_id=eq.${encodeURIComponent(userBody.id)}`, {
      method: 'PATCH',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ direction_note: directionNote }),
      cache: 'no-store',
    });

    const updateBody = (await updateResponse.json().catch(() => null)) as SellerProfileResponse[] | null;
    if (!updateResponse.ok) {
      return NextResponse.json({ error: 'Unable to save stall directions.' }, { status: 400 });
    }

    const updatedProfile = updateBody?.[0];
    return NextResponse.json({ direction_note: updatedProfile?.direction_note ?? directionNote }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save stall directions.';
    const status = message === 'Missing seller session.' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
