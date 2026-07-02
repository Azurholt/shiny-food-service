# Change Log

- Date/Time: 2026-07-02 01:43:48 UTC
- Edited files:
  - `supabase/migrations/20260702_rls_policy_and_error_log_cleanup.sql`

## Summary

- Removed stale and overlapping Supabase RLS policies for `customers`, `sellers`, `orders`, and `special_customers`.
- Recreated the surviving policies with init-plan `auth.uid()` checks to address the Supabase performance lint.
- Consolidated `orders` select access into a single policy covering both customer and seller access paths.
- Dropped the duplicate `client_error_logs` index and kept a single canonical `occurred_at` index.
