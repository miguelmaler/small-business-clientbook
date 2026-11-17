-- =============================================================================
-- Client & job tracker for a small business (Supabase / Postgres)
-- Run once on a fresh project, via the SQL editor or as a migration.
-- =============================================================================


-- 1. Tables ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Filled from signup metadata, which the browser controls, so cap the size.
  constraint profiles_name_length  check (char_length(name)  <= 100),
  constraint profiles_phone_length check (char_length(phone) <= 40)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  -- Defaulting to auth.uid() means the app doesn't need to send user_id at all.
  -- RLS still rejects any value other than the caller's own id.
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text not null,
  address text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- NOT NULL still accepts '', so require real content; cap sizes everywhere.
  constraint clients_name_check    check (btrim(name) <> ''    and char_length(name)    <= 200),
  constraint clients_phone_check   check (btrim(phone) <> ''   and char_length(phone)   <= 40),
  constraint clients_address_check check (btrim(address) <> '' and char_length(address) <= 500),
  constraint clients_email_check   check (email is null or char_length(email) <= 254),
  constraint clients_notes_check   check (notes is null or char_length(notes) <= 5000),

  -- Redundant with the primary key, but required as the target of the composite
  -- foreign key on jobs below.
  constraint clients_id_user_id_key unique (id, user_id)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null,
  title text not null,
  description text not null default '',
  status text not null default 'pending',
  amount numeric(12, 2) not null default 0,
  billed boolean not null default false,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_title_check          check (btrim(title) <> '' and char_length(title) <= 200),
  constraint jobs_description_check    check (char_length(description) <= 5000),
  constraint jobs_status_check         check (status in ('pending', 'done')),
  constraint jobs_amount_check         check (amount >= 0),
  constraint jobs_paid_requires_billed check (paid = false or billed = true),

  -- Composite key: a job's client must belong to the same user as the job.
  -- A plain FK on client_id only proves the client exists, so one user could
  -- attach jobs to another user's client (blocking that client's deletion, and
  -- probing whether a given client id exists). RLS can't catch this because it
  -- only inspects jobs.user_id.
  constraint jobs_client_id_fkey
    foreign key (client_id, user_id)
    references public.clients (id, user_id)
    on delete restrict
);


-- 2. Indexes -----------------------------------------------------------------
-- Postgres doesn't index foreign-key columns automatically.

create index idx_clients_user_id on public.clients(user_id);
create index idx_jobs_user_id on public.jobs(user_id);
-- Backs jobs_client_id_fkey and "all jobs for this client" lookups.
create index idx_jobs_client_id on public.jobs(client_id, user_id);


-- 3. Auth trigger: create a profile row for every new signup -----------------
-- SECURITY DEFINER runs as the function owner, so it gets a pinned, empty
-- search_path and fully qualified names (nothing for a look-alike object to
-- hijack). Metadata is user-supplied: trim it, default to '', and truncate to
-- the column limits so odd input can never make the trigger fail and block a
-- signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    left(coalesce(btrim(new.raw_user_meta_data ->> 'name'), ''), 100),
    left(coalesce(btrim(new.raw_user_meta_data ->> 'phone'), ''), 40)
  );
  return new;
end;
$$;

-- Only the auth system should ever fire this. Revoking EXECUTE keeps it out of
-- the public API; a trigger doesn't need EXECUTE to fire.
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- 4. updated_at maintenance --------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();


-- 5. Row level security ------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clients  enable row level security;
alter table public.jobs     enable row level security;

-- (select auth.uid()) lets Postgres evaluate the caller's id once per query
-- instead of once per row.

-- profiles: rows are created by the signup trigger and removed by the cascade
-- from auth.users, so there are deliberately no INSERT or DELETE policies.
create policy "Users can view their own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- clients
create policy "Users can view their own clients"
on public.clients for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create their own clients"
on public.clients for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own clients"
on public.clients for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own clients"
on public.clients for delete to authenticated
using (user_id = (select auth.uid()));

-- jobs (client ownership is enforced by jobs_client_id_fkey, not by a policy)
create policy "Users can view their own jobs"
on public.jobs for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create their own jobs"
on public.jobs for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own jobs"
on public.jobs for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own jobs"
on public.jobs for delete to authenticated
using (user_id = (select auth.uid()));


-- 6. Privileges --------------------------------------------------------------
-- RLS decides which rows a role can touch; GRANTs decide whether it can touch
-- the table at all, and they are checked first. Supabase no longer auto-grants
-- API access on new public tables, so without these statements the Data API
-- answers 42501 "permission denied" however good the policies are. Older
-- default grants (and the remaining ones on newer projects) also include
-- TRUNCATE, REFERENCES and TRIGGER, which RLS doesn't cover, so start from
-- nothing and grant exactly what the app uses.

revoke all on public.profiles, public.clients, public.jobs from anon, authenticated;

-- anon (not logged in) gets nothing.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.clients, public.jobs to authenticated;

-- service_role is for trusted server-side code only (never ship its key to the
-- browser). It bypasses RLS but not grants.
grant select, insert, update, delete
  on public.profiles, public.clients, public.jobs to service_role;
