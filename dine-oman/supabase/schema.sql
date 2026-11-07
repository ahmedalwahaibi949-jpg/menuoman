-- Dine Oman: database schema, access rules and storage for restaurant registration.
-- Run once in Supabase → SQL Editor. Safe to re-run.

create extension if not exists pgcrypto;

-- ---------- Admins ----------
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;
-- No policies: only the service role (dashboard / SQL editor) can read or change admins.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Applications ----------
create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  restaurant_name text not null check (char_length(restaurant_name) between 2 and 80),
  owner_name      text not null check (char_length(owner_name) between 3 and 80),
  email           text not null check (email ~* '^[^\s@]+@[^\s@]+\.[a-z]{2,}$'),
  phone           text not null check (phone ~ '^\+968[2-9][0-9]{7}$'),
  whatsapp        text not null check (whatsapp ~ '^\+968[79][0-9]{7}$'),
  governorate     text not null,
  area            text not null check (char_length(area) between 2 and 80),
  location        text not null check (char_length(location) between 5 and 500),
  cuisine         text not null,
  description     text not null check (char_length(description) between 40 and 600),
  logo_url        text not null,
  cover_url       text not null,
  instagram       text not null check (instagram ~* '^[a-z0-9._]{1,30}$'),
  website         text not null check (website ~* '^https?://'),
  package         text not null check (package in ('basic', 'featured', 'premium')),
  admin_note      text,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz,
  reviewed_by     text
);
create index if not exists applications_status_idx on public.applications (status, created_at desc);
create index if not exists applications_email_idx on public.applications (lower(email));

-- Applicants can never set their own status, note or dates.
create or replace function public.applications_before_insert()
returns trigger language plpgsql as $$
begin
  new.status := 'pending';
  new.admin_note := null;
  new.reviewed_at := null;
  new.reviewed_by := null;
  new.created_at := now();
  new.email := lower(new.email);
  return new;
end $$;
drop trigger if exists applications_before_insert on public.applications;
create trigger applications_before_insert before insert on public.applications
  for each row execute function public.applications_before_insert();

-- Record which admin made the decision.
create or replace function public.applications_before_update()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_at := now();
    new.reviewed_by := lower(coalesce(auth.jwt() ->> 'email', 'system'));
  end if;
  return new;
end $$;
drop trigger if exists applications_before_update on public.applications;
create trigger applications_before_update before update on public.applications
  for each row execute function public.applications_before_update();

alter table public.applications enable row level security;

drop policy if exists "anyone can apply" on public.applications;
create policy "anyone can apply" on public.applications
  for insert to anon, authenticated with check (true);

drop policy if exists "owner or admin reads" on public.applications;
create policy "owner or admin reads" on public.applications
  for select to authenticated
  using (public.is_admin() or email = lower(auth.jwt() ->> 'email'));

drop policy if exists "admin decides" on public.applications;
create policy "admin decides" on public.applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes" on public.applications;
create policy "admin deletes" on public.applications
  for delete to authenticated using (public.is_admin());

-- ---------- Profiles (completed by the owner after approval) ----------
create table if not exists public.profiles (
  application_id uuid primary key references public.applications (id) on delete cascade,
  name_ar        text,
  description_ar text,
  booking_phone  text,
  hours          jsonb not null default '{}'::jsonb,
  price_range    text,
  features       text[] not null default '{}',
  dishes         jsonb not null default '[]'::jsonb,
  menu_url       text,
  gallery        text[] not null default '{}' check (cardinality(gallery) <= 12),
  published      boolean not null default false,
  updated_at     timestamptz not null default now()
);

create or replace function public.owns_approved(app uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.applications a
    where a.id = app and a.status = 'approved' and a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.owns_approved(uuid) to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "public reads published profiles" on public.profiles;
create policy "public reads published profiles" on public.profiles
  for select to anon, authenticated
  using (published or public.is_admin() or public.owns_approved(application_id));

drop policy if exists "approved owner creates profile" on public.profiles;
create policy "approved owner creates profile" on public.profiles
  for insert to authenticated with check (public.owns_approved(application_id) or public.is_admin());

drop policy if exists "approved owner edits profile" on public.profiles;
create policy "approved owner edits profile" on public.profiles
  for update to authenticated
  using (public.owns_approved(application_id) or public.is_admin())
  with check (public.owns_approved(application_id) or public.is_admin());

-- A public view of live restaurants, for the future directory pages.
create or replace view public.live_restaurants with (security_invoker = true) as
  select a.id, a.restaurant_name, p.name_ar, a.governorate, a.area, a.location, a.cuisine, a.description,
         p.description_ar, a.logo_url, a.cover_url, a.instagram, a.website, a.package,
         p.hours, p.price_range, p.features, p.dishes, p.menu_url, p.gallery, p.booking_phone, p.updated_at
  from public.applications a join public.profiles p on p.application_id = a.id
  where a.status = 'approved' and p.published;
-- Anonymous visitors cannot read applications, so expose the view through a definer function.
create or replace function public.list_live_restaurants()
returns setof public.live_restaurants language sql stable security definer set search_path = public as $$
  select a.id, a.restaurant_name, p.name_ar, a.governorate, a.area, a.location, a.cuisine, a.description,
         p.description_ar, a.logo_url, a.cover_url, a.instagram, a.website, a.package,
         p.hours, p.price_range, p.features, p.dishes, p.menu_url, p.gallery, p.booking_phone, p.updated_at
  from public.applications a join public.profiles p on p.application_id = a.id
  where a.status = 'approved' and p.published
  order by case a.package when 'premium' then 0 when 'featured' then 1 else 2 end, p.updated_at desc;
$$;
grant execute on function public.list_live_restaurants() to anon, authenticated;

-- ---------- Storage: logos, covers, gallery and menus ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-media', 'restaurant-media', true, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "applicants upload logo and cover" on storage.objects;
create policy "applicants upload logo and cover" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'restaurant-media'
    and name ~ '^applications/[0-9a-f-]{36}/(logo|cover)\.[a-z0-9]{2,5}$'
  );

drop policy if exists "approved owners upload profile media" on storage.objects;
create policy "approved owners upload profile media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'restaurant-media'
    and (storage.foldername(name))[1] = 'profiles'
    and public.owns_approved(((storage.foldername(name))[2])::uuid)
  );

drop policy if exists "admins manage media" on storage.objects;
create policy "admins manage media" on storage.objects
  for all to authenticated
  using (bucket_id = 'restaurant-media' and public.is_admin())
  with check (bucket_id = 'restaurant-media' and public.is_admin());

-- ---------- Add your administrators ----------
-- insert into public.admins (email) values ('you@dineoman.com') on conflict do nothing;
