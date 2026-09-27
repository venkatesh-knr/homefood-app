-- HomeFood · database rule tests
-- Proves that households can't see or change each other's data, and that
-- roles and planner turns are enforced. Run with scripts/test-db.sh.
\set ON_ERROR_STOP on
\set QUIET on

create schema if not exists tests;
create or replace function tests.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'FAIL: %', msg; end if;
  raise notice 'ok  %', msg;
end $$;
-- Runs a statement that must be refused (error or no rows changed).
create or replace function tests.refused(stmt text, msg text) returns void language plpgsql as $$
declare n bigint;
begin
  begin
    execute stmt;
    get diagnostics n = row_count;
  exception when others then
    raise notice 'ok  % (refused: %)', msg, sqlerrm;
    return;
  end;
  if n > 0 then raise exception 'FAIL: % (statement changed % rows)', msg, n; end if;
  raise notice 'ok  % (no rows affected)', msg;
end $$;
grant usage on schema tests to anon, authenticated;
grant execute on all functions in schema tests to anon, authenticated;

insert into auth.users (id) values
  ('aaaaaaaa-0000-4000-8000-000000000001'),  -- Amma  (Admin, home A)
  ('bbbbbbbb-0000-4000-8000-000000000002'),  -- Appa  (joins home A)
  ('cccccccc-0000-4000-8000-000000000003'),  -- Ravi  (Admin, home C)
  ('dddddddd-0000-4000-8000-000000000004');  -- Dev   (no home)

-- ── Amma creates home A and adds her family ──
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select public.create_household('Our Home', 'Amma', 'ta') as hh_a \gset
insert into public.profiles (household_id, display_name, can_login) values (:'hh_a', 'Appa', true) returning id as appa \gset
insert into public.profiles (household_id, display_name, can_login, birth_year) values (:'hh_a', 'Paati', false, 1950) returning id as paati \gset
insert into public.profiles (household_id, display_name, kind) values (:'hh_a', 'Helper', 'helper') returning id as helper \gset
insert into public.profile_allergies (profile_id, allergen) values (:'paati', 'soy');
insert into public.invites (household_id, created_by) values (:'hh_a', public.my_profile_id()) returning token as tok \gset
select tests.ok((select count(*) from public.profiles) = 4, 'Amma sees her 4 profiles');
select tests.ok((select count(*) from public.cuisines) = 5, 'shared cuisines are visible');
select tests.refused($$ select public.create_household('Second', 'Amma again') $$, 'one home per login');
select tests.refused($$ insert into public.profiles (household_id, display_name, kind, can_login) values ('$$ || :'hh_a' || $$', 'X', 'helper', true) $$, 'a helper cannot have a login');

-- ── Ravi creates a separate home C ──
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select public.create_household('Other Home', 'Ravi') as hh_c \gset
select tests.ok((select count(*) from public.profiles) = 1, 'Ravi sees only his own profile');
select tests.ok((select count(*) from public.households) = 1, 'Ravi sees only his own home');
select tests.ok((select count(*) from public.profile_allergies) = 0, 'Ravi cannot see home A allergies');
select tests.ok((select count(*) from public.invites) = 0, 'Ravi cannot see home A invites');
select tests.refused($$ update public.households set name = 'Hacked' where id = '$$ || :'hh_a' || $$' $$, 'Ravi cannot rename home A');
select tests.refused($$ insert into public.profiles (household_id, display_name) values ('$$ || :'hh_a' || $$', 'Intruder') $$, 'Ravi cannot add people to home A');
select tests.refused($$ insert into public.dishes (household_id, name, created_by) values ('$$ || :'hh_a' || $$', 'Spam', public.my_profile_id()) $$, 'Ravi cannot add dishes to home A');
select tests.refused($$ delete from public.profiles where id = '$$ || :'paati' || $$' $$, 'Ravi cannot delete home A profiles');

-- ── Appa joins home A through the invite link ──
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select household_name from public.get_invite(:'tok')) = 'Our Home', 'invite shows the home name');
select tests.ok((select jsonb_array_length(claimable) from public.get_invite(:'tok')) = 1, 'only Appa is claimable (Paati and Helper have no login)');
select public.claim_profile(:'tok', :'appa') is not null as joined \gset
select tests.ok((select count(*) from public.profiles) = 4, 'Appa now sees home A');
select tests.ok((select count(*) from public.profile_allergies) = 1, 'Appa sees Paati''s allergy (for warnings)');
select tests.refused($$ update public.profiles set role = 'admin' where user_id = auth.uid() $$, 'Appa cannot make himself Admin');
select tests.refused($$ insert into public.invites (household_id) values ('$$ || :'hh_a' || $$') $$, 'members cannot create invites');
update public.profiles set birth_year = 1978 where user_id = auth.uid();
select tests.ok((select birth_year from public.profiles where user_id = auth.uid()) = 1978, 'Appa can edit his own details');

