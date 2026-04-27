// src/lib/errorLogger.ts
import { supabase } from './supabaseClient';

type ErrorContext = {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, unknown>;
};

export const logClientError = async (
  error: Error | unknown,
  context: ErrorContext = {}
) => {
  // Don't block the user experience - fire and forget
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    url: window.location.href,
    user_agent: navigator.userAgent,
    network_effective_type: (navigator as any).connection?.effectiveType, // 4g, 3g, etc.
    page: context.page,
    action: context.action,
    user_id: context.userId,
    metadata: context.metadata,
    occurred_at: new Date().toISOString(),
  };

  // Best-effort send; ignore failures to avoid infinite error loops
  (async () => {
    try {
      const { error: insertError } = await supabase
        .from('client_error_logs')
        .insert(payload);
      
      if (insertError && process.env.NODE_ENV === 'development') {
        console.error('Failed to send error log:', insertError);
      }
    } catch (err) {
      // Silent fail in production; console in dev
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logger network failure:', payload, err);
      }
    }
  })();
};