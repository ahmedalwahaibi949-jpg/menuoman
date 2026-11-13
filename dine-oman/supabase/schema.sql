-- Dine Oman: accounts, roles, restaurants, customer data and storage.
-- Run in Supabase → SQL Editor on a fresh project. Safe to re-run.
--
-- Roles live in public.user_profiles.role ('customer' | 'owner' | 'admin').
-- Sign-up can only ever create 'customer' or 'owner'. 'admin' is granted here, by hand:
--   update public.user_profiles set role = 'admin' where email = 'you@dineoman.com';

create extension if not exists pgcrypto;

-- =====================================================================
-- USER PROFILES (one per auth user)
-- =====================================================================
create table if not exists public.user_profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  email                 text not null,
  role                  text not null default 'customer' check (role in ('customer', 'owner', 'admin')),
  full_name             text check (char_length(full_name) <= 80),
  mobile                text check (mobile is null or mobile ~ '^\+968[2-9][0-9]{7}$'),
  whatsapp              text check (whatsapp is null or whatsapp ~ '^\+968[79][0-9]{7}$'),
  avatar_url            text,
  deletion_requested_at timestamptz,
  deletion_reason       text check (char_length(deletion_reason) <= 500),
  created_at            timestamptz not null default now()
);

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.user_profiles where id = auth.uid();
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.user_profiles where id = auth.uid()), false);
$$;
grant execute on function public.my_role(), public.is_admin() to anon, authenticated;

-- Nobody but an admin (or the SQL editor) can change a role or the stored email.
create or replace function public.user_profiles_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and coalesce(current_setting('dine.internal', true), '') <> '1' then
    new.role := old.role;
    new.email := old.email;
    new.id := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;
drop trigger if exists user_profiles_guard on public.user_profiles;
create trigger user_profiles_guard before update on public.user_profiles
  for each row execute function public.user_profiles_guard();

alter table public.user_profiles enable row level security;
drop policy if exists "read own profile or admin" on public.user_profiles;
create policy "read own profile or admin" on public.user_profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "update own profile or admin" on public.user_profiles;
create policy "update own profile or admin" on public.user_profiles
  for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
-- No insert policy: rows are created by the auth trigger below.

