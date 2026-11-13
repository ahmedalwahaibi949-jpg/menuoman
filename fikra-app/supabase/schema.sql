-- FIKRA DIGITAL: database schema, access rules and storage.
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Roles: every sign-up becomes a 'customer'. Make yourself the administrator by hand, after signing up:
--   update public.profiles set role = 'admin' where email = 'you@example.com';

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text not null default '' check (char_length(full_name) <= 80),
  company    text not null default '' check (char_length(company) <= 80),
  phone      text not null default '' check (char_length(phone) <= 30),
  role       text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- A new auth user always gets a customer profile. The role never comes from sign-up data.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, email, full_name, company, phone)
  values (new.id, lower(new.email), left(coalesce(m ->> 'full_name', ''), 80), left(coalesce(m ->> 'company', ''), 80), left(coalesce(m ->> 'phone', ''), 30));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Customers can edit their own details but never their role, email or id.
create or replace function public.profiles_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role; new.email := old.email; new.id := old.id; new.created_at := old.created_at;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.profiles_guard();

alter table public.profiles enable row level security;
drop policy if exists "own profile or admin reads" on public.profiles;
create policy "own profile or admin reads" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "own profile or admin updates" on public.profiles;
create policy "own profile or admin updates" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------- enquiries (contact form)
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(full_name) between 3 and 80),
  company     text not null default '' check (char_length(company) <= 80),
  email       text not null check (email ~* '^[^\s@]+@[^\s@]+\.[a-z]{2,}$'),
  phone       text not null check (char_length(phone) between 8 and 30),
  service     text not null check (char_length(service) between 1 and 120),
  budget      text not null check (char_length(budget) between 1 and 60),
  description text not null check (char_length(description) between 20 and 2000),
  status      text not null default 'new' check (status in ('new', 'contacted', 'won', 'closed')),
  created_at  timestamptz not null default now()
);
create or replace function public.enquiries_before_insert()
returns trigger language plpgsql as $$ begin new.status := 'new'; new.created_at := now(); return new; end $$;
drop trigger if exists enquiries_before_insert on public.enquiries;
create trigger enquiries_before_insert before insert on public.enquiries for each row execute function public.enquiries_before_insert();
alter table public.enquiries enable row level security;
drop policy if exists "anyone can enquire" on public.enquiries;
create policy "anyone can enquire" on public.enquiries for insert to anon, authenticated with check (true);
drop policy if exists "admin manages enquiries" on public.enquiries;
create policy "admin manages enquiries" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- client work
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 3 and 120),
  service     text not null default '',
  status      text not null default 'planning' check (status in ('planning', 'design', 'development', 'review', 'live')),
  progress    int  not null default 0 check (progress between 0 and 100),
  summary     text not null default '',
  updates     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create table if not exists public.requests (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  project_id  uuid references public.projects (id) on delete set null,
  subject     text not null check (char_length(subject) between 3 and 120),
  body        text not null check (char_length(body) between 10 and 2000),
  status      text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  created_at  timestamptz not null default now()
);
create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  project_id  uuid references public.projects (id) on delete set null,
  number      text not null,
  amount      numeric(10,3) not null check (amount >= 0),
  status      text not null default 'due' check (status in ('due', 'paid')),
  due_date    date not null,
  created_at  timestamptz not null default now()
);
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 1000),
  from_admin  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists projects_customer_idx on public.projects (customer_id);
create index if not exists requests_customer_idx on public.requests (customer_id);
create index if not exists invoices_customer_idx on public.invoices (customer_id);
create index if not exists messages_customer_idx on public.messages (customer_id, created_at);

alter table public.projects enable row level security;
alter table public.requests enable row level security;
alter table public.invoices enable row level security;
alter table public.messages enable row level security;

