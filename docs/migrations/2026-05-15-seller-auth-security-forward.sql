-- Phase 0: preflight backups
create schema if not exists ops;

create table if not exists ops.phase0_sellers_backup_20260515 as
select * from public.sellers;

create table if not exists ops.phase0_orders_backup_20260515 as
select * from public.orders;

create table if not exists ops.phase0_auth_users_backup_20260515 as
select id, email, phone, created_at, raw_user_meta_data, raw_app_meta_data
from auth.users;

create table if not exists ops.phase0_policy_backup_20260515 as
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public';

create table if not exists ops.phase0_trigger_backup_20260515 as
select trigger_name, event_object_schema, event_object_table, action_timing, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema in ('auth', 'public');

create table if not exists ops.phase0_metrics_20260515 as
select
  now() as captured_at,
  (select count(*) from auth.users) as auth_user_count,
  (select count(*) from public.sellers) as seller_count,
  (select count(*) from public.sellers where user_id is null) as sellers_without_user,
  (select count(*) from public.orders) as order_count;

-- Phase 1: security hardening
drop trigger if exists on_auth_user_created on auth.users;

revoke execute on function public.handle_seller_signup() from anon;
revoke execute on function public.handle_seller_signup() from authenticated;
alter function public.handle_seller_signup() security invoker;
alter function public.handle_seller_signup() set search_path = public, pg_temp;

drop policy if exists "Allow insert for sellers" on public.sellers;
drop policy if exists "Enable insert during signup" on public.sellers;
drop policy if exists "Sellers can view own profile" on public.sellers;
drop policy if exists "Sellers can update own profile" on public.sellers;

create policy "Sellers can insert own profile"
on public.sellers
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Sellers can view own profile"
on public.sellers
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Sellers can update own profile"
on public.sellers
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Sellers can view all orders" on public.orders;
drop policy if exists "Sellers can update orders" on public.orders;

create policy "Sellers can view own orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.sellers s
    where s.id = public.orders.seller_id
      and s.user_id = (select auth.uid())
  )
);

create policy "Sellers can update own orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.sellers s
    where s.id = public.orders.seller_id
      and s.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.sellers s
    where s.id = public.orders.seller_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "Allow insert from clients" on public.client_error_logs;
drop policy if exists "Service role can read logs" on public.client_error_logs;

create policy "Allow authenticated clients to insert scoped error logs"
on public.client_error_logs
for insert
to authenticated
with check (
  user_id is null
  or user_id = ((select auth.uid())::text)
);

create policy "Service role can read error logs"
on public.client_error_logs
for select
to service_role
using (true);

-- Phase 3: data repair + integrity constraints
create table if not exists ops.phase3_deleted_sellers_20260515 as
select * from public.sellers where false;

insert into ops.phase3_deleted_sellers_20260515
select * from public.sellers
where user_id is null;

delete from public.sellers
where user_id is null;

create unique index if not exists sellers_phone_unique_idx on public.sellers (phone);
create index if not exists sellers_user_id_idx on public.sellers (user_id);
create index if not exists orders_customer_id_idx on public.orders (customer_id);

alter table public.sellers
alter column user_id set not null;
