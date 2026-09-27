-- HomeFood · optional live check for migration 0004
-- Only needed because there's no local PostgreSQL on this machine to run
-- `npm run test:db` against. Paste this into Supabase Dashboard › SQL Editor
-- AFTER running 0004_invite_details.sql, click Run, and read the NOTICEs —
-- each should say "ok ...". Nothing here touches real family data: it makes
-- two throwaway demo users, checks the new get_invite() shape, then the
-- CLEANUP block at the bottom deletes everything it made. Run the cleanup
-- block (select it and Run) right after, so no demo data is left in
-- homefood-prod.

do $$
declare
  admin_id  uuid := gen_random_uuid();
  member_id uuid := gen_random_uuid();
  hh        uuid;
  tok       text;
  result    record;
begin
  insert into auth.users (id) values (admin_id), (member_id);

  perform set_config('request.jwt.claim.sub', admin_id::text, true);
  hh := public.create_household('Demo Home 0004', 'Demo Admin', 'en', false);
  if (select snacks_enabled from public.households where id = hh) <> false then
    raise exception 'FAIL: create_household did not save snacks_enabled';
  end if;
  raise notice 'ok  create_household saves the snacks choice';

  insert into public.profiles (household_id, display_name, can_login)
    values (hh, 'Demo Member', true);
  insert into public.invites (household_id, created_by) values (hh, public.my_profile_id())
    returning token into tok;

  select * into result from public.get_invite(tok);
  if result.member_count <> 2 then raise exception 'FAIL: member_count was %, expected 2', result.member_count; end if;
  raise notice 'ok  member_count excludes nobody but the helper (none here) — got 2';
  if jsonb_array_length(result.people) <> 1 then raise exception 'FAIL: expected 1 pickable person (not the inviter)'; end if;
  raise notice 'ok  the inviter (Demo Admin) is not in the pick list';
  if (result.people->0->>'joined')::boolean <> false then raise exception 'FAIL: Demo Member should not be joined yet'; end if;
  raise notice 'ok  Demo Member shows as not joined yet';

  perform set_config('request.jwt.claim.sub', member_id::text, true);
  perform public.claim_profile(tok, (select id from public.profiles where household_id = hh and display_name = 'Demo Member'));
  perform set_config('request.jwt.claim.sub', admin_id::text, true);
  select * into result from public.get_invite(tok);
  if (result.people->0->>'joined')::boolean <> true then raise exception 'FAIL: Demo Member should now show as joined'; end if;
  raise notice 'ok  Demo Member now shows as joined';

  raise notice 'All 0004 live checks passed. Now run the CLEANUP block below.';
end $$;

-- ── CLEANUP — run this next, it deletes everything the check above made ──
-- Order matters: find the demo login first (deleting the household first would
-- cascade-delete the profile that points to it, and the login would be orphaned).
-- delete from auth.users where id in (
--   select user_id from public.profiles
--   where household_id = (select id from public.households where name = 'Demo Home 0004')
--     and user_id is not null
-- );
-- delete from public.households where name = 'Demo Home 0004';
-- (the profiles/invites/allergies rows are removed automatically: they cascade from the household delete)
