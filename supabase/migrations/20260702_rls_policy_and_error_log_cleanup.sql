-- RLS policy cleanup and duplicate error-log index removal
-- Safe to run multiple times

-- Customers: keep one policy per action and use init-plan auth checks
drop policy if exists "Users can view own profile" on public.customers;
drop policy if exists "Users can update own profile" on public.customers;
drop policy if exists "Users can insert own profile" on public.customers;
drop policy if exists customers_select_own on public.customers;
drop policy if exists customers_update_own on public.customers;
drop policy if exists customers_insert_own on public.customers;

create policy customers_select_own
  on public.customers
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy customers_update_own
  on public.customers
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy customers_insert_own
  on public.customers
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Sellers: preserve discoverability while allowing owners to manage their profile
drop policy if exists "Sellers can view own profile" on public.sellers;
drop policy if exists "Sellers can update own profile" on public.sellers;
drop policy if exists sellers_select_discoverable_authenticated on public.sellers;
drop policy if exists sellers_update_own on public.sellers;

create policy sellers_select_discoverable_authenticated
  on public.sellers
  for select
  to authenticated
  using (
    status is null
    or status in ('pending', 'active')
    or (select auth.uid()) = user_id
  );

create policy sellers_update_own
  on public.sellers
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Orders: merge access paths into one select policy and keep write policies narrow
drop policy if exists "Customers can view own orders" on public.orders;
drop policy if exists "Customers can insert orders" on public.orders;
drop policy if exists "Sellers can view own orders" on public.orders;
drop policy if exists "Sellers can update own orders" on public.orders;
drop policy if exists orders_select_owner on public.orders;
drop policy if exists orders_insert_owner on public.orders;
drop policy if exists orders_update_owner on public.orders;
drop policy if exists orders_delete_owner on public.orders;
drop policy if exists orders_select_customer on public.orders;
drop policy if exists orders_insert_customer on public.orders;

create policy orders_select_customer_or_seller
  on public.orders
  for select
  to authenticated
  using (
    (select auth.uid()) = customer_id
    or (select auth.uid()) = seller_user_id
  );

create policy orders_insert_customer
  on public.orders
  for insert
  to authenticated
  with check ((select auth.uid()) = customer_id);

create policy orders_update_owner
  on public.orders
  for update
  to authenticated
  using ((select auth.uid()) = seller_user_id)
  with check ((select auth.uid()) = seller_user_id);

create policy orders_delete_owner
  on public.orders
  for delete
  to authenticated
  using ((select auth.uid()) = seller_user_id);

-- Special customers: keep one owner policy per action and use init-plan auth checks
drop policy if exists special_customers_select_owner on public.special_customers;
drop policy if exists special_customers_insert_owner on public.special_customers;
drop policy if exists special_customers_update_owner on public.special_customers;
drop policy if exists special_customers_delete_owner on public.special_customers;

create policy special_customers_select_owner
  on public.special_customers
  for select
  to authenticated
  using ((select auth.uid()) = seller_id);

create policy special_customers_insert_owner
  on public.special_customers
  for insert
  to authenticated
  with check ((select auth.uid()) = seller_id);

create policy special_customers_update_owner
  on public.special_customers
  for update
  to authenticated
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);

create policy special_customers_delete_owner
  on public.special_customers
  for delete
  to authenticated
  using ((select auth.uid()) = seller_id);

-- Duplicate index cleanup for client error logs
drop index if exists public.idx_error_logs_occurred;
drop index if exists public.idx_error_logs_occurred_at;

create index if not exists idx_error_logs_occurred_at
  on public.client_error_logs (occurred_at);