-- ── Dev tries to reuse the invite for a taken name ──
select set_config('request.jwt.claim.sub', 'dddddddd-0000-4000-8000-000000000004', false);
select tests.refused($$ select public.claim_profile('$$ || :'tok' || $$', '$$ || :'appa' || $$') $$, 'a claimed name cannot be claimed again');
select tests.refused($$ select public.claim_profile('$$ || :'tok' || $$', '$$ || :'paati' || $$') $$, 'a no-login profile cannot be claimed');
select tests.ok((select count(*) from public.profiles) = 0, 'Dev (no home) sees nothing');

-- ── Planning rules ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2026-09-28') returning id as wk1 \gset
insert into public.dishes (household_id, name, created_by, meal_types) values (:'hh_a', 'Pongal', public.my_profile_id(), '{breakfast}') returning id as pongal \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal, main_dish_id) values (:'wk1', :'hh_a', '2026-09-30', 'breakfast', :'pongal') returning id as slot1 \gset
insert into public.meal_slot_cooks (slot_id, profile_id) values (:'slot1', :'helper');
select tests.ok((select count(*) from public.meal_slot_cooks) = 1, 'Admin plans a meal and sets the helper as cook');
select tests.refused($$ insert into public.meal_slots (week_plan_id, household_id, date, meal) values ('$$ || :'wk1' || $$', '$$ || :'hh_a' || $$', '2026-10-09', 'lunch') $$, 'a slot must fall inside its week');
select tests.refused($$ insert into public.week_plans (household_id, week_start) values ('$$ || :'hh_a' || $$', '2026-10-01') $$, 'weeks start on Monday');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select public.my_profile_id() as ravi \gset
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.refused($$ insert into public.meal_slot_cooks (slot_id, profile_id) values ('$$ || :'slot1' || $$', '$$ || :'ravi' || $$') $$, 'a cook must be from the same home');
insert into public.planner_turns (household_id, profile_id, scope, start_date, end_date) values (:'hh_a', :'appa', 'week', '2026-10-05', '2026-10-11');

select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ insert into public.meal_slots (week_plan_id, household_id, date, meal) values ('$$ || :'wk1' || $$', '$$ || :'hh_a' || $$', '2026-10-01', 'lunch') $$, 'Appa cannot plan outside his turn');
select tests.refused($$ update public.week_plans set status = 'published' where id = '$$ || :'wk1' || $$' $$, 'Appa cannot publish Amma''s week');
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2026-10-05') returning id as wk2 \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal) values (:'wk2', :'hh_a', '2026-10-07', 'dinner');
select tests.ok((select count(*) from public.meal_slots) = 2, 'Appa plans inside his turn and sees all home meals');
select tests.refused($$ insert into public.planner_turns (household_id, profile_id, scope, start_date, end_date) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', 'month', '2026-11-01', '2026-11-30') $$, 'members cannot assign turns themselves (phase 1)');

select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.meal_slots) = 0, 'Ravi sees none of home A''s meals');
select tests.ok((select count(*) from public.dishes) = 0, 'Ravi sees none of home A''s dishes');
select tests.refused($$ update public.profiles set role = 'member' where user_id = auth.uid() $$, 'the last Admin cannot step down');

-- ── Not signed in ──
select set_config('request.jwt.claim.sub', '', false);
set role anon;
select tests.refused($$ select 1 from public.households $$, 'signed-out visitors see no homes');
select tests.refused($$ select 1 from public.profiles $$, 'signed-out visitors see no people');
select tests.refused($$ select public.create_household('X', 'Y') $$, 'signed-out visitors cannot create homes');

-- ── Expired invite ──
reset role;
update public.invites set expires_at = now() - interval '1 minute';
set role authenticated;
select tests.ok((select count(*) from public.get_invite(:'tok')) = 0, 'an expired invite shows nothing');
reset role;

\echo 'All database rule tests passed.'
