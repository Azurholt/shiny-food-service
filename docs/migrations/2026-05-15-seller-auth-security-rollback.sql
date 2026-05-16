-- Rollback for 2026-05-15 seller auth and security hardening.
-- Note: this intentionally reverts to the previous known behavior, including weaker policies.

-- Phase 3 rollback: constraints/indexes/data
alter table public.sellers
alter column user_id drop not null;

drop index if exists sellers_phone_unique_idx;
drop index if exists sellers_user_id_idx;
drop index if exists orders_customer_id_idx;

insert into public.sellers
select *
from ops.phase3_deleted_sellers_20260515 d
where not exists (
  select 1
  from public.sellers s
  where s.id = d.id
);

-- Phase 1 rollback: policies and trigger/function exposure
drop policy if exists "Sellers can insert own profile" on public.sellers;
drop policy if exists "Sellers can view own profile" on public.sellers;
drop policy if exists "Sellers can update own profile" on public.sellers;

create policy "Allow insert for sellers"
on public.sellers
for insert
to anon
with check (true);

create policy "Enable insert during signup"
on public.sellers
for insert
to public
with check (auth.uid() = user_id);

create policy "Sellers can view own profile"
on public.sellers
for select
to public
using (auth.uid() = user_id);

create policy "Sellers can update own profile"
on public.sellers
for update
to public
using (auth.uid() = user_id);

drop policy if exists "Sellers can view own orders" on public.orders;
drop policy if exists "Sellers can update own orders" on public.orders;

create policy "Sellers can view all orders"
on public.orders
for select
to public
using (auth.role() = 'authenticated');

create policy "Sellers can update orders"
on public.orders
for update
to public
using (auth.role() = 'authenticated');

drop policy if exists "Allow authenticated clients to insert scoped error logs" on public.client_error_logs;
drop policy if exists "Service role can read error logs" on public.client_error_logs;

grant execute on function public.handle_seller_signup() to anon;
grant execute on function public.handle_seller_signup() to authenticated;
alter function public.handle_seller_signup() security definer;
alter function public.handle_seller_signup() reset search_path;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_seller_signup();
