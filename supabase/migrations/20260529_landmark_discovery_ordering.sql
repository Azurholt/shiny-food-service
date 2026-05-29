-- Landmark discovery, seller directions, menu items, and relational order items
-- Safe to run multiple times (idempotent)

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  seller_user_id uuid references auth.users(id) on delete cascade,
  customer_name text,
  items jsonb default '[]'::jsonb,
  total_price numeric(10,2) not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'paid',
  is_special_customer boolean not null default false,
  stitch_image text,
  created_at timestamptz not null default now()
);

alter table if exists public.orders
  add column if not exists customer_id uuid,
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
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_id'
  ) and not exists (
    select 1 from pg_constraint where conname = 'orders_customer_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete set null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'seller_user_id'
  ) and not exists (
    select 1 from pg_constraint where conname = 'orders_seller_user_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_seller_user_id_fkey
      foreign key (seller_user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

alter table if exists public.sellers
  add column if not exists direction_note text,
  add column if not exists rating_avg numeric(3,2) not null default 0,
  add column if not exists rating_count integer not null default 0,
  add column if not exists status text default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sellers_direction_note_length'
  ) then
    alter table public.sellers
      add constraint sellers_direction_note_length
      check (direction_note is null or char_length(direction_note) <= 200);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sellers_rating_avg_range'
  ) then
    alter table public.sellers
      add constraint sellers_rating_avg_range
      check (rating_avg >= 0 and rating_avg <= 5);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sellers_rating_count_nonnegative'
  ) then
    alter table public.sellers
      add constraint sellers_rating_count_nonnegative
      check (rating_count >= 0);
  end if;
end $$;

create index if not exists idx_sellers_location_category
  on public.sellers (location, food_category);

create index if not exists idx_sellers_food_category_location
  on public.sellers (food_category, location);

create table if not exists public.seller_menu_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  unit_price numeric(10,2) not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'seller_menu_items_name_length'
  ) then
    alter table public.seller_menu_items
      add constraint seller_menu_items_name_length
      check (char_length(btrim(item_name)) between 1 and 80);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'seller_menu_items_unit_price_positive'
  ) then
    alter table public.seller_menu_items
      add constraint seller_menu_items_unit_price_positive
      check (unit_price > 0);
  end if;
end $$;

create index if not exists idx_seller_menu_items
  on public.seller_menu_items (seller_id, is_active, sort_order);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  total numeric(10,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_items_name_length'
  ) then
    alter table public.order_items
      add constraint order_items_name_length
      check (char_length(btrim(item_name)) between 1 and 80);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_items_quantity_positive'
  ) then
    alter table public.order_items
      add constraint order_items_quantity_positive
      check (quantity > 0 and quantity <= 99);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_items_unit_price_nonnegative'
  ) then
    alter table public.order_items
      add constraint order_items_unit_price_nonnegative
      check (unit_price >= 0);
  end if;
end $$;

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_orders_customer_id_created_at
  on public.orders (customer_id, created_at desc);

create index if not exists idx_orders_seller_user_id_status
  on public.orders (seller_user_id, status);

alter table if exists public.sellers enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.seller_menu_items enable row level security;
alter table if exists public.order_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'sellers'
      and policyname = 'sellers_select_discoverable_authenticated'
  ) then
    create policy sellers_select_discoverable_authenticated
      on public.sellers
      for select
      to authenticated
      using (status is null or status in ('pending', 'active'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'sellers'
      and policyname = 'sellers_update_own'
  ) then
    create policy sellers_update_own
      on public.sellers
      for update
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_select_customer'
  ) then
    create policy orders_select_customer
      on public.orders
      for select
      to authenticated
      using ((select auth.uid()) = customer_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_insert_customer'
  ) then
    create policy orders_insert_customer
      on public.orders
      for insert
      to authenticated
      with check ((select auth.uid()) = customer_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_menu_items'
      and policyname = 'seller_menu_items_select_authenticated'
  ) then
    create policy seller_menu_items_select_authenticated
      on public.seller_menu_items
      for select
      to authenticated
      using (is_active or (select auth.uid()) = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_menu_items'
      and policyname = 'seller_menu_items_insert_owner'
  ) then
    create policy seller_menu_items_insert_owner
      on public.seller_menu_items
      for insert
      to authenticated
      with check ((select auth.uid()) = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_menu_items'
      and policyname = 'seller_menu_items_update_owner'
  ) then
    create policy seller_menu_items_update_owner
      on public.seller_menu_items
      for update
      to authenticated
      using ((select auth.uid()) = seller_id)
      with check ((select auth.uid()) = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_menu_items'
      and policyname = 'seller_menu_items_delete_owner'
  ) then
    create policy seller_menu_items_delete_owner
      on public.seller_menu_items
      for delete
      to authenticated
      using ((select auth.uid()) = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'order_items'
      and policyname = 'order_items_select_order_party'
  ) then
    create policy order_items_select_order_party
      on public.order_items
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.orders
          where orders.id = order_items.order_id
            and (orders.customer_id = (select auth.uid()) or orders.seller_user_id = (select auth.uid()))
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'order_items'
      and policyname = 'order_items_insert_customer'
  ) then
    create policy order_items_insert_customer
      on public.order_items
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.orders
          where orders.id = order_items.order_id
            and orders.customer_id = (select auth.uid())
        )
      );
  end if;
