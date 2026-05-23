-- Customer auth + profile schema
-- Safe to run multiple times (idempotent)

create table if not exists public.customers (
  id uuid primary key default auth.uid(),
  phone text unique not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  alter column id set default auth.uid();

alter table public.customers
  add column if not exists display_name text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists customers_phone_unique_idx on public.customers (phone);

alter table if exists public.customers enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customers'
      and policyname = 'customers_select_own'
  ) then
    create policy customers_select_own
      on public.customers
      for select
      to authenticated
      using ((select auth.uid()) = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customers'
      and policyname = 'customers_update_own'
  ) then
    create policy customers_update_own
      on public.customers
      for update
      to authenticated
      using ((select auth.uid()) = id)
      with check ((select auth.uid()) = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customers'
      and policyname = 'customers_insert_own'
  ) then
    create policy customers_insert_own
      on public.customers
      for insert
      to authenticated
      with check ((select auth.uid()) = id);
  end if;
end $$;

create table if not exists public.auth_rate_limits (
  scope text not null,
  phone text not null,
  window_start timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (scope, phone, window_start)
);

create index if not exists auth_rate_limits_scope_phone_window_idx
  on public.auth_rate_limits (scope, phone, window_start);

alter table if exists public.auth_rate_limits disable row level security;
