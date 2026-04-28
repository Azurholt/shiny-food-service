const MAX_AUTH_BODY_BYTES = 8 * 1024;

type SupabaseAuthConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseAuthConfig(): SupabaseAuthConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  return { url, anonKey };
}

export function isBodyTooLarge(contentLengthHeader: string | null): boolean {
  if (!contentLengthHeader) return false;

  const parsed = Number(contentLengthHeader);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return true;
  }

  return parsed > MAX_AUTH_BODY_BYTES;
}