-- Customers read only their own rows; the administrator reads and writes everything.
drop policy if exists "read own projects" on public.projects;
create policy "read own projects" on public.projects for select to authenticated using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "admin writes projects" on public.projects;
create policy "admin writes projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own requests" on public.requests;
create policy "read own requests" on public.requests for select to authenticated using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "customer submits requests" on public.requests;
create policy "customer submits requests" on public.requests for insert to authenticated
  with check (customer_id = auth.uid() and status = 'open'
              and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.customer_id = auth.uid())));
drop policy if exists "admin manages requests" on public.requests;
create policy "admin manages requests" on public.requests for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own invoices" on public.invoices;
create policy "read own invoices" on public.invoices for select to authenticated using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "admin writes invoices" on public.invoices;
create policy "admin writes invoices" on public.invoices for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own messages" on public.messages;
create policy "read own messages" on public.messages for select to authenticated using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "customer sends messages" on public.messages;
create policy "customer sends messages" on public.messages for insert to authenticated with check (customer_id = auth.uid() and from_admin = false);
drop policy if exists "admin manages messages" on public.messages;
create policy "admin manages messages" on public.messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- website content (prices, services, portfolio, …)
-- (If you ran an earlier version of this file, the allowed keys are refreshed just below the table.)
create table if not exists public.content (
  key        text primary key check (key in ('services', 'projects', 'pricing', 'site', 'testimonials', 'about', 'boards')),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.content drop constraint if exists content_key_check;
alter table public.content add constraint content_key_check check (key in ('services', 'projects', 'pricing', 'site', 'testimonials', 'about', 'boards'));
alter table public.content enable row level security;
drop policy if exists "public reads content" on public.content;
create policy "public reads content" on public.content for select to anon, authenticated using (true);
drop policy if exists "admin writes content" on public.content;
create policy "admin writes content" on public.content for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- basic analytics
create table if not exists public.page_views (
  id         bigint generated always as identity primary key,
  path       text not null check (char_length(path) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at);
alter table public.page_views enable row level security;
drop policy if exists "anyone records a view" on public.page_views;
create policy "anyone records a view" on public.page_views for insert to anon, authenticated with check (true);
drop policy if exists "admin reads views" on public.page_views;
create policy "admin reads views" on public.page_views for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- file storage (private)
-- Files live under <customer id>/<file>. Customers read their own folder; the administrator manages all.
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
drop policy if exists "customers read own files" on storage.objects;
create policy "customers read own files" on storage.objects for select to authenticated
  using (bucket_id = 'project-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "admin manages files" on storage.objects;
create policy "admin manages files" on storage.objects for all to authenticated
  using (bucket_id = 'project-files' and public.is_admin()) with check (bucket_id = 'project-files' and public.is_admin());

-- ---------------------------------------------------------------- restaurant menu boards
-- One row per restaurant menu. `draft` is what the owner edits; `published` is what the TV screens and the QR menu show.
create table if not exists public.boards (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  restaurant   text not null check (char_length(restaurant) between 2 and 80),
  draft        jsonb not null,
  published    jsonb,
  published_at timestamptz,
  status       text not null default 'trial' check (status in ('trial', 'active', 'paused')),
  created_at   timestamptz not null default now()
);
alter table public.boards add column if not exists paid_until timestamptz;
create index if not exists boards_owner_idx on public.boards (owner_id);

-- Owners edit their draft and name only. Publishing goes through board_publish(); the subscription status is the administrator's.
create or replace function public.boards_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() and coalesce(current_setting('fikra.publishing', true), '') <> '1' then
    if tg_op = 'INSERT' then
      new.owner_id := auth.uid(); new.status := 'trial'; new.published := null; new.published_at := null; new.created_at := now(); new.paid_until := null;
    else
      new.owner_id := old.owner_id; new.status := old.status; new.published := old.published; new.published_at := old.published_at; new.created_at := old.created_at; new.paid_until := old.paid_until;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists boards_guard on public.boards;
create trigger boards_guard before insert or update on public.boards for each row execute function public.boards_guard();

alter table public.boards enable row level security;
drop policy if exists "owner or admin reads boards" on public.boards;
create policy "owner or admin reads boards" on public.boards for select to authenticated using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "owner creates boards" on public.boards;
create policy "owner creates boards" on public.boards for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "owner or admin updates boards" on public.boards;
create policy "owner or admin updates boards" on public.boards for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
drop policy if exists "admin deletes boards" on public.boards;
create policy "admin deletes boards" on public.boards for delete to authenticated using (public.is_admin());

-- Copy the draft to the published version. Only the owner (or the administrator) can do this, and not while paused.
create or replace function public.board_publish(board uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('fikra.publishing', '1', true);
  update public.boards set published = draft, published_at = now()
  where id = board and (owner_id = auth.uid() or public.is_admin()) and (status <> 'paused' or public.is_admin());
  if not found then raise exception 'not allowed'; end if;
end $$;
revoke all on function public.board_publish(uuid) from public;
grant execute on function public.board_publish(uuid) to authenticated;

-- Public read of the published menu only (never the draft), for the TV display and the QR menu.
-- A menu is shown while it is not paused and is either paid for, marked active by the administrator, or inside the 14-day free trial.
create or replace function public.board_live(b public.boards)
returns boolean language sql stable as $$
  select b.status <> 'paused' and (coalesce(b.paid_until, 'epoch'::timestamptz) > now() or (b.status = 'active' and b.paid_until is null) or b.created_at + interval '14 days' > now());
$$;
drop function if exists public.board_public(uuid);
create function public.board_public(board uuid)
returns table (restaurant text, published jsonb, published_at timestamptz, live boolean) language sql stable security definer set search_path = public as $$
  select b.restaurant, case when public.board_live(b) then b.published end, b.published_at, public.board_live(b)
  from public.boards b where b.id = board and b.published is not null;
$$;
grant execute on function public.board_public(uuid) to anon, authenticated;

-- Subscription payments by bank transfer. The owner sends a receipt; only the administrator can confirm it.
create table if not exists public.board_payments (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  owner_id   uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  months     int not null check (months in (1, 3, 12)),
  amount     numeric(10,3) not null check (amount >= 0),
  receipt    text not null check (char_length(receipt) between 3 and 300),
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists board_payments_owner_idx on public.board_payments (owner_id);
alter table public.board_payments enable row level security;
drop policy if exists "owner or admin reads payments" on public.board_payments;
create policy "owner or admin reads payments" on public.board_payments for select to authenticated using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "owner sends payment" on public.board_payments;
create policy "owner sends payment" on public.board_payments for insert to authenticated
  with check (owner_id = auth.uid() and status = 'pending' and exists (select 1 from public.boards b where b.id = board_id and b.owner_id = auth.uid()));
-- No update or delete policy: a payment changes only through payment_decide().

create or replace function public.payment_decide(pid uuid, approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare p public.board_payments;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select * into p from public.board_payments where id = pid and status = 'pending' for update;
  if not found then raise exception 'not pending'; end if;
  update public.board_payments set status = case when approve then 'approved' else 'rejected' end where id = pid;
  if approve then
    update public.boards set paid_until = greatest(coalesce(paid_until, now()), now()) + make_interval(months => p.months), status = 'active' where id = p.board_id;
  end if;
end $$;
revoke all on function public.payment_decide(uuid, boolean) from public;
grant execute on function public.payment_decide(uuid, boolean) to authenticated;

-- Transfer receipts: private. Each owner uploads into their own folder; only that owner and the administrator can open them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 6291456, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "owners upload receipts" on storage.objects;
create policy "owners upload receipts" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owner or admin reads receipts" on storage.objects;
create policy "owner or admin reads receipts" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Menu photos: public to view, each owner uploads into their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-photos', 'menu-photos', true, 6291456, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "owners upload menu photos" on storage.objects;
create policy "owners upload menu photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners delete own menu photos" on storage.objects;
create policy "owners delete own menu photos" on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
