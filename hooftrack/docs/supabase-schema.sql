-- docs/supabase-schema.sql
-- Run this in your Supabase SQL editor before Phase 4 sync goes live.
-- Mirrors src/db/schema.ts adapted for PostgreSQL.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key,
  email text,
  phone text,
  full_name text not null,
  preferred_units text not null default 'imperial' check (preferred_units in ('imperial', 'metric')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key,
  name text not null,
  owner_id uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'employee' check (role in ('owner', 'employee')),
  visible_barn_ids jsonb,
  can_edit_records boolean not null default true,
  can_view_invoices boolean not null default false,
  can_create_invoices boolean not null default false,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists public.team_invites (
  code text primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  invited_by uuid not null references public.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.barns (
  id uuid primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owners (
  id uuid primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  barn_id uuid not null references public.barns(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.horses (
  id uuid primary key,
  owner_id uuid not null references public.owners(id) on delete cascade,
  barn_id uuid not null references public.barns(id) on delete cascade,
  name text not null,
  breed text,
  date_of_birth date,
  color text,
  discipline text,
  behavioral_flags jsonb not null default '{"kicks":false,"bites":false,"pullsBack":false,"needsSedation":false,"difficultToCatch":false,"customWarning":null}'::jsonb,
  photo_uri text,
  shoeing_cycle_weeks integer not null default 6,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shoeing_sessions (
  id uuid primary key,
  horse_id uuid not null references public.horses(id) on delete cascade,
  farrier_id uuid not null references public.users(id),
  session_date date not null,
  general_notes text,
  vet_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hoof_records (
  id uuid primary key,
  session_id uuid not null references public.shoeing_sessions(id) on delete cascade,
  position text not null check (position in ('LF', 'RF', 'LH', 'RH')),
  toe_length double precision,
  heel_angle double precision,
  sole_depth double precision,
  shoe_type text,
  shoe_size text,
  shoe_material text,
  pad_type text,
  packing_type text,
  nail_type text,
  nail_size text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.hoof_photos (
  id uuid primary key,
  hoof_record_id uuid not null references public.hoof_records(id) on delete cascade,
  local_uri text,
  cloud_uri text not null,
  photo_type text not null check (photo_type in ('before', 'after', 'xray', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists idx_horses_name on public.horses(name);
create index if not exists idx_horses_owner_id on public.horses(owner_id);
create index if not exists idx_barns_team_id on public.barns(team_id);
create index if not exists idx_owners_barn_id on public.owners(barn_id);
create index if not exists idx_shoeing_sessions_horse_id on public.shoeing_sessions(horse_id);
create index if not exists idx_shoeing_sessions_date on public.shoeing_sessions(session_date);
create index if not exists idx_hoof_records_session_id on public.hoof_records(session_id);

-- Storage bucket for photos (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('hoof-photos', 'hoof-photos', false);
