alter table if exists public.orders
  add column if not exists seller_user_id uuid,
  add column if not exists customer_name text,
  add column if not exists items jsonb default '[]'::jsonb,
  add column if not exists total_price numeric(12,2) default 0,
  add column if not exists status text default 'pending',
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

create table if not exists public.seller_trusted_customers (
  id bigserial primary key,
  seller_user_id uuid not null,
  customer_name text not null,
  created_at timestamptz not null default now(),
  unique (seller_user_id, customer_name)
);

create index if not exists idx_orders_seller_user_id_created_at
  on public.orders (seller_user_id, created_at desc);

create index if not exists idx_seller_trusted_customers_seller_user_id
  on public.seller_trusted_customers (seller_user_id);

alter table public.seller_trusted_customers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_trusted_customers'
      and policyname = 'seller trusted customers owner access'
  ) then
    create policy "seller trusted customers owner access"
      on public.seller_trusted_customers
      for all
      using (auth.uid() = seller_user_id)
      with check (auth.uid() = seller_user_id);
  end if;
end $$;
