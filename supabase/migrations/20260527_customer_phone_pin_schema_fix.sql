-- Customer phone+PIN schema fix
-- Idempotent and safe to run multiple times

create table if not exists public.customers (
  id uuid primary key default auth.uid(),
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.customers
set created_at = now()
where created_at is null;

update public.customers
set updated_at = now()
where updated_at is null;

alter table public.customers
  alter column id set default auth.uid(),
  alter column id set not null,
  alter column phone set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'full_name'
  ) then
    execute 'alter table public.customers alter column full_name drop not null';
    execute 'alter table public.customers drop column full_name';
  end if;
end $$;

alter table public.customers
  drop column if exists display_name;

create unique index if not exists customers_phone_unique_idx
  on public.customers (phone);

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
