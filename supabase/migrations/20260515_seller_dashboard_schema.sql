-- Seller dashboard schema upgrade
-- Safe to run multiple times (idempotent)

alter table if exists public.orders
  add column if not exists seller_user_id uuid,
  add column if not exists customer_name text,
  add column if not exists items jsonb default '[]'::jsonb,
  add column if not exists total_price numeric(10,2) not null default 0,
  add column if not exists status text default 'pending',
  add column if not exists payment_status text not null default 'paid',
  add column if not exists is_special_customer boolean not null default false,
  add column if not exists stitch_image text,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_status_valid'
  ) then
    alter table public.orders
      add constraint orders_status_valid
      check (status in ('pending', 'cooking', 'ready', 'completed'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payment_status_valid'
  ) then
    alter table public.orders
      add constraint orders_payment_status_valid
      check (payment_status in ('paid', 'pending', 'credit'));
  end if;
end $$;

create table if not exists public.special_customers (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  customer_name text not null,
  created_at timestamptz not null default now(),
  unique (seller_id, phone)
);

create index if not exists idx_orders_seller_user_id_created_at
  on public.orders (seller_user_id, created_at desc);

create index if not exists idx_special_customers_seller_id_created_at
  on public.special_customers (seller_id, created_at desc);

alter table if exists public.orders enable row level security;
alter table if exists public.special_customers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_select_owner'
  ) then
    create policy orders_select_owner
      on public.orders
      for select
      using (auth.uid() = seller_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_insert_owner'
  ) then
    create policy orders_insert_owner
      on public.orders
      for insert
      with check (auth.uid() = seller_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_update_owner'
  ) then
    create policy orders_update_owner
      on public.orders
      for update
      using (auth.uid() = seller_user_id)
      with check (auth.uid() = seller_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_delete_owner'
  ) then
    create policy orders_delete_owner
      on public.orders
      for delete
      using (auth.uid() = seller_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'special_customers'
      and policyname = 'special_customers_select_owner'
  ) then
    create policy special_customers_select_owner
      on public.special_customers
      for select
      using (auth.uid() = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'special_customers'
      and policyname = 'special_customers_insert_owner'
  ) then
    create policy special_customers_insert_owner
      on public.special_customers
      for insert
      with check (auth.uid() = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'special_customers'
      and policyname = 'special_customers_update_owner'
  ) then
    create policy special_customers_update_owner
      on public.special_customers
      for update
      using (auth.uid() = seller_id)
      with check (auth.uid() = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'special_customers'
      and policyname = 'special_customers_delete_owner'
  ) then
    create policy special_customers_delete_owner
      on public.special_customers
      for delete
      using (auth.uid() = seller_id);
  end if;
end $$;
