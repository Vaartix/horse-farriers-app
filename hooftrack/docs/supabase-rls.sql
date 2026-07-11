-- docs/supabase-rls.sql
-- Run this in your Supabase SQL editor after docs/supabase-schema.sql.
-- Enforces team-based isolation plus per-employee barn visibility.

-- Enable RLS on every data table.
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;
alter table public.barns enable row level security;
alter table public.owners enable row level security;
alter table public.horses enable row level security;
alter table public.shoeing_sessions enable row level security;
alter table public.hoof_records enable row level security;
alter table public.hoof_photos enable row level security;

-- Helper: does the current auth user belong to the given team?
create or replace function public.is_team_member(target_team_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.team_members
    where team_id = target_team_id and user_id = auth.uid()
  );
$$;

-- Helper: can the current user see this barn?
-- True if (a) user is team member with null visible_barn_ids (all), or
--         (b) user is team member with barn_id in their visible_barn_ids array.
create or replace function public.can_see_barn(target_barn_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.team_members tm
    join public.barns b on b.team_id = tm.team_id
    where b.id = target_barn_id
      and tm.user_id = auth.uid()
      and (
        tm.visible_barn_ids is null
        or tm.visible_barn_ids ? target_barn_id::text
      )
  );
$$;

-- users: a user can read/update only their own row.
create policy users_self_read on public.users
  for select using (id = auth.uid());
create policy users_self_update on public.users
  for update using (id = auth.uid());
create policy users_self_insert on public.users
  for insert with check (id = auth.uid());

-- teams: members can read; only owner can update.
create policy teams_member_read on public.teams
  for select using (public.is_team_member(id));
create policy teams_owner_update on public.teams
  for update using (owner_id = auth.uid());
create policy teams_owner_insert on public.teams
  for insert with check (owner_id = auth.uid());

-- team_members: members can read their team; only team owner can write.
create policy team_members_read on public.team_members
  for select using (public.is_team_member(team_id));
create policy team_members_owner_write on public.team_members
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
  );

-- team_invites: team owner only.
create policy team_invites_owner on public.team_invites
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
  );

-- barns: visible per can_see_barn helper for SELECT;
-- write requires team membership with edit rights.
create policy barns_select on public.barns
  for select using (public.can_see_barn(id));
create policy barns_write on public.barns
  for all using (public.is_team_member(team_id))
  with check (public.is_team_member(team_id));

-- owners, horses, shoeing_sessions: filter by barn visibility.
create policy owners_select on public.owners
  for select using (public.can_see_barn(barn_id));
create policy owners_write on public.owners
  for all using (public.can_see_barn(barn_id))
  with check (public.can_see_barn(barn_id));

create policy horses_select on public.horses
  for select using (public.can_see_barn(barn_id));
create policy horses_write on public.horses
  for all using (public.can_see_barn(barn_id))
  with check (public.can_see_barn(barn_id));

create policy sessions_select on public.shoeing_sessions
  for select using (
    exists (select 1 from public.horses h where h.id = horse_id and public.can_see_barn(h.barn_id))
  );
create policy sessions_write on public.shoeing_sessions
  for all using (
    exists (select 1 from public.horses h where h.id = horse_id and public.can_see_barn(h.barn_id))
  )
  with check (
    exists (select 1 from public.horses h where h.id = horse_id and public.can_see_barn(h.barn_id))
  );

-- hoof_records and hoof_photos: inherit via session → horse → barn.
create policy hoof_records_select on public.hoof_records
  for select using (
    exists (
      select 1 from public.shoeing_sessions s
      join public.horses h on h.id = s.horse_id
      where s.id = session_id and public.can_see_barn(h.barn_id)
    )
  );
create policy hoof_records_write on public.hoof_records
  for all using (
    exists (
      select 1 from public.shoeing_sessions s
      join public.horses h on h.id = s.horse_id
      where s.id = session_id and public.can_see_barn(h.barn_id)
    )
  )
  with check (
    exists (
      select 1 from public.shoeing_sessions s
      join public.horses h on h.id = s.horse_id
      where s.id = session_id and public.can_see_barn(h.barn_id)
    )
  );

create policy hoof_photos_select on public.hoof_photos
  for select using (
    exists (
      select 1 from public.hoof_records hr
      join public.shoeing_sessions s on s.id = hr.session_id
      join public.horses h on h.id = s.horse_id
      where hr.id = hoof_record_id and public.can_see_barn(h.barn_id)
    )
  );
create policy hoof_photos_write on public.hoof_photos
  for all using (
    exists (
      select 1 from public.hoof_records hr
      join public.shoeing_sessions s on s.id = hr.session_id
      join public.horses h on h.id = s.horse_id
      where hr.id = hoof_record_id and public.can_see_barn(h.barn_id)
    )
  )
  with check (
    exists (
      select 1 from public.hoof_records hr
      join public.shoeing_sessions s on s.id = hr.session_id
      join public.horses h on h.id = s.horse_id
      where hr.id = hoof_record_id and public.can_see_barn(h.barn_id)
    )
  );

-- Storage bucket policies: photos accessible only to team members who can see the related barn.
-- Bucket path convention: 'team-{teamId}/{filename}'.
create policy storage_hoof_photos_select on storage.objects
  for select using (
    bucket_id = 'hoof-photos'
    and (
      split_part(name, '/', 1) = 'team-' || (
        select team_id::text from public.team_members where user_id = auth.uid() limit 1
      )
    )
  );
create policy storage_hoof_photos_insert on storage.objects
  for insert with check (
    bucket_id = 'hoof-photos'
    and split_part(name, '/', 1) = 'team-' || (
      select team_id::text from public.team_members where user_id = auth.uid() limit 1
    )
  );