end $$;

create materialized view if not exists public.seller_hourly_busyness as
select
  sellers.user_id as seller_user_id,
  count(orders.id)::integer as active_order_count,
  date_trunc('hour', now()) as calculated_hour
from public.sellers
left join public.orders
  on orders.seller_user_id = sellers.user_id
  and orders.status in ('pending', 'cooking', 'ready')
group by sellers.user_id
with data;

create unique index if not exists seller_hourly_busyness_seller_user_id_idx
  on public.seller_hourly_busyness (seller_user_id);

create or replace function public.create_customer_order(
  p_seller_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_customer_name text;
  v_order_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_item_name text;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_items_snapshot jsonb := '[]'::jsonb;
begin
  if v_customer_id is null then
    raise exception 'You need to sign in before ordering.';
  end if;

  if not exists (
    select 1
    from public.sellers
    where user_id = p_seller_id
      and (status is null or status in ('pending', 'active'))
  ) then
    raise exception 'This stall is not available for ordering.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 20 then
    raise exception 'Add between 1 and 20 order items.';
  end if;

  select coalesce(phone, 'Customer')
  into v_customer_name
  from public.customers
  where id = v_customer_id;

  v_customer_name := coalesce(v_customer_name, 'Customer');

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_name := btrim(coalesce(v_item->>'item_name', ''));
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    v_unit_price := coalesce((v_item->>'unit_price')::numeric, -1);

    if char_length(v_item_name) < 1 or char_length(v_item_name) > 80 then
      raise exception 'Order item names must be 1 to 80 characters.';
    end if;

    if v_quantity < 1 or v_quantity > 99 then
      raise exception 'Order item quantities must be between 1 and 99.';
    end if;

    if v_unit_price < 0 or v_unit_price > 9999.99 then
      raise exception 'Order item prices must be valid.';
    end if;

    v_total := v_total + (v_quantity * v_unit_price);
    v_items_snapshot := v_items_snapshot || jsonb_build_array(
      jsonb_build_object(
        'name', v_item_name,
        'quantity', v_quantity,
        'price', v_unit_price
      )
    );
  end loop;

  insert into public.orders (
    customer_id,
    seller_user_id,
    customer_name,
    items,
    total_price,
    status,
    payment_status,
    is_special_customer,
    created_at
  )
  values (
    v_customer_id,
    p_seller_id,
    v_customer_name,
    v_items_snapshot,
    v_total,
    'pending',
    'pending',
    false,
    now()
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id,
      item_name,
      quantity,
      unit_price
    )
    values (
      v_order_id,
      btrim(v_item->>'item_name'),
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric
    );
  end loop;

  return v_order_id;
end;
$$;

grant usage on schema public to authenticated;
grant select, update on public.sellers to authenticated;
grant select, insert, update, delete on public.seller_menu_items to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select on public.seller_hourly_busyness to authenticated;
grant execute on function public.create_customer_order(uuid, jsonb) to authenticated;

-- Optional hourly refresh with pg_cron if enabled:
-- select cron.schedule('refresh-seller-hourly-busyness', '0 * * * *', 'refresh materialized view concurrently public.seller_hourly_busyness');
