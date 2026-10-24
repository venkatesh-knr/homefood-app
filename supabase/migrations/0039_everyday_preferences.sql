-- HomeFood · 0039: everyday food preferences
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Per person: veg / egg / non-veg, no onion or garlic, low oil, low salt, low sugar. These are preferences, never medical conditions, and nothing
-- here records a diagnosis. They feed "Suits everyone eating" in the dish pickers, a gentle note when a dish clashes ("Paati: appalam is salty")
-- and a line on the cook's sheet ("less salt for 1 person").
--   * Everyone in the home can READ them (the Planner and the cooks need them).
--   * A person sets their own. The Admin can set them for a family member nobody has logged in as yet (no login, or invited but not joined).
--     Once someone has joined, only they can change theirs. The helper is a cook only: no preferences.
--   * When a person deletes their account, their preferences go with it (delete_my_account makes the profile a "Former member").

create table if not exists public.profile_preferences (
  profile_id      uuid primary key references public.profiles (id) on delete cascade,
  diet            text check (diet in ('veg', 'egg', 'non_veg')),
  no_onion_garlic boolean not null default false,
  low_oil         boolean not null default false,
  low_salt        boolean not null default false,
  low_sugar       boolean not null default false,
  updated_by      uuid references public.profiles (id) on delete set null,
  updated_at      timestamptz not null default now()
);

-- Who may write the diet settings of one person: themselves, or the Admin for a family member nobody has logged in as.
create or replace function public.can_set_diet_for(p_profile uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
     where p.id = p_profile
       and p.household_id = public.my_household_id()
       and p.kind = 'family'
       and (p.id = public.my_profile_id() or (public.is_admin() and p.user_id is null))
  )
$$;
revoke execute on function public.can_set_diet_for(uuid) from public, anon;
grant execute on function public.can_set_diet_for(uuid) to authenticated;

alter table public.profile_preferences enable row level security;
drop policy if exists preferences_read on public.profile_preferences;
create policy preferences_read on public.profile_preferences for select to authenticated
  using (public.profile_household(profile_id) = public.my_household_id());
drop policy if exists preferences_write on public.profile_preferences;
create policy preferences_write on public.profile_preferences for all to authenticated
  using (public.can_set_diet_for(profile_id)) with check (public.can_set_diet_for(profile_id));
grant select, insert, update, delete on public.profile_preferences to authenticated;

-- ── When a login is removed (delete_my_account), the diet rows of that person go ──
create or replace function public.clear_diet_rows() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.profile_preferences where profile_id = new.id;
  return new;
end $$;
drop trigger if exists profiles_clear_diet_rows on public.profiles;
create trigger profiles_clear_diet_rows after update of user_id on public.profiles
  for each row when (old.user_id is not null and new.user_id is null)
  execute function public.clear_diet_rows();
