import { getSupabaseAuthConfig } from '@/lib/supabaseAuthServer';

export type RateLimitScope = 'customer_signup' | 'customer_login';

type RateLimitRecord = {
  attempts: number;
};

export type RateLimitReason = 'limit_reached' | 'backend_unavailable';

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number | null;
  reason?: RateLimitReason;
};

type RateLimitInput = {
  scope: RateLimitScope;
  localPhone: string;
  maxAttempts: number;
};

export interface PhoneRateLimiter {
  check(input: RateLimitInput): Promise<RateLimitDecision>;
}

function getWindowStartIso(now: Date): string {
  const window = new Date(now);
  window.setUTCMinutes(0, 0, 0);
  return window.toISOString();
}

const supabasePhoneRateLimiter: PhoneRateLimiter = {
  async check({ scope, localPhone, maxAttempts }: RateLimitInput): Promise<RateLimitDecision> {
    try {
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
        return { allowed: true, remaining: null, reason: 'backend_unavailable' };
      }

      const readBody = (await readResponse.json()) as RateLimitRecord[];
      const currentAttempts = readBody[0]?.attempts ?? 0;

      if (currentAttempts >= maxAttempts) {
        return { allowed: false, remaining: 0, reason: 'limit_reached' };
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
          return { allowed: true, remaining: null, reason: 'backend_unavailable' };
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
        return { allowed: true, remaining: null, reason: 'backend_unavailable' };
      }

      return {
        allowed: true,
        remaining: Math.max(maxAttempts - nextAttempts, 0),
      };
    } catch {
      return { allowed: true, remaining: null, reason: 'backend_unavailable' };
    }
  },
};

export async function enforceHourlyPhoneRateLimit(
  scope: RateLimitScope,
  localPhone: string,
  maxAttempts: number
): Promise<RateLimitDecision> {
  return supabasePhoneRateLimiter.check({ scope, localPhone, maxAttempts });
}
