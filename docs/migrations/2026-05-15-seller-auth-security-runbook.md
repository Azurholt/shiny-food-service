# Seller Auth Security Remediation Runbook (2026-05-15)

## Scope
- Align seller auth to `phone + pin` end-to-end.
- Remove broken `auth.users` signup trigger path.
- Enforce strict owner-scoped RLS.
- Repair legacy `sellers` data integrity and enforce constraints.

## Prerequisites
- Maintenance window and deploy freeze for auth-related code.
- Supabase project ID confirmed: `nskjhuyhmznhkmotvnle`.
- Backup SQL artifacts created in `ops` schema:
  - `ops.phase0_sellers_backup_20260515`
  - `ops.phase0_orders_backup_20260515`
  - `ops.phase0_auth_users_backup_20260515`
  - `ops.phase0_policy_backup_20260515`
  - `ops.phase0_trigger_backup_20260515`
  - `ops.phase0_metrics_20260515`

## Execution
1. Apply `2026-05-15-seller-auth-security-forward.sql`.
2. Deploy app code in this changeset.
3. Run verification checks listed below.

## Verification Steps
1. Security controls
- Confirm no `auth.users` signup trigger:
  - `select * from information_schema.triggers where event_object_schema='auth' and event_object_table='users';`
- Confirm seller policies are owner-scoped and authenticated-only.
- Run Supabase security advisor and verify no security lints.

2. Data integrity
- `select count(*) from public.sellers where user_id is null;` must be `0`.
- `select count(*) from (select phone from public.sellers group by phone having count(*) > 1) d;` must be `0`.
- `public.sellers.user_id` must be `NOT NULL`.

3. Application tests
- `npm run lint` passes.
- Seller signup with valid phone/pin creates auth session and seller profile.
- Seller login with phone/pin succeeds.
- Invalid phone/pin returns safe validation errors.
- Anonymous write attempts to `sellers` fail.

## Rollback
Run `2026-05-15-seller-auth-security-rollback.sql`.

Phase-specific rollback outcomes:
1. Phase 1
- Restores old trigger/function exposure and permissive policies.

2. Phase 2 (app)
- Revert this application commit/deploy to restore prior login UI/API contract.

3. Phase 3
- Drops new constraints/indexes and restores deleted legacy seller rows from `ops.phase3_deleted_sellers_20260515`.

## Notes
- The rollback file restores previous behavior for recovery speed, including weaker security controls.
- If rollback is required for availability, immediately schedule a follow-up hardening pass.
