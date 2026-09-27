-- HomeFood · 0004: richer invite details for the Join and Invite screens
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Replaces get_invite() and extends create_household() so the Join screen
-- (design/mockups/png/Join.png) can show the family size and who has already
-- joined, and the setup wizard (design/mockups/png/SetupHome.png) can save the
-- "Plan evening snacks" choice in one call.

-- get_invite() used to return only the people who could still claim a profile.
-- The Join screen also shows people who already joined (greyed out, "Already
-- joined") and the household's family size, so the return shape changes —
-- drop first because Postgres won't let create-or-replace change it in place.
drop function if exists public.get_invite(text);

create or replace function public.get_invite(p_token text)
returns table (household_name text, invited_by text, member_count integer, people jsonb)
language sql stable security definer set search_path = '' as $$
  select h.name,
         (select display_name from public.profiles where id = i.created_by),
         (select count(*)::int from public.profiles
           where household_id = i.household_id and kind = 'family'),
         -- Everyone who can log in, except whoever created this link (they're
         -- already in — the picker is for the rest of the family).
         coalesce((select jsonb_agg(jsonb_build_object(
                     'id', p.id, 'name', p.display_name, 'birth_year', p.birth_year,
                     'joined', p.user_id is not null
                   ) order by p.created_at)
                   from public.profiles p
                   where p.household_id = i.household_id and p.can_login and p.id <> i.created_by), '[]'::jsonb)
  from public.invites i
  join public.households h on h.id = i.household_id
  where i.token = p_token and i.revoked_at is null and i.expires_at > now()
$$;

grant execute on function public.get_invite(text) to anon, authenticated;

-- create_household() gains an optional snacks_enabled param so the setup
-- wizard can save "Plan evening snacks" in the same call that creates the home.
-- Adding a parameter changes the signature, so the old 3-argument version
-- must be dropped first or Postgres would keep both and calls would become
-- ambiguous.
drop function if exists public.create_household(text, text, text);

create or replace function public.create_household(
  p_name text, p_display_name text, p_language text default 'en', p_snacks_enabled boolean default true
) returns uuid language plpgsql security definer set search_path = '' as $$
declare hh uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if exists (select 1 from public.profiles where user_id = auth.uid()) then
    raise exception 'You already belong to a home';
  end if;
  insert into public.households (name, default_language, snacks_enabled)
    values (btrim(p_name), coalesce(p_language, 'en'), coalesce(p_snacks_enabled, true)) returning id into hh;
  insert into public.profiles (household_id, user_id, display_name, role, can_login, language)
    values (hh, auth.uid(), btrim(p_display_name), 'admin', true, coalesce(p_language, 'en'));
  return hh;
end $$;

revoke all on function public.create_household(text, text, text, boolean) from public, anon;
grant execute on function public.create_household(text, text, text, boolean) to authenticated;