-- =====================================================================
-- RESTAURANTS (applications and public profiles are the same row)
-- status: awaiting_verification → pending → approved | rejected
-- =====================================================================
create table if not exists public.restaurants (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.user_profiles (id) on delete cascade,
  reference      text not null unique default ('DO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  status         text not null default 'pending' check (status in ('awaiting_verification', 'pending', 'approved', 'rejected')),
  slug           text unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  published      boolean not null default false,
  plan           text not null default 'free' check (plan in ('free', 'standard', 'premium', 'featured')),
  name           text not null check (char_length(name) between 2 and 80),
  name_ar        text check (char_length(name_ar) <= 80),
  category       text not null,
  cuisine        text not null,
  governorate    text not null,
  city           text not null,
  area           text not null check (char_length(area) between 2 and 80),
  address        text not null check (char_length(address) between 5 and 200),
  maps_url       text not null check (char_length(maps_url) between 5 and 500),
  description    text not null check (char_length(description) between 40 and 800),
  description_ar text check (char_length(description_ar) <= 800),
  contact_phone  text not null check (contact_phone ~ '^\+968[2-9][0-9]{7}$'),
  instagram      text not null check (instagram ~* '^[a-z0-9._]{1,30}$'),
  website        text not null check (website ~* '^https?://'),
  logo_url       text not null,
  cover_url      text not null,
  photos         text[] not null default '{}' check (cardinality(photos) <= 24),
  hours          jsonb not null default '{}'::jsonb,
  price_range    text,
  features       text[] not null default '{}',
  menu_url       text,
  admin_note     text,
  submitted_at   timestamptz,
  reviewed_at    timestamptz,
  approved_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists restaurants_owner_idx on public.restaurants (owner_id);
create index if not exists restaurants_live_idx on public.restaurants (status, published, plan);

create or replace function public.slugify(t text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Owners can never set status, slug, publishing, notes or (after submission) plan.
create or replace function public.restaurants_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare base text; candidate text; n int := 1;
begin
  if coalesce(current_setting('dine.internal', true), '') = '1' then
    new.updated_at := now();
    if tg_op = 'INSERT' then return new; end if;
  end if;
  if tg_op = 'INSERT' then
    -- Direct inserts by signed-in owners (new branches). The sign-up trigger sets dine.internal.
    if auth.uid() is not null and not public.is_admin() then
      new.status := 'pending';
      new.slug := null; new.published := false; new.admin_note := null;
      new.reviewed_at := null; new.approved_at := null;
      new.submitted_at := now();
      if auth.uid() is not null then new.owner_id := auth.uid(); end if;
    end if;
    new.created_at := now();
  else
    if auth.uid() is not null and not public.is_admin()
       and coalesce(current_setting('dine.internal', true), '') <> '1' then
      -- The one status change an owner may make: resubmitting a rejected application.
      if not (old.status = 'rejected' and new.status = 'pending') then new.status := old.status; end if;
      new.owner_id := old.owner_id; new.slug := old.slug;
      new.published := old.published; new.admin_note := old.admin_note;
      new.reviewed_at := old.reviewed_at; new.approved_at := old.approved_at;
      new.submitted_at := case when new.status = 'pending' and old.status = 'rejected' then now() else old.submitted_at end;
      new.reference := old.reference;
      if old.status not in ('awaiting_verification', 'pending', 'rejected') then new.plan := old.plan; end if;
    end if;
    if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
      new.reviewed_at := now();
    end if;
  end if;

  -- Approval creates the public profile: a unique slug and published = true.
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    new.approved_at := coalesce(new.approved_at, now());
    new.published := true;
    if new.slug is null then
      base := public.slugify(new.name);
      if base = '' then base := 'restaurant'; end if;
      candidate := base;
      if exists (select 1 from public.restaurants where slug = candidate and id <> new.id) then
        candidate := base || '-' || public.slugify(new.area);
      end if;
      while exists (select 1 from public.restaurants where slug = candidate and id <> new.id) loop
        n := n + 1; candidate := base || '-' || n;
      end loop;
      new.slug := candidate;
    end if;
  end if;
  if new.status <> 'approved' then new.published := false; end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists restaurants_guard on public.restaurants;
create trigger restaurants_guard before insert or update on public.restaurants
  for each row execute function public.restaurants_guard();

alter table public.restaurants enable row level security;
drop policy if exists "public reads live restaurants" on public.restaurants;
create policy "public reads live restaurants" on public.restaurants
  for select to anon, authenticated
  using ((status = 'approved' and published) or owner_id = auth.uid() or public.is_admin());
drop policy if exists "owners add branches" on public.restaurants;
create policy "owners add branches" on public.restaurants
  for insert to authenticated
  with check (owner_id = auth.uid() and public.my_role() = 'owner');
drop policy if exists "owners edit own restaurants" on public.restaurants;
create policy "owners edit own restaurants" on public.restaurants
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
drop policy if exists "admins delete restaurants" on public.restaurants;
create policy "admins delete restaurants" on public.restaurants
  for delete to authenticated using (public.is_admin());

-- =====================================================================
-- AUTH TRIGGERS: create the profile (and the owner's first application)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r jsonb := m -> 'restaurant';
  is_owner boolean := (m ->> 'account_type') = 'owner';
begin
  perform set_config('dine.internal', '1', true);
  insert into public.user_profiles (id, email, role, full_name, mobile, whatsapp, avatar_url)
  values (
    new.id, lower(new.email),
    case when is_owner then 'owner' else 'customer' end,   -- never 'admin'
    coalesce(m ->> 'full_name', m ->> 'name'),
    nullif(m ->> 'mobile', ''),
    case when is_owner then nullif(m ->> 'whatsapp', '') end,
    m ->> 'avatar_url'
  );
  if is_owner and r is not null then
    insert into public.restaurants (owner_id, status, plan, name, category, cuisine, governorate, city, area, address,
      maps_url, description, contact_phone, instagram, website, logo_url, cover_url, photos, submitted_at)
    values (
      new.id,
      case when new.email_confirmed_at is null then 'awaiting_verification' else 'pending' end,
      coalesce(r ->> 'plan', 'free'), r ->> 'name', r ->> 'category', r ->> 'cuisine', r ->> 'governorate',
      r ->> 'city', r ->> 'area', r ->> 'address', r ->> 'maps_url', r ->> 'description', r ->> 'contact_phone',
      r ->> 'instagram', r ->> 'website', r ->> 'logo_url', r ->> 'cover_url',
      coalesce(array(select jsonb_array_elements_text(r -> 'photos')), '{}'),
      case when new.email_confirmed_at is null then null else now() end
    );
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Email verified → the application moves to PENDING APPROVAL (which notifies the admin).
-- Email changed → keep the profile copy in sync.
create or replace function public.handle_user_updated()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('dine.internal', '1', true);
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.restaurants set status = 'pending', submitted_at = now()
    where owner_id = new.id and status = 'awaiting_verification';
  end if;
  if new.email is distinct from old.email then
    update public.user_profiles set email = lower(new.email) where id = new.id;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update on auth.users
  for each row execute function public.handle_user_updated();

-- =====================================================================
-- CUSTOMER DATA
-- =====================================================================
create table if not exists public.favourites (
  user_id       uuid not null references auth.users (id) on delete cascade default auth.uid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);
alter table public.favourites enable row level security;
drop policy if exists "own favourites" on public.favourites;
create policy "own favourites" on public.favourites
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.recently_viewed (
  user_id       uuid not null references auth.users (id) on delete cascade default auth.uid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  viewed_at     timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);
alter table public.recently_viewed enable row level security;
drop policy if exists "own history" on public.recently_viewed;
create policy "own history" on public.recently_viewed
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade default auth.uid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  author_name   text,
  rating        int not null check (rating between 1 and 5),
  body          text not null check (char_length(body) between 10 and 1000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, restaurant_id)
);
create or replace function public.reviews_stamp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then new.user_id := auth.uid(); end if;
  -- Store a first name + initial so public pages never need to read user_profiles.
  new.author_name := (select split_part(coalesce(full_name, 'Guest'), ' ', 1) ||
    coalesce(' ' || left(nullif(split_part(full_name, ' ', 2), ''), 1) || '.', '')
    from public.user_profiles where id = new.user_id);
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists reviews_stamp on public.reviews;
create trigger reviews_stamp before insert or update on public.reviews
  for each row execute function public.reviews_stamp();
alter table public.reviews enable row level security;
drop policy if exists "public reads reviews" on public.reviews;
create policy "public reads reviews" on public.reviews for select to anon, authenticated using (true);
drop policy if exists "customers write own reviews" on public.reviews;
create policy "customers write own reviews" on public.reviews
  for insert to authenticated with check (user_id = auth.uid() and public.my_role() = 'customer');
drop policy if exists "customers edit own reviews" on public.reviews;
create policy "customers edit own reviews" on public.reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own or admin deletes reviews" on public.reviews;
create policy "own or admin deletes reviews" on public.reviews
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- =====================================================================
-- STORAGE
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-media', 'restaurant-media', true, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Owner sign-up uploads happen before the account exists (email not yet verified).
drop policy if exists "signup uploads" on storage.objects;
create policy "signup uploads" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'restaurant-media'
              and name ~ '^pending/[0-9a-f-]{36}/(logo|cover|photo-[0-9]{1,2})\.[a-z0-9]{2,5}$');
-- Signed-in owners upload into their own folder.
drop policy if exists "owner uploads" on storage.objects;
create policy "owner uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'restaurant-media' and (storage.foldername(name))[1] = 'owners'
              and (storage.foldername(name))[2] = auth.uid()::text and public.my_role() in ('owner', 'admin'));
drop policy if exists "owner deletes own uploads" on storage.objects;
create policy "owner deletes own uploads" on storage.objects for delete to authenticated
  using (bucket_id = 'restaurant-media' and (storage.foldername(name))[1] = 'owners'
         and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "admins manage media" on storage.objects;
create policy "admins manage media" on storage.objects for all to authenticated
  using (bucket_id = 'restaurant-media' and public.is_admin())
  with check (bucket_id = 'restaurant-media' and public.is_admin());
