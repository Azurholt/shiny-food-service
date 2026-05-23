import { getSupabaseAuthConfig } from '@/lib/supabaseAuthServer';

type RateLimitScope = 'customer_signup' | 'customer_login';

type RateLimitRecord = {
  attempts: number;
};

function getWindowStartIso(now: Date): string {
  const window = new Date(now);
  window.setUTCMinutes(0, 0, 0);
  return window.toISOString();
}

export async function enforceHourlyPhoneRateLimit(
  scope: RateLimitScope,
  localPhone: string,
  maxAttempts: number
): Promise<{ allowed: boolean; remaining: number }> {
  const { url, anonKey } = getSupabaseAuthConfig();
  const windowStart = getWindowStartIso(new Date());
  const encodedScope = encodeURIComponent(scope);
  const encodedPhone = encodeURIComponent(localPhone);
  const encodedWindow = encodeURIComponent(windowStart);

  const readUrl = `${url}/rest/v1/auth_rate_limits?scope=eq.${encodedScope}&phone=eq.${encodedPhone}&window_start=eq.${encodedWindow}&select=attempts&limit=1`;
  const readResponse = await fetch(readUrl, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!readResponse.ok) {
    throw new Error('Unable to validate rate limit.');
  }

  const readBody = (await readResponse.json()) as RateLimitRecord[];
  const currentAttempts = readBody[0]?.attempts ?? 0;

  if (currentAttempts >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  if (readBody.length === 0) {
    const insertResponse = await fetch(`${url}/rest/v1/auth_rate_limits`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scope,
        phone: localPhone,
        window_start: windowStart,
        attempts: 1,
      }),
      cache: 'no-store',
    });

    if (!insertResponse.ok) {
      throw new Error('Unable to initialize rate limit.');
    }

    return { allowed: true, remaining: maxAttempts - 1 };
  }

  const nextAttempts = currentAttempts + 1;
  const updateUrl = `${url}/rest/v1/auth_rate_limits?scope=eq.${encodedScope}&phone=eq.${encodedPhone}&window_start=eq.${encodedWindow}`;
  const updateResponse = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attempts: nextAttempts, updated_at: new Date().toISOString() }),
    cache: 'no-store',
  });

  if (!updateResponse.ok) {
    throw new Error('Unable to update rate limit.');
  }

  return {
    allowed: true,
    remaining: Math.max(maxAttempts - nextAttempts, 0),
  };
}
