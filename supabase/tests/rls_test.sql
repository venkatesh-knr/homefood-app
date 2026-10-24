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
select public.create_household('Our Home', 'Amma', 'ta', false) as hh_a \gset
select tests.ok((select snacks_enabled from public.households where id = :'hh_a') = false, 'create_household saves the snacks choice');
insert into public.profiles (household_id, display_name, can_login) values (:'hh_a', 'Appa', true) returning id as appa \gset
insert into public.profiles (household_id, display_name, can_login, birth_year) values (:'hh_a', 'Paati', false, 1950) returning id as paati \gset
insert into public.profiles (household_id, display_name, kind) values (:'hh_a', 'Helper', 'helper') returning id as helper \gset
insert into public.profile_allergies (profile_id, allergen) values (:'paati', 'soy');
insert into public.invites (household_id, created_by) values (:'hh_a', public.my_profile_id()) returning token as tok \gset
select tests.ok((select count(*) from public.profiles) = 4, 'Amma sees her 4 profiles');
select tests.ok((select count(*) from public.cuisines) = 5, 'shared cuisines are visible');
select tests.ok((select count(*) from public.dishes where household_id is null) >= 298, 'the shared catalogue has every seeded dish');
select tests.ok(not exists (select 1 from public.dishes where household_id is null group by name having count(*) > 1), 'no two shared dishes share a name');
select tests.ok(not exists (select 1 from public.dishes d where d.household_id is null and (select count(distinct n.language) from public.dish_names n where n.dish_id = d.id and n.language in ('en', 'ta')) < 2), 'every shared dish has an English and a Tamil name');
select tests.ok(exists (select 1 from public.dish_names where language = 'ta' and name = 'வெங்காயப் பக்கோடா') and not exists (select 1 from public.dish_names where name = 'வெங்காய பக்கோடா') and not exists (select 1 from public.recipe_ingredients where name_ta in ('பாஸ்மதி அரிசி', 'வரமிளகாய்', 'க்ரீம்')), 'the Tamil wording fixes of 0020 are in');
select tests.ok((select count(*) from public.dishes where household_id is null and name in ('Idli', 'Dosa', 'Upma') and meal_types @> '{breakfast,dinner}') = 3 and (select count(*) from public.dishes where household_id is null and name in ('Chapati', 'Parotta', 'Sambar') and meal_types @> '{breakfast,dinner}') = 3, 'tiffin dishes work for both breakfast and dinner');
select tests.refused($$ select public.create_household('Second', 'Amma again') $$, 'one home per login');
select tests.refused($$ insert into public.profiles (household_id, display_name, kind, can_login) values ('$$ || :'hh_a' || $$', 'X', 'helper', true) $$, 'a helper cannot have a login');

-- ── Ravi creates a separate home C ──
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select public.create_household('Other Home', 'Ravi') as hh_c \gset
select tests.ok((select snacks_enabled from public.households where id = :'hh_c') = true, 'snacks_enabled defaults to true');
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
select tests.ok((select member_count from public.get_invite(:'tok')) = 3, 'member_count counts family, not the helper');
select tests.ok((select jsonb_array_length(people) from public.get_invite(:'tok')) = 1, 'only Appa can be picked (Amma made the link, Paati and Helper have no login)');
select tests.ok((select (people->0->>'joined')::boolean from public.get_invite(:'tok')) = false, 'Appa is not joined yet');
select public.claim_profile(:'tok', :'appa') is not null as joined \gset
select tests.ok((select (people->0->>'joined')::boolean from public.get_invite(:'tok')) = true, 'the invite now shows Appa as already joined');
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
insert into public.meal_slot_eaters (slot_id, profile_id) values (:'slot1', :'paati');
select tests.ok((select count(*) from public.meal_slot_eaters) = 1, 'Admin marks Paati as eating this meal');
select tests.refused($$ insert into public.meal_slots (week_plan_id, household_id, date, meal) values ('$$ || :'wk1' || $$', '$$ || :'hh_a' || $$', '2026-10-09', 'lunch') $$, 'a slot must fall inside its week');
select tests.refused($$ insert into public.week_plans (household_id, week_start) values ('$$ || :'hh_a' || $$', '2026-10-01') $$, 'weeks start on Monday');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select public.my_profile_id() as ravi \gset
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.refused($$ insert into public.meal_slot_cooks (slot_id, profile_id) values ('$$ || :'slot1' || $$', '$$ || :'ravi' || $$') $$, 'a cook must be from the same home');
select tests.refused($$ insert into public.meal_slot_eaters (slot_id, profile_id) values ('$$ || :'slot1' || $$', '$$ || :'ravi' || $$') $$, 'an eater must be from the same home');
insert into public.planner_turns (household_id, profile_id, scope, start_date, end_date) values (:'hh_a', :'appa', 'week', '2026-10-05', '2026-10-11');

select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ insert into public.meal_slots (week_plan_id, household_id, date, meal) values ('$$ || :'wk1' || $$', '$$ || :'hh_a' || $$', '2026-10-01', 'lunch') $$, 'Appa cannot plan outside his turn');
select tests.refused($$ update public.week_plans set status = 'published' where id = '$$ || :'wk1' || $$' $$, 'Appa cannot publish Amma''s week');
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2026-10-05') returning id as wk2 \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal) values (:'wk2', :'hh_a', '2026-10-07', 'dinner');
select tests.ok((select count(*) from public.meal_slots) = 2, 'Appa plans inside his turn and sees all home meals');
select tests.refused($$ insert into public.planner_turns (household_id, profile_id, scope, start_date, end_date) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', 'month', '2026-11-01', '2026-11-30') $$, 'members cannot assign turns themselves (phase 1)');
select tests.refused($$ insert into public.cuisines (household_id, name) values ('$$ || :'hh_a' || $$', 'Chettinad') $$, 'a member cannot add a cuisine');

select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.cuisines (household_id, name, name_ta) values (:'hh_a', 'Chettinad', 'செட்டிநாடு');
select tests.ok((select count(*) from public.cuisines) = 6, 'Admin adds her own cuisine next to the 5 shared ones');

-- ── Discussion: votes, comments, suggestions ──
select public.my_profile_id() as amma_p \gset
insert into public.meal_slot_votes (slot_id, profile_id, vote) values (:'slot1', :'amma_p', 'agree');
insert into public.meal_slot_comments (slot_id, profile_id, body) values (:'slot1', :'amma_p', 'Pongal it is.');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
insert into public.meal_slot_votes (slot_id, profile_id, vote) values (:'slot1', :'appa', 'disagree');
select tests.ok((select count(*) from public.meal_slot_votes) = 2, 'Appa sees Amma''s vote and his own');
select tests.refused($$ insert into public.meal_slot_votes (slot_id, profile_id, vote) values ('$$ || :'slot1' || $$', '$$ || :'amma_p' || $$', 'disagree') $$, 'you cannot vote as someone else');
select tests.refused($$ insert into public.meal_slot_votes (slot_id, profile_id, vote) values ('$$ || :'slot1' || $$', '$$ || :'appa' || $$', 'maybe') $$, 'a vote is agree or disagree');
update public.meal_slot_votes set vote = 'agree' where profile_id = :'appa';
select tests.ok((select vote from public.meal_slot_votes where profile_id = :'appa') = 'agree', 'Appa can change his own vote');
select tests.refused($$ update public.meal_slot_votes set vote = 'disagree' where profile_id = '$$ || :'amma_p' || $$' $$, 'Appa cannot change Amma''s vote');
insert into public.meal_slot_comments (slot_id, profile_id, body) values (:'slot1', :'appa', 'Less oil please.');
select tests.ok((select count(*) from public.meal_slot_comments) = 2, 'Appa comments and sees Amma''s comment');
select tests.refused($$ insert into public.meal_slot_comments (slot_id, profile_id, body) values ('$$ || :'slot1' || $$', '$$ || :'amma_p' || $$', 'Fake') $$, 'you cannot comment as someone else');
select tests.refused($$ insert into public.meal_slot_comments (slot_id, profile_id, body) values ('$$ || :'slot1' || $$', '$$ || :'appa' || $$', '   ') $$, 'a comment cannot be blank');
select tests.refused($$ delete from public.meal_slot_comments where profile_id = '$$ || :'amma_p' || $$' $$, 'a member cannot delete Amma''s comment');
insert into public.meal_slot_suggestions (slot_id, profile_id, dish_id) values (:'slot1', :'appa', :'pongal') returning id as sug \gset
select tests.refused($$ insert into public.meal_slot_suggestions (slot_id, profile_id, free_text, status) values ('$$ || :'slot1' || $$', '$$ || :'appa' || $$', 'Upma', 'accepted') $$, 'a suggestion always starts open');
select tests.refused($$ insert into public.meal_slot_suggestions (slot_id, profile_id) values ('$$ || :'slot1' || $$', '$$ || :'appa' || $$') $$, 'a suggestion needs a dish or a few words');
select tests.refused($$ update public.meal_slot_suggestions set status = 'accepted' where id = '$$ || :'sug' || $$' $$, 'Appa cannot accept a suggestion on a day that is not his turn');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.meal_slot_suggestions set status = 'accepted', resolved_at = now() where id = :'sug';
select tests.ok((select count(*) from public.meal_slot_suggestions where status = 'accepted') = 1, 'the Planner/Admin accepts a suggestion');
delete from public.meal_slot_votes where slot_id = :'slot1';
select tests.ok((select count(*) from public.meal_slot_votes) = 0, 'the Planner can clear a meal''s votes when the dish is swapped');
delete from public.meal_slot_comments where profile_id = :'appa';
select tests.ok((select count(*) from public.meal_slot_comments) = 1, 'an Admin can remove a member''s comment');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.meal_slot_votes) + (select count(*) from public.meal_slot_comments) + (select count(*) from public.meal_slot_suggestions) = 0, 'Ravi sees none of home A''s votes, comments or suggestions');
select tests.refused($$ insert into public.meal_slot_comments (slot_id, profile_id, body) values ('$$ || :'slot1' || $$', '$$ || :'ravi' || $$', 'Hello') $$, 'Ravi cannot comment on home A''s meal');
select tests.refused($$ insert into public.meal_slot_votes (slot_id, profile_id, vote) values ('$$ || :'slot1' || $$', '$$ || :'ravi' || $$', 'agree') $$, 'Ravi cannot vote on home A''s meal');

-- ── Recipes ──
select tests.ok((select count(*) from public.recipes where household_id is null) >= 298, 'the standard recipes are visible to everyone');
select tests.ok(not exists (select 1 from public.recipes r where r.household_id is null and (not exists (select 1 from public.recipe_ingredients i where i.recipe_id = r.id) or not exists (select 1 from public.recipe_steps st where st.recipe_id = r.id))), 'every standard recipe has ingredients and steps');
select tests.refused($$ update public.recipes set servings = 99 where household_id is null $$, 'nobody can change a standard recipe');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.recipes (dish_id, household_id, servings) select id, :'hh_a', 4 from public.dishes where name = 'Idli' and household_id is null returning id as rec \gset
insert into public.recipe_ingredients (recipe_id, position, name, quantity, unit) values (:'rec', 1, 'Idli rice', 2, 'cup');
insert into public.recipe_steps (recipe_id, position, body) values (:'rec', 1, 'Our way.');
select tests.ok((select count(*) from public.recipes where household_id = :'hh_a') = 1, 'Admin keeps her own version of a recipe');
select tests.refused($$ insert into public.recipe_ingredients (recipe_id, position, name, unit) values ('$$ || :'rec' || $$', 2, 'Salt', 'cup') $$, 'a quantity is required unless it is "to taste"');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.recipe_steps where recipe_id = :'rec') = 1, 'Appa sees his home''s own recipe version');
select tests.refused($$ insert into public.recipe_steps (recipe_id, position, body) values ('$$ || :'rec' || $$', 2, 'Edited by a member') $$, 'a member cannot edit a home recipe');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok(not exists (select 1 from public.recipes where household_id = :'hh_a') and not exists (select 1 from public.recipe_steps where recipe_id = :'rec'), 'Ravi cannot see home A''s recipe version');
select tests.refused($$ insert into public.recipes (dish_id, household_id, servings) select id, '$$ || :'hh_a' || $$', 2 from public.dishes where name = 'Dosa' and household_id is null $$, 'Ravi cannot add a recipe to home A');

-- ── Nutrition ──
select tests.ok((select count(*) from public.dish_nutrition) >= 298, 'every shared dish has a nutrition estimate, visible to everyone');
select tests.ok((select count(*) from public.nutrition_targets) = 24, 'the daily reference targets are readable (4 age bands x 2 sexes x 3 activity levels)');
select tests.refused($$ update public.nutrition_targets set kcal = 1 $$, 'nobody edits the reference targets');
select tests.refused($$ update public.dish_nutrition set kcal = 1 $$, 'nobody edits the shared dishes'' estimates');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg) values (:'pongal', '1 cup', 280, 8, 40, 9, 2, 1, 450);
select tests.ok((select count(*) from public.dish_nutrition where dish_id = :'pongal') = 1, 'Admin enters nutrition for her home''s own dish');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ update public.dish_nutrition set kcal = 1 where dish_id = '$$ || :'pongal' || $$' $$, 'a member cannot change a home dish''s nutrition');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok(not exists (select 1 from public.dish_nutrition where dish_id = :'pongal'), 'Ravi cannot see home A''s dish nutrition');

-- ── Notifications (written by triggers; see 0013) ──
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.notifications where type = 'turn_assigned') = 1, 'Appa is told when a Planner turn is given to him');
select tests.ok((select count(*) from public.notifications where type = 'suggestion_accepted') = 1, 'Appa is told his suggestion was accepted');
select tests.refused($$ insert into public.notifications (household_id, profile_id, type) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', 'week_published') $$, 'nobody can write a notification from the app');
select tests.refused($$ select public.notify('$$ || :'appa' || $$', 'week_published', null, '{}') $$, 'the app cannot call the notification writer directly');
select tests.refused($$ update public.notifications set type = 'comment_new' $$, 'a notification can only be marked read, not edited');
update public.notifications set read_at = now() where type = 'turn_assigned';
select tests.ok((select count(*) from public.notifications where read_at is not null) = 1, 'Appa marks a notification read');
select tests.ok((select count(*) from public.notifications where profile_id = :'amma_p') = 0, 'Appa cannot see Amma''s notifications');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.ok((select count(*) from public.notifications where type = 'suggestion_new') = 1, 'Amma is told about Appa''s suggestion');
update public.week_plans set status = 'published', published_at = now() where id = :'wk1';
update public.meal_slots set place_name = 'Cafe Chennai' where id = :'slot1';
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.notifications where type = 'week_published') = 1, 'everyone with a login is told when the week is published');
select tests.ok((select count(*) from public.notifications where type = 'slot_changed') = 1, 'and when a published meal changes');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.meal_slots set place_name = 'Cafe Chennai 2' where id = :'slot1';
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.notifications where type = 'slot_changed') = 1 and (select data ->> 'place' from public.notifications where type = 'slot_changed') = 'Cafe Chennai 2', 'repeat changes to the same meal merge into one notification');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.notifications) = 0, 'Ravi gets, and sees, none of home A''s notifications');

select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.meal_slots) = 0, 'Ravi sees none of home A''s meals');
select tests.ok((select count(*) from public.meal_slot_eaters) = 0, 'Ravi sees none of home A''s eaters');
select tests.ok(not exists (select 1 from public.dishes where name = 'Pongal'), 'Ravi cannot see home A''s own dish (Pongal) — the shared catalogue is visible to everyone, home dishes are not');
select tests.ok(not exists (select 1 from public.cuisines where name = 'Chettinad'), 'Ravi cannot see home A''s own cuisine');
select tests.refused($$ insert into public.cuisines (household_id, name) values ('$$ || :'hh_a' || $$', 'Intruder cuisine') $$, 'Ravi cannot add a cuisine to home A');
select tests.refused($$ update public.profiles set role = 'member' where user_id = auth.uid() $$, 'the last Admin cannot step down');

-- ── Meal attendance (who actually ate what) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2020-01-06') returning id as wk_old \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal) values (:'wk_old', :'hh_a', '2020-01-08', 'lunch') returning id as slot_old \gset
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2099-01-05') returning id as wk_new \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal) values (:'wk_new', :'hh_a', '2099-01-07', 'lunch') returning id as slot_new \gset
insert into public.meal_attendance (slot_id, profile_id, status) values (:'slot_old', :'paati', 'skipped');
select tests.ok((select count(*) from public.meal_attendance) = 1, 'Admin records that Paati skipped a past meal');
select tests.refused($$ insert into public.meal_attendance (slot_id, profile_id) values ('$$ || :'slot_old' || $$', '$$ || :'helper' || $$') $$, 'the helper is never counted as eating');
select tests.refused($$ insert into public.meal_attendance (slot_id, profile_id, status, portion) values ('$$ || :'slot_new' || $$', '$$ || :'paati' || $$', 'ate', 'large') $$, 'a meal that has not happened yet cannot be marked');
select tests.refused($$ insert into public.meal_attendance (slot_id, profile_id, status, portion) values ('$$ || :'slot_old' || $$', '$$ || :'appa' || $$', 'skipped', 'large') $$, 'a skipped meal has no portion');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
insert into public.meal_attendance (slot_id, profile_id, status, portion) values (:'slot_old', :'appa', 'ate', 'small');
select tests.ok((select count(*) from public.meal_attendance) = 2, 'Appa records his own small portion and sees the home''s records');
select tests.refused($$ update public.meal_attendance set status = 'ate' where profile_id = '$$ || :'paati' || $$' $$, 'a member cannot change somebody else''s record');
select tests.refused($$ insert into public.meal_attendance (slot_id, profile_id) values ('$$ || :'slot_new' || $$', '$$ || :'appa' || $$') $$, 'nobody can mark a future meal, not even for themself');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.meal_attendance) = 0, 'Ravi sees none of home A''s attendance');
select tests.refused($$ insert into public.meal_attendance (slot_id, profile_id) values ('$$ || :'slot_old' || $$', '$$ || :'ravi' || $$') $$, 'Ravi cannot record attendance on home A''s meals');

-- ── Favourite dishes ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.dish_favourites (household_id, dish_id) select :'hh_a', id from public.dishes where name = 'Idli' and household_id is null;
select tests.ok((select count(*) from public.dish_favourites) = 1, 'Amma marks a shared dish as a favourite of her home');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.dish_favourites) = 1, 'Appa sees his home''s favourites');
insert into public.dish_favourites (household_id, dish_id) select :'hh_a', id from public.dishes where name = 'Dosa' and household_id is null;
select tests.ok((select count(*) from public.dish_favourites) = 2, 'any member can add a favourite');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.dish_favourites) = 0, 'Ravi sees none of home A''s favourites');
select tests.refused($$ insert into public.dish_favourites (household_id, dish_id) select '$$ || :'hh_a' || $$', id from public.dishes where name = 'Upma' and household_id is null $$, 'Ravi cannot add favourites to home A');
select tests.refused($$ insert into public.dish_favourites (household_id, dish_id) select '$$ || :'hh_c' || $$', id from public.dishes where name = 'Pongal' $$, 'a home cannot favourite another home''s own dish');

-- ── Week start choice (Monday or Sunday) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.households set week_start = 7 where id = :'hh_a';
select tests.ok((select week_start from public.households where id = :'hh_a') = 7, 'the Admin can switch the home to Sunday-start weeks');
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2020-01-05') returning id as wk_sun \gset
select tests.refused($$ insert into public.week_plans (household_id, week_start) values ('$$ || :'hh_a' || $$', '2020-01-13') $$, 'with Sunday weeks a plan that starts on a Monday is refused');
select tests.refused($$ insert into public.meal_slots (week_plan_id, household_id, date, meal) values ('$$ || :'wk_sun' || $$', '$$ || :'hh_a' || $$', '2020-01-08', 'lunch') $$, 'the same date and meal cannot be planned twice, even in another week plan');
select tests.refused($$ update public.households set week_start = 3 where id = '$$ || :'hh_a' || $$' $$, 'a week can only start on Monday or Sunday');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ update public.households set week_start = 1 where id = '$$ || :'hh_a' || $$' $$, 'a member cannot change the home''s week start');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.households set week_start = 1 where id = :'hh_a';
select tests.ok((select week_start from public.households where id = :'hh_a') = 1, 'the Admin can switch back to Monday');

-- ── Weekly balance limits (0024) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.ok((select balance_same_main = 3 and balance_fried = 4 and balance_out_run = 3 from public.households where id = :'hh_a'), 'a home starts with the usual balance limits (3, 4, 3)');
update public.households set balance_same_main = 4, balance_fried = 6, balance_out_run = 2 where id = :'hh_a';
select tests.ok((select balance_same_main = 4 and balance_fried = 6 and balance_out_run = 2 from public.households where id = :'hh_a'), 'the Admin can change the balance limits');
select tests.refused($$ update public.households set balance_same_main = 1 where id = '$$ || :'hh_a' || $$' $$, 'a main dish limit below 2 is refused');
select tests.refused($$ update public.households set balance_fried = 99 where id = '$$ || :'hh_a' || $$' $$, 'a fried limit above 28 is refused');
select tests.refused($$ update public.households set balance_out_run = 1 where id = '$$ || :'hh_a' || $$' $$, 'an eating-out run below 2 is refused');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ update public.households set balance_fried = 5 where id = '$$ || :'hh_a' || $$' $$, 'a member cannot change the balance limits');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.households set balance_same_main = 3, balance_fried = 4, balance_out_run = 3 where id = :'hh_a';
select tests.ok((select count(*) from public.dishes where household_id is null and 'vegetable' = any (tags)) >= 45, 'the shared vegetable dishes carry the vegetable tag');
select tests.ok((select 'vegetable' = any (tags) from public.dishes where household_id is null and name = 'Avial'), 'Avial is a vegetable dish');
select tests.ok((select not ('vegetable' = any (tags)) from public.dishes where household_id is null and name = 'Sambar'), 'Sambar is not tagged as a vegetable dish');
select tests.ok((select not ('vegetable' = any (tags)) from public.dishes where name = 'Pongal' and household_id = :'hh_a'), 'a home''s own dishes were not tagged by the migration');

-- ── Edit our version of a recipe (0025) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select public.save_household_recipe((select id from public.dishes where name = 'Idli' and household_id is null), 3, 10, 20, 'less water', null,
  '[{"name":"Rice","name_ta":"அரிசி","quantity":2,"unit":"cup"},{"name":"Salt","quantity":null,"unit":"to_taste"}]'::jsonb,
  '[{"body":"Soak the rice."},{"body":"Steam it.","body_ta":"ஆவியில் வேகவை."}]'::jsonb) as own_rec \gset
select tests.ok((select servings = 3 and note = 'less water' and household_id = :'hh_a' from public.recipes where id = :'own_rec'), 'the Admin saves her home''s own copy of a recipe');
select tests.ok((select count(*) from public.recipe_ingredients where recipe_id = :'own_rec') = 2 and (select count(*) from public.recipe_steps where recipe_id = :'own_rec') = 2, 'the copy has every ingredient and step she entered');
select tests.ok((select string_agg(position::text, ',' order by position) from public.recipe_steps where recipe_id = :'own_rec') = '1,2', 'steps are numbered 1, 2 in the order given');
select tests.ok((select count(*) from public.recipes where household_id is null and dish_id = (select dish_id from public.recipes where id = :'own_rec') and servings = 4) = 1, 'the standard recipe is left alone');
select public.save_household_recipe((select id from public.dishes where name = 'Idli' and household_id is null), 2, null, null, null, null,
  '[{"name":"Rice flour","quantity":1.5,"unit":"cup"}]'::jsonb, '[{"body":"Mix and steam."}]'::jsonb) as own_rec2 \gset
select tests.ok(:'own_rec2' = :'own_rec' and (select count(*) from public.recipe_ingredients where recipe_id = :'own_rec') = 1 and (select servings from public.recipes where id = :'own_rec') = 2, 'saving again replaces the copy instead of adding a second one');
select tests.refused($$ select public.save_household_recipe((select id from public.dishes where name = 'Idli' and household_id is null), 5, null, null, null, null, '[{"name":"Rice","quantity":1,"unit":"bucket"}]'::jsonb, '[{"body":"x"}]'::jsonb) $$, 'an unknown unit is refused');
select tests.ok((select count(*) from public.recipe_ingredients where recipe_id = :'own_rec') = 1 and (select servings from public.recipes where id = :'own_rec') = 2, 'a refused save changes nothing (all or nothing)');
select tests.refused($$ select public.save_household_recipe((select id from public.dishes where name = 'Idli' and household_id is null), 5, null, null, null, null, '[{"name":"Rice","quantity":1,"unit":"cup"}]'::jsonb, '[]'::jsonb) $$, 'a recipe without steps is refused');
select tests.refused($$ select public.save_household_recipe((select id from public.dishes where name = 'Idli' and household_id is null), 5, null, null, null, null, '[{"name":"Rice","quantity":null,"unit":"cup"}]'::jsonb, '[{"body":"x"}]'::jsonb) $$, 'a measured ingredient without a quantity is refused');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ select public.save_household_recipe((select id from public.dishes where name = 'Idli' and household_id is null), 5, null, null, null, null, '[{"name":"Rice","quantity":1,"unit":"cup"}]'::jsonb, '[{"body":"x"}]'::jsonb) $$, 'a member cannot edit the home''s recipes');
select tests.refused($$ delete from public.recipes where household_id = '$$ || :'hh_a' || $$' $$, 'a member cannot delete the home''s recipe copy');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok(not exists (select 1 from public.recipes where id = :'own_rec'), 'another home cannot see this home''s recipe copy');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.recipes where id = :'own_rec';
select tests.ok(not exists (select 1 from public.recipe_ingredients where recipe_id = :'own_rec') and not exists (select 1 from public.recipe_steps where recipe_id = :'own_rec'), 'back to the original: deleting the copy removes its ingredients and steps');
select tests.ok(exists (select 1 from public.recipes where household_id is null and dish_id = (select id from public.dishes where name = 'Idli' and household_id is null)), 'and the standard recipe is still there');

-- ── Nutrition for own dishes and meals out (0026) ──
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
insert into public.dishes (household_id, name, created_by, meal_types) values (:'hh_a', 'Appa''s special', public.my_profile_id(), '{dinner}') returning id as appa_dish \gset
insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg) values (:'appa_dish', '1 plate', 450, 20, 50, 18, 5, 4, 900);
select tests.ok((select kcal = 450 from public.dish_nutrition where dish_id = :'appa_dish'), 'a member can add an estimate for the dish they added');
update public.dish_nutrition set kcal = 500 where dish_id = :'appa_dish';
select tests.ok((select kcal = 500 from public.dish_nutrition where dish_id = :'appa_dish'), 'and change it');
select tests.refused($$ insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg) select id, 'x', 1, 1, 1, 1, 1, 1, 1 from public.dishes where name = 'Pongal' and household_id = '$$ || :'hh_a' || $$' $$, 'a member cannot add an estimate to a dish another member added');
select tests.refused($$ update public.dish_nutrition set kcal = 1 where dish_id = (select id from public.dishes where name = 'Idli' and household_id is null) $$, 'nobody changes the shared catalogue''s estimates');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.dish_nutrition set kcal = 480 where dish_id = :'appa_dish';
select tests.ok((select kcal = 480 from public.dish_nutrition where dish_id = :'appa_dish'), 'the Admin can change an estimate for any of her home''s dishes');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok(not exists (select 1 from public.dish_nutrition where dish_id = :'appa_dish'), 'another home cannot see the estimate');
select tests.refused($$ update public.dish_nutrition set kcal = 1 where dish_id = '$$ || :'appa_dish' || $$' $$, 'another home cannot change it');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.meal_slots (week_plan_id, household_id, date, meal, source) values (:'wk_sun', :'hh_a', '2020-01-09', 'dinner', 'dine_out') returning id as out_slot \gset
update public.meal_slots set outside_meal_size = 'heavy' where id = :'out_slot';
select tests.ok((select outside_meal_size = 'heavy' from public.meal_slots where id = :'out_slot'), 'a dine-out meal can be marked light, normal or heavy');
select tests.refused($$ update public.meal_slots set outside_meal_size = 'huge' where id = '$$ || :'out_slot' || $$' $$, 'only light, normal or heavy are accepted');
select tests.refused($$ update public.meal_slots set source = 'home' where id = '$$ || :'out_slot' || $$' $$, 'a meal cannot become a home meal while it still has a meal-out size');
update public.meal_slots set source = 'home', outside_meal_size = null where id = :'out_slot';
select tests.ok((select source = 'home' and outside_meal_size is null from public.meal_slots where id = :'out_slot'), 'clearing the size and switching to home works together');
select tests.refused($$ update public.meal_slots set outside_meal_size = 'light' where id = '$$ || :'out_slot' || $$' $$, 'a home-cooked meal has no meal-out size');

-- ── Cuisines: rename and delete (0027) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.cuisines (household_id, name) values (:'hh_a', 'Family classics') returning id as cz \gset
update public.cuisines set name = 'Our classics', name_ta = 'எங்கள் உணவுகள்' where id = :'cz';
select tests.ok((select name = 'Our classics' and name_ta = 'எங்கள் உணவுகள்' from public.cuisines where id = :'cz'), 'the Admin can rename her home''s own cuisine');
insert into public.dishes (household_id, name, created_by, meal_types, cuisine_id) values (:'hh_a', 'Amma''s kootu', public.my_profile_id(), '{lunch}', :'cz') returning id as cz_dish \gset
select tests.refused($$ delete from public.cuisines where id = '$$ || :'cz' || $$' $$, 'a cuisine with dishes cannot be deleted');
select tests.ok((select cuisine_id = :'cz' from public.dishes where id = :'cz_dish'), 'and its dishes keep their cuisine');
select tests.refused($$ update public.cuisines set name = 'Hacked' where household_id is null $$, 'the shared cuisines cannot be renamed');
select tests.refused($$ delete from public.cuisines where household_id is null $$, 'the shared cuisines cannot be deleted');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ update public.cuisines set name = 'Mine now' where id = '$$ || :'cz' || $$' $$, 'a member cannot rename the home''s cuisine');
select tests.refused($$ delete from public.cuisines where id = '$$ || :'cz' || $$' $$, 'a member cannot delete the home''s cuisine');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.refused($$ delete from public.cuisines where id = '$$ || :'cz' || $$' $$, 'another home cannot delete it either');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.dishes where id = :'cz_dish';
delete from public.cuisines where id = :'cz';
select tests.ok(not exists (select 1 from public.cuisines where id = :'cz'), 'once no dish uses it, the cuisine can be deleted');

-- ── Bundled photos, batch 3 (0028) ──
select tests.ok((select count(*) from public.dishes where household_id is null and name in ('Pudina rice', 'Mango rice', 'Panakam', 'Brinjal chutney', 'Vazhaithandu poriyal', 'Vadam') and photo_path like 'static/%' and photo_credit like '%Wikimedia Commons') = 6, 'six more shared dishes carry a bundled photo with its credit');
select tests.ok((select photo_path = 'static/idli-2.webp' and photo_credit like 'Sutapa Pal%' from public.dishes where household_id is null and name = 'Idli'), 'the Idli photo was replaced by 0036 (and other photos already set are left alone by 0028)');

-- ── My extras (0029) ──
reset role;
insert into public.common_foods (name_en, name_ta, category, unit, grams_per_unit, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg)
  values ('Test banana', 'வாழைப்பழம்', 'fruit', 'piece', 100, 105, 1.3, 27, 0.4, 3, 14, 1) returning id as cf \gset
select tests.refused($$ insert into public.common_foods (name_en, name_ta, category, unit, grams_per_unit, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg) values ('Vitamin tablet', 'x', 'supplement', 'piece', 1, 0, 0, 0, 0, 0, 0, 0) $$, 'supplements are not a food category');
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ insert into public.common_foods (name_en, name_ta, category, unit, grams_per_unit, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg) values ('Mine', 'x', 'fruit', 'piece', 1, 1, 1, 1, 1, 1, 1, 1) $$, 'nobody can add to the shared food list from the app');
select tests.ok((select count(*) from public.common_foods where name_en = 'Test banana') = 1, 'everyone signed in can read the shared food list');
insert into public.personal_intake (household_id, profile_id, eaten_on, eaten_at, common_food_id, food_name, quantity, unit, kcal, protein_g, created_by)
  values (:'hh_a', :'appa', public.kolkata_today(), '16:30', :'cf', 'Test banana', 1, 'piece', 105, 1.3, public.my_profile_id());
select tests.ok((select count(*) from public.personal_intake) = 1, 'Appa logs an extra for himself and sees it');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'paati' || $$', public.kolkata_today(), '$$ || :'cf' || $$', 'x', 1, 'piece', public.my_profile_id()) $$, 'a member cannot log for Paati, only the Admin can');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, created_by) select '$$ || :'hh_a' || $$', id, public.kolkata_today(), '$$ || :'cf' || $$', 'x', 1, 'piece', public.my_profile_id() from public.profiles where display_name = 'Amma' $$, 'a member cannot log for another member');
insert into public.personal_goals (profile_id, household_id, protein_goal_g, kcal_goal) values (:'appa', :'hh_a', 70, 2300);
select tests.ok((select protein_goal_g = 70 from public.personal_goals where profile_id = :'appa'), 'Appa sets his own goals');
insert into public.personal_usuals (profile_id, household_id, common_food_id) values (:'appa', :'hh_a', :'cf');
select tests.refused($$ insert into public.personal_usuals (profile_id, household_id, common_food_id) values ('$$ || :'appa' || $$', '$$ || :'hh_a' || $$', '$$ || :'cf' || $$') $$, 'a food can be starred once');
insert into public.custom_foods (household_id, name, unit, kcal, protein_g, created_by) values (:'hh_a', 'Amma''s laddu', 'piece', 150, 3, public.my_profile_id()) returning id as cust \gset
insert into public.personal_intake (household_id, profile_id, eaten_on, custom_food_id, food_name, quantity, unit, kcal, protein_g, created_by)
  values (:'hh_a', :'appa', public.kolkata_today() - 7, :'cust', 'Amma''s laddu', 2, 'piece', 300, 6, public.my_profile_id());
select tests.ok((select count(*) from public.personal_intake) = 2, 'a forgotten day up to 7 days back can be filled in');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', public.kolkata_today() - 8, '$$ || :'cf' || $$', 'x', 1, 'piece', public.my_profile_id()) $$, 'older than a week cannot be logged');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', public.kolkata_today() + 1, '$$ || :'cf' || $$', 'x', 1, 'piece', public.my_profile_id()) $$, 'the future cannot be logged');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', public.kolkata_today(), 'x', 1, 'piece', public.my_profile_id()) $$, 'an item must say where it came from');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, custom_food_id, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'appa' || $$', public.kolkata_today(), '$$ || :'cf' || $$', '$$ || :'cust' || $$', 'x', 1, 'piece', public.my_profile_id()) $$, 'an item cannot be two foods at once');
select tests.refused($$ insert into public.personal_goals (profile_id, household_id, protein_goal_g) values ('$$ || :'paati' || $$', '$$ || :'hh_a' || $$', 50) $$, 'a member cannot set Paati''s goals');
select tests.refused($$ update public.personal_goals set protein_goal_g = 5 where profile_id = '$$ || :'appa' || $$' $$, 'a goal below 10 g is refused');
update public.custom_foods set kcal = 999 where id = :'cust';
select tests.ok((select kcal = 300 from public.personal_intake where custom_food_id = :'cust'), 'correcting a food later does not change what was logged on a past day');

select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.ok((select count(*) from public.personal_intake where profile_id = :'appa') = 0, 'the Admin cannot read items of a member who has a login');
select tests.ok((select count(*) from public.personal_goals where profile_id = :'appa') = 0 and (select count(*) from public.personal_usuals) = 0, 'nor his goals or usuals');
select tests.ok((select kcal = 105 and items = 1 from public.family_extras_totals(public.kolkata_today(), public.kolkata_today()) where profile_id = :'appa'), 'but she gets his daily totals');
select tests.ok((select count(*) from public.family_extras_totals(public.kolkata_today() - 7, public.kolkata_today()) where profile_id = :'appa') = 2, 'totals come one row per person per day');
insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, kcal, protein_g, created_by)
  values (:'hh_a', :'paati', public.kolkata_today(), :'cf', 'Test banana', 1, 'piece', 105, 1.3, public.my_profile_id());
select tests.ok((select count(*) from public.personal_intake where profile_id = :'paati') = 1, 'the Admin logs an extra for Paati and sees it');
insert into public.personal_goals (profile_id, household_id, protein_goal_g) values (:'paati', :'hh_a', 45);
select tests.ok((select protein_goal_g = 45 from public.personal_goals where profile_id = :'paati'), 'and sets Paati''s goal');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'helper' || $$', public.kolkata_today(), '$$ || :'cf' || $$', 'x', 1, 'piece', public.my_profile_id()) $$, 'the helper is never included');
select tests.refused($$ insert into public.personal_goals (profile_id, household_id, protein_goal_g) values ('$$ || :'appa' || $$', '$$ || :'hh_a' || $$', 90) on conflict (profile_id) do update set protein_goal_g = 90 $$, 'the Admin cannot change a member''s goals');
update public.custom_foods set name = 'Laddu (home)' where id = :'cust';
select tests.ok((select name = 'Laddu (home)' from public.custom_foods where id = :'cust'), 'the Admin can edit a custom food someone else added');

select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.personal_intake where profile_id = :'paati') = 0, 'a member cannot read Paati''s items');

select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.personal_intake) = 0 and (select count(*) from public.custom_foods) = 0 and (select count(*) from public.personal_goals) = 0, 'another home sees none of it');
select tests.ok((select count(*) from public.family_extras_totals(public.kolkata_today() - 7, public.kolkata_today())) = 0, 'another home''s Admin gets only its own totals (none)');
select tests.refused($$ insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'paati' || $$', public.kolkata_today(), '$$ || :'cf' || $$', 'x', 1, 'piece', public.my_profile_id()) $$, 'another home cannot log for Paati');
select tests.refused($$ update public.custom_foods set name = 'Hacked' where id = '$$ || :'cust' || $$' $$, 'another home cannot change the home''s custom foods');
select set_config('request.jwt.claim.sub', 'dddddddd-0000-4000-8000-000000000004', false);
select tests.refused($$ select * from public.family_extras_totals(public.kolkata_today(), public.kolkata_today()) $$, 'someone with no home cannot ask for family totals');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── The shared everyday foods (0030) ──
select tests.ok((select count(*) from public.common_foods where name_en <> 'Test banana') >= 80, 'about 80 everyday foods are in the shared list');
select tests.ok(not exists (select 1 from public.common_foods where btrim(name_ta) = '' or category not in ('dairy', 'eggs', 'fruit', 'nuts_seeds', 'pulses_sprouts', 'meat_fish', 'drinks', 'snacks_sweets', 'protein')), 'every food has a Tamil name and a known category (no supplements)');
select tests.ok((select protein_g = 6.3 and kcal = 72 and unit = 'piece' from public.common_foods where name_en = 'Boiled egg'), 'a boiled egg is about 72 kcal and 6.3 g protein');
select tests.ok((select default_quantity = 3 and unit = 'piece' from public.common_foods where name_en = 'Dates'), 'the usual amount of dates is 3');
select tests.ok(not exists (select 1 from public.common_foods where abs(kcal - (4 * protein_g + 4 * carbs_g + 9 * fat_g)) > greatest(10, 0.15 * kcal) and name_en <> 'Test banana'), 'each food''s calories match its macros');

-- ── Your data and account (0031): a fresh home E with Eve (Admin) and Fay (member) ──
reset role;
insert into auth.users (id) values ('eeeeeeee-0000-4000-8000-000000000005'), ('ffffffff-0000-4000-8000-000000000006');
set role authenticated;
select set_config('request.jwt.claim.sub', 'eeeeeeee-0000-4000-8000-000000000005', false);
select public.create_household('Home E', 'Eve') as hh_e \gset
insert into public.profiles (household_id, display_name, can_login) values (:'hh_e', 'Fay', true) returning id as fay \gset
insert into public.invites (household_id, created_by) values (:'hh_e', public.my_profile_id()) returning token as tok_e \gset
insert into public.cuisines (household_id, name) values (:'hh_e', 'E cuisine') returning id as cu_e \gset
insert into public.dishes (household_id, name, created_by, cuisine_id, meal_types) values (:'hh_e', 'E dish', public.my_profile_id(), :'cu_e', '{lunch}');
select set_config('request.jwt.claim.sub', 'ffffffff-0000-4000-8000-000000000006', false);
select public.claim_profile(:'tok_e', :'fay') is not null as fay_joined \gset
insert into public.profile_allergies (profile_id, allergen) values (:'fay', 'peanut');
insert into public.profile_preferences (profile_id, diet, low_salt) values (:'fay', 'veg', true);
insert into public.diet_plan_follows (profile_id, plan) values (:'fay', 'vegan');
update public.profiles set birth_year = 1990 where id = :'fay';
insert into public.fasting_rules (profile_id, mode) values (:'fay', 'fruits_milk');
insert into public.personal_intake (household_id, profile_id, eaten_on, common_food_id, food_name, quantity, unit, kcal, protein_g, created_by)
  values (:'hh_e', :'fay', public.kolkata_today(), :'cf', 'Test banana', 1, 'piece', 105, 1.3, public.my_profile_id());
insert into public.personal_goals (profile_id, household_id, protein_goal_g) values (:'fay', :'hh_e', 55);
select tests.ok(public.export_my_data() -> 'profile' ->> 'display_name' = 'Fay', 'Fay can download her data, and it is hers');
select tests.ok(jsonb_array_length(public.export_my_data() -> 'extras') = 1 and public.export_my_data() -> 'allergies' ->> 0 = 'peanut' and (public.export_my_data() -> 'goals' ->> 'protein_goal_g')::int = 55, 'it includes her extras, allergies and goals');
select tests.ok(jsonb_array_length(public.export_my_data() -> 'people_in_my_home') = 2 and not (public.export_my_data()::text like '%Our Home%'), 'and her own home only, never another home''s data');
select tests.ok(not (public.export_my_data() ? 'user_id') and not ((public.export_my_data() -> 'profile') ? 'user_id'), 'the login id is not part of the download');
select set_config('request.jwt.claim.sub', 'eeeeeeee-0000-4000-8000-000000000005', false);
select tests.refused($$ select public.delete_my_account() $$, 'the last Admin cannot delete her account while she is the only Admin');
select set_config('request.jwt.claim.sub', 'ffffffff-0000-4000-8000-000000000006', false);
select public.delete_my_account();
reset role;
select tests.ok(not exists (select 1 from auth.users where id = 'ffffffff-0000-4000-8000-000000000006'), 'deleting an account removes the login');
select tests.ok((select display_name = 'Former member' and user_id is null and birth_year is null and can_login = false and role = 'member' from public.profiles where id = :'fay'), 'the profile stays as "Former member" with no login or personal details');
select tests.ok(not exists (select 1 from public.personal_intake where profile_id = :'fay') and not exists (select 1 from public.personal_goals where profile_id = :'fay') and not exists (select 1 from public.profile_allergies where profile_id = :'fay'), 'her extras, goals and allergies are gone');
select tests.ok((select count(*) from public.profiles where household_id = :'hh_e') = 2 and exists (select 1 from auth.users where id = 'eeeeeeee-0000-4000-8000-000000000005'), 'the rest of the home is untouched');
select tests.ok(not exists (select 1 from public.profile_preferences where profile_id = :'fay'), 'her diet preferences go with her login');
select tests.ok(not exists (select 1 from public.diet_plan_follows where profile_id = :'fay'), 'and her diet plans');
select tests.ok(not exists (select 1 from public.fasting_rules where profile_id = :'fay'), 'and her fasting rule');
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ select public.delete_household('Our Home') $$, 'a member cannot delete the household');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.refused($$ select public.delete_household('Our Home') $$, 'an Admin cannot delete another home by typing its name');
select set_config('request.jwt.claim.sub', 'eeeeeeee-0000-4000-8000-000000000005', false);
select tests.refused($$ select public.delete_household('home e') $$, 'the name must be typed exactly');
select public.delete_household('Home E');
reset role;
select tests.ok(not exists (select 1 from public.households where id = :'hh_e') and not exists (select 1 from public.profiles where household_id = :'hh_e') and not exists (select 1 from public.dishes where household_id = :'hh_e') and not exists (select 1 from public.cuisines where household_id = :'hh_e'), 'deleting the household removes everything in it, even a cuisine with dishes');
select tests.ok(not exists (select 1 from auth.users where id = 'eeeeeeee-0000-4000-8000-000000000005'), 'and the logins that belonged to it');
select tests.ok((select count(*) from public.profiles where household_id = :'hh_a') >= 4 and exists (select 1 from public.households where id = :'hh_c'), 'other homes are untouched');
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── Shopping list (migration 0032) ──
select public.my_profile_id() as amma_p \gset
insert into public.shopping_items (household_id, name, section, amount, unit, added_by) values (:'hh_a', 'Tomato', 'veg_fruit', 1, 'kg', :'amma_p') returning id as shop1 \gset
insert into public.shopping_items (household_id, name, section, added_by, is_regular) values (:'hh_a', 'Milk', 'dairy_eggs', :'amma_p', true) returning id as shop_milk \gset
select tests.refused($$ insert into public.shopping_items (household_id, name, added_by) values ('$$ || :'hh_a' || $$', 'tomato', '$$ || :'amma_p' || $$') $$, 'the same item name (any capitals) cannot be on the list twice');
select tests.refused($$ insert into public.shopping_items (household_id, name, amount, added_by) values ('$$ || :'hh_a' || $$', 'Rice', 2, '$$ || :'amma_p' || $$') $$, 'an amount needs a unit');
select tests.refused($$ insert into public.shopping_items (household_id, name, amount, unit, added_by) values ('$$ || :'hh_a' || $$', 'Rice', 2, 'cup', '$$ || :'amma_p' || $$') $$, 'only g, kg, ml, L, pcs, bunch and pack are units');
select tests.refused($$ insert into public.shopping_items (household_id, name, added_by) values ('$$ || :'hh_a' || $$', 'Soap', '$$ || :'appa' || $$') $$, 'an item cannot be added in someone else''s name');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.shopping_items) = 2, 'a member of the home sees the shared list');
insert into public.shopping_items (household_id, name, section, amount, unit, added_by) values (:'hh_a', 'Eggs', 'dairy_eggs', 12, 'pcs', :'appa');
update public.shopping_items set amount = 2, unit = 'kg' where id = :'shop1';
select tests.ok((select amount = 2 and unit = 'kg' from public.shopping_items where id = :'shop1'), 'any member can change an item');
update public.shopping_items set bought_at = now(), bought_by = :'appa' where id = :'shop1';
select tests.ok((select bought_by = :'appa' from public.shopping_items where id = :'shop1'), 'any member can tick an item');
select tests.refused($$ update public.shopping_items set bought_at = now(), bought_by = '$$ || :'amma_p' || $$' where name = 'Eggs' $$, 'nobody can tick an item as someone else');
select tests.refused($$ update public.shopping_items set added_by = '$$ || :'appa' || $$' where id = '$$ || :'shop1' || $$' $$, 'who added an item cannot be changed');
select tests.refused($$ select public.clear_shopping_list() $$, 'a member cannot clear the whole list');
select tests.ok((select count(*) from public.shopping_items) = 3, 'and nothing was cleared');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.shopping_items) = 0, 'another home cannot read this home''s list');
insert into public.shopping_items (household_id, name, added_by) values (:'hh_c', 'Tomato', public.my_profile_id());
select tests.ok(true, 'another home can have an item with the same name');
select tests.refused($$ insert into public.shopping_items (household_id, name, added_by) values ('$$ || :'hh_a' || $$', 'Spam', public.my_profile_id()) $$, 'another home cannot add to this home''s list');
select tests.refused($$ update public.shopping_items set amount = 9, unit = 'kg' where id = '$$ || :'shop1' || $$' $$, 'another home cannot change this home''s items');
select tests.refused($$ delete from public.shopping_items where id = '$$ || :'shop1' || $$' $$, 'another home cannot remove this home''s items');
select tests.refused($$ update public.shopping_items set household_id = '$$ || :'hh_a' || $$' where lower(name) = 'tomato' $$, 'an item cannot be moved into another home');
select public.clear_shopping_list();
select tests.ok((select count(*) from public.shopping_items) = 0, 'an Admin clears only her own home''s list');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.ok((select count(*) from public.shopping_items) = 3, 'and home A''s list is untouched');
select tests.ok(public.clear_shopping_list() = 2, 'the Admin clears the list: ticked and plain items go');
select tests.ok((select count(*) = 1 and bool_and(is_regular and bought_at < now() - interval '1 day' and bought_by is null) from public.shopping_items), 'a regular is kept but put to sleep, ready for the Regulars button');
update public.shopping_items set bought_at = null where id = :'shop_milk';
select tests.ok((select bought_at is null from public.shopping_items where id = :'shop_milk'), 'Regulars wake a sleeping item up again');
delete from public.shopping_items where id = :'shop_milk';
select tests.ok((select count(*) from public.shopping_items) = 0, 'any member can remove a single item');

-- ── Common shopping items and a home's own (migration 0033) ──
select tests.ok((select count(*) from public.common_shop_items) >= 140, 'the shared common shopping items are visible');
select tests.ok(not exists (select 1 from public.common_shop_items where btrim(name_ta) = ''), 'every common shopping item has a Tamil name');
select tests.ok(not exists (select 1 from public.common_shop_items where perishable and pack_sizes is not null), 'perishables are rounded, never packed');
select tests.ok((select pack_sizes = array[1000, 5000]::numeric[] and staple from public.common_shop_items where name_en = 'Oil'), 'oil is a staple sold in 1 L and 5 L');
select tests.refused($$ insert into public.common_shop_items (name_en, name_ta, section, browse_tab, usual_amount, usual_unit) values ('Spam', 'x', 'other', 'other', 1, 'pack') $$, 'a home cannot add to the shared common items');
select tests.refused($$ update public.common_shop_items set name_en = 'Hacked' where name_en = 'Tomato' $$, 'nor change them');
select tests.refused($$ delete from public.common_shop_items where name_en = 'Tomato' $$, 'nor delete them');
select tests.refused($$ insert into public.household_shop_items (household_id, name_en, created_by) values ('$$ || :'hh_a' || $$', 'X', '$$ || :'appa' || $$') $$, 'an own item cannot be created in someone else''s name');
insert into public.household_shop_items (household_id, name_en, name_ta, section, browse_tab, usual_amount, usual_unit, created_by) values (:'hh_a', 'Foxtail millet', 'தினை', 'grocery', 'groceries', 500, 'g', :'amma_p') returning id as hs1 \gset
select tests.refused($$ insert into public.household_shop_items (household_id, name_en, created_by) values ('$$ || :'hh_a' || $$', ' foxtail MILLET', '$$ || :'amma_p' || $$') $$, 'the same own item name cannot be saved twice (any capitals)');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.household_shop_items) = 1, 'a member sees the home''s own items');
insert into public.household_shop_items (household_id, name_en, created_by) values (:'hh_a', 'Banana stem', :'appa') returning id as hs2 \gset
select tests.refused($$ update public.household_shop_items set name_en = 'Renamed' where id = '$$ || :'hs1' || $$' $$, 'a member cannot rename an item someone else saved');
select tests.refused($$ delete from public.household_shop_items where id = '$$ || :'hs1' || $$' $$, 'nor delete it');
update public.household_shop_items set name_ta = 'வாழைத்தண்டு' where id = :'hs2';
select tests.ok((select name_ta = 'வாழைத்தண்டு' from public.household_shop_items where id = :'hs2'), 'the creator can rename her own item');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.household_shop_items) = 0, 'another home cannot read this home''s own items');
select tests.refused($$ insert into public.household_shop_items (household_id, name_en, created_by) values ('$$ || :'hh_a' || $$', 'Spam', public.my_profile_id()) $$, 'nor add to them');
select tests.refused($$ update public.household_shop_items set name_en = 'Hacked' where id = '$$ || :'hs1' || $$' $$, 'nor change them');
select tests.refused($$ delete from public.household_shop_items where id = '$$ || :'hs1' || $$' $$, 'nor delete them');
insert into public.household_shop_items (household_id, name_en, created_by) values (:'hh_c', 'Foxtail millet', public.my_profile_id());
select tests.ok(true, 'another home can save an item with the same name');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.household_shop_items set name_en = 'Banana stem (fresh)' where id = :'hs2';
select tests.ok((select name_en = 'Banana stem (fresh)' from public.household_shop_items where id = :'hs2'), 'the Admin can rename anyone''s item');
delete from public.household_shop_items where id = :'hs2';
select tests.ok(not exists (select 1 from public.household_shop_items where id = :'hs2'), 'and delete it');

-- ── Prep reminders (migration 0034) ──
select tests.ok((select count(*) from public.recipe_prep) >= 55, 'the standard recipes carry prep tags');
select tests.ok(exists (select 1 from public.recipe_prep rp join public.recipes r on r.id = rp.recipe_id join public.dishes d on d.id = r.dish_id
                        where d.name = 'Idli' and r.household_id is null and rp.kind = 'batter_ferment' and rp.lead = 'night_before' and rp.hours = 8 and rp.text_ta is not null), 'idli batter is a night-before task that needs about 8 hours, with Tamil wording');
select tests.ok(not exists (select 1 from public.recipe_prep where lead = 'hours_before' and hours is null), 'an hours-before task always says how many hours');
select tests.refused($$ insert into public.recipe_prep (recipe_id, kind, lead, text_en) select id, 'other', 'night_before', 'x' from public.recipes where household_id is null limit 1 $$, 'a home cannot add tags to a standard recipe');
select tests.refused($$ update public.recipe_prep set text_en = 'Hacked' $$, 'nor change the standard tags');
select tests.refused($$ delete from public.recipe_prep $$, 'nor delete them');
select id as prep_idli from public.dishes where name = 'Idli' and household_id is null \gset
select id as prep_curdrice from public.dishes where name = 'Curd rice' and household_id is null \gset
insert into public.week_plans (household_id, week_start) values (:'hh_a', '2030-01-07') returning id as wk_prep \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal, main_dish_id) values (:'wk_prep', :'hh_a', '2030-01-10', 'dinner', :'prep_idli') returning id as slot_prep \gset
insert into public.meal_slot_sides (slot_id, position, dish_id) values (:'slot_prep', 1, :'prep_curdrice');
insert into public.meal_slot_cooks (slot_id, profile_id) values (:'slot_prep', :'appa'), (:'slot_prep', :'helper');
insert into public.recipes (dish_id, household_id, servings) values (:'prep_idli', :'hh_a', 4) returning id as rec_prep \gset
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ insert into public.recipe_prep (recipe_id, kind, lead, text_en) values ('$$ || :'rec_prep' || $$', 'other', 'night_before', 'Member tag') $$, 'a member cannot add tags to the home''s own recipe (Admin only)');
select id as prep_task from public.recipe_prep where recipe_id = (select r.id from public.recipes r join public.dishes d on d.id = r.dish_id where d.name = 'Idli' and r.household_id is null) \gset
insert into public.prep_done (slot_id, prep_id, household_id, done_by) values (:'slot_prep', :'prep_task', :'hh_a', :'appa');
select tests.ok((select done_by = :'appa' from public.prep_done where slot_id = :'slot_prep'), 'a member ticks a prep task done and the home sees who');
select tests.refused($$ insert into public.prep_done (slot_id, prep_id, household_id, done_by) values ('$$ || :'slot_prep' || $$', '$$ || :'prep_task' || $$', '$$ || :'hh_a' || $$', '$$ || :'amma_p' || $$') $$, 'a task cannot be ticked in someone else''s name (or twice)');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.prep_done) = 0, 'another home cannot see what was ticked');
select tests.refused($$ insert into public.prep_done (slot_id, prep_id, household_id, done_by) values ('$$ || :'slot_prep' || $$', '$$ || :'prep_task' || $$', '$$ || :'hh_a' || $$', public.my_profile_id()) $$, 'nor tick tasks for this home');
select tests.refused($$ delete from public.prep_done $$, 'nor undo them');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.prep_done where slot_id = :'slot_prep';
select tests.ok(not exists (select 1 from public.prep_done), 'anyone in the home can undo a tick');
reset role;
select tests.ok(public.create_prep_reminders('2030-01-09 17:00:00+05:30') = 0, 'no reminders before 7 pm');
select tests.ok(public.create_prep_reminders('2030-01-09 21:00:00+05:30') = 0, 'nor after the 7 o''clock hour');
select public.create_prep_reminders('2030-01-09 19:30:00+05:30') as made1 \gset
select tests.ok(:made1 = 2, 'at 7 pm Appa, the cook with a login, gets a reminder for the idli batter and for the curd (the helper has none)');
select tests.ok(not exists (select 1 from public.notifications n join public.profiles p on p.id = n.profile_id where n.type = 'prep_reminder' and p.user_id is null), 'a cook without a login gets nothing');
select tests.ok(exists (select 1 from public.notifications where type = 'prep_reminder' and profile_id = :'appa' and slot_id = :'slot_prep' and data->>'task_en' = 'Set the curd' and data->>'dish_en' = 'Curd rice' and data->>'task_ta' is not null), 'the reminder names the task and the dish, in both languages');
select tests.ok(public.create_prep_reminders('2030-01-09 19:45:00+05:30') = 0, 'running again the same evening adds nothing');
delete from public.notifications where type = 'prep_reminder';
insert into public.prep_done (slot_id, prep_id, household_id, done_by) values (:'slot_prep', :'prep_task', :'hh_a', :'appa');
select tests.ok(public.create_prep_reminders('2030-01-09 19:50:00+05:30') = 1, 'a task that is already done gets no reminder (only the curd is left)');
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.refused($$ select public.create_prep_reminders() $$, 'a signed-in person cannot run the reminder function');
insert into public.recipe_prep (recipe_id, kind, lead, hours, text_en) values (:'rec_prep', 'other', 'night_before', null, 'Our own prep');
reset role;
select tests.ok((select count(*) = 1 and bool_and(text_en = 'Our own prep') from public.prep_for_dish(:'prep_idli', :'hh_a')), 'a home''s own recipe tags replace the standard ones for that home');
select tests.ok((select count(*) = 1 and bool_and(text_en like 'Grind%') from public.prep_for_dish(:'prep_idli', :'hh_c')), 'another home still gets the standard tag');
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── Own prep reminders and switching the default ones off (migration 0035) ──
delete from public.recipe_prep where text_en = 'Our own prep';
insert into public.recipe_prep (household_id, dish_id, kind, lead, hours, text_en, text_ta, created_by)
  values (:'hh_a', :'prep_idli', 'other', 'night_before', null, 'Take the dosa batter out of the fridge', null, :'amma_p') returning id as own1 \gset
select tests.ok((select household_id = :'hh_a' and recipe_id is null from public.recipe_prep where id = :'own1'), 'the Admin adds her home''s own reminder for a dish');
select tests.refused($$ insert into public.recipe_prep (household_id, kind, lead, text_en, created_by) values ('$$ || :'hh_a' || $$', 'other', 'night_before', 'No dish', '$$ || :'amma_p' || $$') $$, 'an own reminder must belong to a dish');
select tests.refused($$ insert into public.recipe_prep (recipe_id, household_id, dish_id, kind, lead, text_en, created_by) select id, '$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'other', 'night_before', 'Both', '$$ || :'amma_p' || $$' from public.recipes where household_id is null limit 1 $$, 'a reminder is either a recipe''s or a home''s own, never both');
select tests.refused($$ insert into public.recipe_prep (household_id, dish_id, kind, lead, text_en, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'other', 'hours_before', 'No hours', '$$ || :'amma_p' || $$') $$, 'an hours-before reminder must say how many hours');
select tests.refused($$ insert into public.recipe_prep (household_id, dish_id, kind, lead, text_en, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'other', 'night_before', 'In someone''s name', '$$ || :'appa' || $$') $$, 'an own reminder cannot be created in someone else''s name');
-- a member with no Planner turn today cannot change them
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.recipe_prep where household_id = :'hh_a') = 1, 'every member sees the home''s own reminders');
select tests.refused($$ insert into public.recipe_prep (household_id, dish_id, kind, lead, text_en, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'other', 'night_before', 'Member', '$$ || :'appa' || $$') $$, 'a member with no Planner turn today cannot add one');
select tests.refused($$ update public.recipe_prep set text_en = 'Changed' where id = '$$ || :'own1' || $$' $$, 'nor change one');
select tests.refused($$ delete from public.recipe_prep where id = '$$ || :'own1' || $$' $$, 'nor remove one');
select tests.refused($$ insert into public.household_prep_off (household_id, prep_id, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_task' || $$', '$$ || :'appa' || $$') $$, 'nor switch a default reminder off');
-- ...but the Planner can: someone with an approved turn that covers today
reset role;
insert into public.planner_turns (household_id, profile_id, scope, start_date, end_date) values (:'hh_a', :'appa', 'week', current_date - 1, current_date + 1) returning id as turn_prep \gset
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
insert into public.recipe_prep (household_id, dish_id, kind, lead, hours, text_en, created_by) values (:'hh_a', :'prep_idli', 'soak', 'hours_before', 2, 'Planner''s reminder', :'appa') returning id as own2 \gset
select tests.ok(exists (select 1 from public.recipe_prep where id = :'own2'), 'whoever is the Planner today can add one');
update public.recipe_prep set text_en = 'Planner''s reminder, edited' where id = :'own2';
select tests.ok((select text_en = 'Planner''s reminder, edited' from public.recipe_prep where id = :'own2'), 'and edit it');
delete from public.recipe_prep where id = :'own2';
select tests.ok(not exists (select 1 from public.recipe_prep where id = :'own2'), 'and remove it');
reset role;
delete from public.planner_turns where id = :'turn_prep';
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ insert into public.recipe_prep (household_id, dish_id, kind, lead, text_en, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'other', 'night_before', 'Turn is over', '$$ || :'appa' || $$') $$, 'once the turn is over, they cannot');
-- another home sees and changes nothing
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.recipe_prep where household_id is not null) = 0, 'another home cannot see this home''s own reminders');
select tests.refused($$ insert into public.recipe_prep (household_id, dish_id, kind, lead, text_en, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'other', 'night_before', 'Spam', public.my_profile_id()) $$, 'nor add to them');
select tests.refused($$ update public.recipe_prep set text_en = 'Hacked' where id = '$$ || :'own1' || $$' $$, 'nor change them');
select tests.refused($$ delete from public.recipe_prep where id = '$$ || :'own1' || $$' $$, 'nor remove them');
select tests.refused($$ insert into public.household_prep_off (household_id, prep_id, created_by) values ('$$ || :'hh_a' || $$', '$$ || :'prep_task' || $$', public.my_profile_id()) $$, 'nor switch off defaults for this home');
-- the Admin switches a default off
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.household_prep_off (household_id, prep_id, created_by) values (:'hh_a', :'prep_task', :'amma_p');
select tests.refused($$ insert into public.household_prep_off (household_id, prep_id, created_by) select '$$ || :'hh_a' || $$', id, '$$ || :'amma_p' || $$' from public.recipe_prep where household_id is not null limit 1 $$, 'only a standard reminder can be switched off (not an own one)');
reset role;
select tests.ok((select count(*) = 1 and bool_and(text_en like 'Take the dosa%') from public.prep_for_dish(:'prep_idli', :'hh_a')), 'with the standard idli reminder off, this home gets only its own reminder for idli');
select tests.ok((select count(*) = 1 and bool_and(text_en like 'Grind%') from public.prep_for_dish(:'prep_idli', :'hh_c')), 'another home still gets the standard one and none of ours');
select tests.ok(public.create_prep_reminders('2030-01-09 19:55:00+05:30') = 1, 'the 7 pm reminder follows: Appa gets our own idli reminder, not the switched-off one (the curd was already sent)');
select tests.ok(exists (select 1 from public.notifications where type = 'prep_reminder' and profile_id = :'appa' and data->>'task_en' = 'Take the dosa batter out of the fridge'), 'and it carries our wording');
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.refused($$ delete from public.household_prep_off $$, 'a member cannot switch it back on');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.household_prep_off where household_id = :'hh_a' and prep_id = :'prep_task';
reset role;
select tests.ok((select count(*) = 2 from public.prep_for_dish(:'prep_idli', :'hh_a')), 'switched back on, the standard reminder returns beside our own');
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.recipe_prep where id = :'own1';
reset role;
select tests.ok((select count(*) = 1 from public.prep_for_dish(:'prep_idli', :'hh_a')), 'removing our own reminder leaves the standard one');
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── The credit of a photo chosen from the web (migration 0037) ──
insert into public.dish_photo_overrides (dish_id, household_id, photo_path, photo_credit) values (:'prep_idli', :'hh_a', 'home-a/idli.jpg', 'Sutapa Pal, CC BY-SA 4.0, via Wikimedia Commons')
  on conflict (dish_id, household_id) do update set photo_credit = excluded.photo_credit, photo_path = excluded.photo_path;
select tests.ok((select photo_credit like 'Sutapa Pal%' from public.dish_photo_overrides where household_id = :'hh_a' and dish_id = :'prep_idli'), 'a photo chosen from the web keeps its credit');
select tests.refused($$ update public.dish_photo_overrides set photo_credit = repeat('x', 301) where household_id = '$$ || :'hh_a' || $$' $$, 'a credit is a short line, not an essay');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.dish_photo_overrides where photo_credit is not null) = 0, 'another home cannot see that credit');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── Leftovers (migration 0038) ──
select (now() at time zone 'Asia/Kolkata')::date as today \gset
insert into public.meal_slots (week_plan_id, household_id, date, meal, main_dish_id) values (:'wk_new', :'hh_a', :'today', 'dinner', :'pongal') returning id as slot_today \gset
insert into public.leftovers (household_id, dish_id, from_slot_id, amount, kept_in, cooked_on, use_by, created_by)
  values (:'hh_a', :'pongal', :'slot_today', 'some', 'fridge', :'today', (:'today'::date + 1), public.my_profile_id()) returning id as lo1 \gset
select tests.ok((select count(*) from public.leftovers where household_id = :'hh_a') = 1, 'Amma records a leftover');
select tests.refused($$ insert into public.leftovers (household_id, dish_id, from_slot_id, amount, kept_in, cooked_on, use_by, created_by)
  values ('$$ || :'hh_a' || $$', '$$ || :'pongal' || $$', '$$ || :'slot_today' || $$', 'lot', 'out', '$$ || :'today' || $$', '$$ || :'today' || $$', public.my_profile_id()) $$, 'the same dish of the same meal is recorded once');
select tests.refused($$ insert into public.leftovers (household_id, dish_id, amount, kept_in, cooked_on, use_by, created_by)
  values ('$$ || :'hh_a' || $$', '$$ || :'pongal' || $$', 'little', 'fridge', '$$ || :'today' || $$', ('$$ || :'today' || $$'::date + 3), public.my_profile_id()) $$, 'a use-by is the same day or the next');
select tests.refused($$ insert into public.leftovers (household_id, dish_id, amount, kept_in, cooked_on, use_by, created_by)
  values ('$$ || :'hh_a' || $$', '$$ || :'pongal' || $$', 'huge', 'fridge', '$$ || :'today' || $$', '$$ || :'today' || $$', public.my_profile_id()) $$, 'the amount is a little, some or a lot');
select tests.refused($$ insert into public.leftovers (household_id, dish_id, amount, kept_in, cooked_on, use_by, created_by)
  values ('$$ || :'hh_c' || $$', '$$ || :'pongal' || $$', 'little', 'fridge', '$$ || :'today' || $$', '$$ || :'today' || $$', public.my_profile_id()) $$, 'a leftover cannot be recorded in another home');
select tests.refused($$ update public.leftovers set dish_id = (select id from public.dishes where household_id is null limit 1) where id = '$$ || :'lo1' || $$' $$, 'the dish of a leftover cannot be changed');
select tests.refused($$ update public.leftovers set household_id = '$$ || :'hh_c' || $$' where id = '$$ || :'lo1' || $$' $$, 'a leftover cannot move to another home');
-- another home sees and changes nothing
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.leftovers) = 0, 'another home cannot see the leftovers');
select tests.refused($$ update public.leftovers set status = 'gone' where id = '$$ || :'lo1' || $$' $$, 'another home cannot change a leftover');
select tests.refused($$ delete from public.leftovers where id = '$$ || :'lo1' || $$' $$, 'another home cannot delete a leftover');
select tests.refused($$ select public.use_leftover('$$ || :'lo1' || $$', '$$ || :'slot_today' || $$') $$, 'another home cannot use a leftover');
-- Appa is an ordinary member: he cannot write sides, but he can use a leftover through the function
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.leftovers) = 1, 'a member sees the home''s leftovers');
select tests.refused($$ insert into public.meal_slot_sides (slot_id, position, dish_id) values ('$$ || :'slot_today' || $$', 1, '$$ || :'pongal' || $$') $$, 'a member cannot write a side directly');
select public.use_leftover(:'lo1', :'slot_today');
select tests.ok((select status = 'used' and used_slot_id = :'slot_today'::uuid from public.leftovers where id = :'lo1'), 'using a leftover marks it used for that meal');
select tests.ok((select is_leftover and leftover_id = :'lo1'::uuid and position = 1 from public.meal_slot_sides where slot_id = :'slot_today'), 'it becomes a side marked leftover');
select tests.refused($$ select public.use_leftover('$$ || :'lo1' || $$', '$$ || :'slot_today' || $$') $$, 'a used leftover cannot be used again');
-- Amma puts it back and tries the places it must not go
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.leftovers set status = 'active', used_slot_id = null where id = :'lo1';
delete from public.meal_slot_sides where slot_id = :'slot_today';
insert into public.meal_slots (week_plan_id, household_id, date, meal, main_dish_id) values (:'wk_old', :'hh_a', '2020-01-09', 'lunch', :'pongal') returning id as slot_past \gset
select tests.refused($$ select public.use_leftover('$$ || :'lo1' || $$', '$$ || :'slot_past' || $$') $$, 'a leftover cannot go into a meal in the past');
insert into public.meal_slots (week_plan_id, household_id, date, meal, main_dish_id) values (:'wk_new', :'hh_a', (:'today'::date + 5), 'dinner', :'pongal') returning id as slot_far \gset
select tests.refused($$ select public.use_leftover('$$ || :'lo1' || $$', '$$ || :'slot_far' || $$') $$, 'a leftover cannot go into a meal past its use-by');
insert into public.meal_slots (week_plan_id, household_id, date, meal, source, place_name) values (:'wk_new', :'hh_a', :'today', 'lunch', 'dine_out', 'Udupi') returning id as slot_out \gset
select tests.refused($$ select public.use_leftover('$$ || :'lo1' || $$', '$$ || :'slot_out' || $$') $$, 'a leftover goes only into a meal cooked at home');
insert into public.meal_slot_sides (slot_id, position, dish_id) values (:'slot_today', 1, :'pongal'), (:'slot_today', 2, :'pongal'), (:'slot_today', 3, :'pongal');
select tests.refused($$ select public.use_leftover('$$ || :'lo1' || $$', '$$ || :'slot_today' || $$') $$, 'a meal with three sides has no room for a leftover');
delete from public.meal_slot_sides where slot_id = :'slot_today';
select tests.refused($$ insert into public.meal_slot_sides (slot_id, position, dish_id, is_leftover, leftover_id) values ('$$ || :'slot_today' || $$', 1, '$$ || :'pongal' || $$', true, gen_random_uuid()) $$, 'a side cannot point at a leftover that does not exist');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
insert into public.leftovers (household_id, dish_id, amount, kept_in, cooked_on, use_by, created_by)
  select :'hh_c'::uuid, id, 'little', 'out', :'today'::date, :'today'::date, public.my_profile_id() from public.dishes where household_id is null limit 1 returning id as lo_c \gset
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.refused($$ insert into public.meal_slot_sides (slot_id, position, dish_id, is_leftover, leftover_id) values ('$$ || :'slot_today' || $$', 1, '$$ || :'pongal' || $$', true, '$$ || :'lo_c' || $$') $$, 'a side cannot use another home''s leftover');
reset role;
select tests.ok(not exists (select 1 from information_schema.routine_privileges where routine_name = 'use_leftover' and grantee in ('anon', 'PUBLIC')), 'signed-out visitors cannot use leftovers');
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.leftovers set status = 'gone' where id = :'lo1';
select tests.ok((select status = 'gone' from public.leftovers where id = :'lo1'), 'any member can mark a leftover gone');
delete from public.leftovers where id = :'lo1';
select tests.ok((select count(*) from public.leftovers) = 0, 'and remove it');

-- ── Everyday preferences (migration 0039) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select public.my_profile_id() as amma_pf \gset
insert into public.profile_preferences (profile_id, diet, no_onion_garlic, low_salt, updated_by) values (:'paati', 'veg', true, true, :'amma_pf');
select tests.ok((select diet = 'veg' and low_salt and no_onion_garlic and not low_oil from public.profile_preferences where profile_id = :'paati'), 'the Admin sets the preferences of Paati, who has no login');
insert into public.profile_preferences (profile_id, diet, low_oil) values (:'amma_pf', 'non_veg', true);
select tests.ok((select low_oil from public.profile_preferences where profile_id = :'amma_pf'), 'a person sets their own');
select tests.refused($$ insert into public.profile_preferences (profile_id, diet) values ('$$ || :'appa' || $$', 'egg') $$, 'the Admin cannot set the preferences of a member who has joined');
select tests.refused($$ insert into public.profile_preferences (profile_id, low_salt) values ('$$ || :'helper' || $$', true) $$, 'the helper has no preferences');
select tests.refused($$ insert into public.profile_preferences (profile_id, diet) values ('$$ || :'amma_pf' || $$', 'vegan') $$, 'a diet is veg, egg or non-veg (plans come separately)');
update public.profile_preferences set low_sugar = true where profile_id = :'paati';
select tests.ok((select low_sugar from public.profile_preferences where profile_id = :'paati'), 'the Admin can change them later');
-- Appa
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
insert into public.profile_preferences (profile_id, diet) values (:'appa', 'non_veg');
select tests.ok((select count(*) from public.profile_preferences) = 3, 'everyone in the home can read the preferences');
select tests.refused($$ update public.profile_preferences set low_oil = false where profile_id = '$$ || :'amma_pf' || $$' $$, 'a member cannot change another member''s preferences');
select tests.refused($$ update public.profile_preferences set low_salt = false where profile_id = '$$ || :'paati' || $$' $$, 'a member who is not the Admin cannot change Paati''s');
select tests.refused($$ delete from public.profile_preferences where profile_id = '$$ || :'paati' || $$' $$, 'nor remove them');
-- another home
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.profile_preferences) = 0, 'another home cannot see them');
select tests.refused($$ insert into public.profile_preferences (profile_id, diet) values ('$$ || :'paati' || $$', 'egg') $$, 'another home cannot set them');
-- Appa removes his own
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
delete from public.profile_preferences where profile_id = :'appa';
select tests.ok((select count(*) from public.profile_preferences) = 2, 'a person can clear their own');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── Diet tags (migration 0040) ──
select tests.ok((select count(*) from public.dishes where household_id is null and 'low_carb' = any (tags)) >= 100, 'the shared dishes carry diet tags');
select tests.ok((select tags @> array['grain', 'pulse'] and not tags @> array['meat'] from public.dishes where household_id is null and name = 'Idli'), 'Idli is tagged grain and pulse, not meat');
select tests.ok((select tags @> array['meat', 'high_protein', 'oily'] from public.dishes where household_id is null and name = 'Butter chicken'), 'Butter chicken is tagged meat, high protein and oily');
select tests.ok(not exists (select 1 from public.dishes where household_id is null and tags @> array['meat'] and tags @> array['fasting_food']), 'no meat dish is a fasting food');
select tests.ok(not exists (select 1 from public.dishes where household_id is null and tags @> array['millet'] and not (name ~* '(ragi|kambu|thinai|samai|varagu|kuthiraivali|bajra|jowar|cholam|millet|koozh|mudde)')), 'millet is only on millet dishes');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.household_dish_tags (household_id, dish_id, tag, present) values (:'hh_a', :'prep_idli', 'oily', true);
insert into public.household_dish_tags (household_id, dish_id, tag, present) values (:'hh_a', :'prep_idli', 'pulse', false);
select tests.ok((select count(*) from public.household_dish_tags where household_id = :'hh_a') = 2, 'the Admin corrects tags for the home');
select tests.refused($$ insert into public.household_dish_tags (household_id, dish_id, tag, present) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'vegan', true) $$, 'only the known diet tags can be corrected');
select tests.refused($$ insert into public.household_dish_tags (household_id, dish_id, tag, present) values ('$$ || :'hh_c' || $$', '$$ || :'prep_idli' || $$', 'oily', true) $$, 'a correction cannot be written for another home');
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.household_dish_tags) = 2, 'a member sees the home''s corrections');
select tests.refused($$ insert into public.household_dish_tags (household_id, dish_id, tag, present) values ('$$ || :'hh_a' || $$', '$$ || :'prep_idli' || $$', 'sweet', true) $$, 'a member who is not the Planner today cannot correct tags');
select tests.refused($$ delete from public.household_dish_tags where household_id = '$$ || :'hh_a' || $$' $$, 'nor remove a correction');
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.household_dish_tags) = 0, 'another home cannot see them');
select tests.refused($$ insert into public.household_dish_tags (household_id, dish_id, tag, present) values ('$$ || :'hh_c' || $$', '$$ || :'pongal' || $$', 'oily', true) $$, 'another home''s own dish cannot be corrected here');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.household_dish_tags where household_id = :'hh_a';
select tests.ok((select count(*) from public.household_dish_tags) = 0, 'the Admin can take corrections away');

-- ── Diet plans (migration 0041) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select extract(year from now())::int as this_year \gset
insert into public.profiles (household_id, display_name, can_login, birth_year) values (:'hh_a', 'Kid', false, :'this_year'::int - 10) returning id as kid \gset
insert into public.profiles (household_id, display_name, can_login) values (:'hh_a', 'Unknown', false) returning id as unknown_age \gset
update public.profiles set birth_year = 1980 where id = :'amma_pf';
insert into public.diet_plan_follows (profile_id, plan) values (:'paati', 'low_salt');
insert into public.diet_plan_follows (profile_id, plan) values (:'amma_pf', 'high_protein');
insert into public.diet_plan_follows (profile_id, plan) values (:'amma_pf', 'low_carb');
insert into public.diet_plan_follows (profile_id, plan) values (:'paati', 'senior');
select tests.ok((select count(*) from public.diet_plan_follows) = 4, 'the Admin starts plans for herself and for Paati, who has no login');
select tests.ok((select set_by = :'amma_pf'::uuid from public.diet_plan_follows where profile_id = :'paati' and plan = 'senior'), 'who set a plan is recorded');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'amma_pf' || $$', 'keto') $$, 'only the known plans can be followed');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'kid' || $$', 'low_carb') $$, 'low-carb cannot be set for someone under 18');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'kid' || $$', 'paleo') $$, 'nor paleo');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'unknown_age' || $$', 'paleo') $$, 'a restrictive plan needs a known birth year');
insert into public.diet_plan_follows (profile_id, plan) values (:'kid', 'mediterranean');
insert into public.diet_plan_follows (profile_id, plan) values (:'unknown_age', 'vegan');
select tests.ok((select count(*) from public.diet_plan_follows) = 6, 'the other plans are fine for a child or when the birth year is unknown');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'helper' || $$', 'vegan') $$, 'the helper follows no plan');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'appa' || $$', 'vegan') $$, 'the Admin cannot start a plan for a member who has joined');
-- Appa
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.diet_plan_follows) = 6, 'everyone in the home can see who follows what');
insert into public.diet_plan_follows (profile_id, plan) values (:'appa', 'low_carb');
select tests.ok(exists (select 1 from public.diet_plan_follows where profile_id = :'appa'), 'a member starts a plan for himself');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'amma_pf' || $$', 'vegan') $$, 'a member cannot start a plan for someone else');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'paati' || $$', 'vegan') $$, 'nor for Paati, whom only the Admin sets');
select tests.refused($$ delete from public.diet_plan_follows where profile_id = '$$ || :'paati' || $$' $$, 'nor stop her plan');
delete from public.diet_plan_follows where profile_id = :'appa';
select tests.ok(not exists (select 1 from public.diet_plan_follows where profile_id = :'appa'), 'a person stops their own plan');
-- another home
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.diet_plan_follows) = 0, 'another home cannot see the plans');
select tests.refused($$ insert into public.diet_plan_follows (profile_id, plan) values ('$$ || :'paati' || $$', 'vegan') $$, 'another home cannot set one');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

-- ── The diet plate (migration 0042) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.meal_slot_plates (slot_id, position, main_dish_id, plans, shared_sides) values (:'slot_today', 1, :'prep_idli', '{low_carb}', '{1}') returning id as plate1 \gset
insert into public.meal_slot_plate_sides (plate_id, position, dish_id) values (:'plate1', 1, :'pongal');
insert into public.meal_slot_plate_eaters (plate_id, slot_id, profile_id) values (:'plate1', :'slot_today', :'paati');
select tests.ok((select count(*) from public.meal_slot_plate_eaters where slot_id = :'slot_today') = 1 and (select shared_sides = '{1}' from public.meal_slot_plates where id = :'plate1'), 'the Planner adds a diet plate with its people, a side and a shared side');
insert into public.meal_slot_plates (slot_id, position, main_dish_id, plans) values (:'slot_today', 2, :'pongal', '{vegan}') returning id as plate2 \gset
select tests.refused($$ insert into public.meal_slot_plates (slot_id, position) values ('$$ || :'slot_today' || $$', 3) $$, 'a meal has at most two plates');
select tests.refused($$ insert into public.meal_slot_plates (slot_id, position) values ('$$ || :'slot_today' || $$', 2) $$, 'and one plate per position');
select tests.refused($$ insert into public.meal_slot_plate_eaters (plate_id, slot_id, profile_id) values ('$$ || :'plate2' || $$', '$$ || :'slot_today' || $$', '$$ || :'paati' || $$') $$, 'a person is on one plate of a meal only');
select tests.refused($$ insert into public.meal_slot_plate_eaters (plate_id, slot_id, profile_id) values ('$$ || :'plate2' || $$', '$$ || :'slot_today' || $$', '$$ || :'helper' || $$') $$, 'the helper is never on a plate');
select tests.refused($$ insert into public.meal_slot_plate_eaters (plate_id, slot_id, profile_id) values ('$$ || :'plate2' || $$', '$$ || :'slot_far' || $$', '$$ || :'amma_pf' || $$') $$, 'a plate''s people belong to its own meal');
insert into public.meal_slot_plate_eaters (plate_id, slot_id, profile_id) values (:'plate2', :'slot_today', :'amma_pf');
select tests.refused($$ insert into public.meal_slot_plate_sides (plate_id, position, dish_id) values ('$$ || :'plate1' || $$', 3, '$$ || :'pongal' || $$') $$, 'a plate has at most two sides of its own');
-- a dish of another home cannot be used
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
insert into public.dishes (household_id, name, created_by, meal_types) values (:'hh_c', 'Ravi special', public.my_profile_id(), '{lunch}') returning id as dish_c \gset
select tests.ok((select count(*) from public.meal_slot_plates) = 0 and (select count(*) from public.meal_slot_plate_eaters) = 0, 'another home cannot see the plates');
select tests.refused($$ insert into public.meal_slot_plates (slot_id, position) values ('$$ || :'slot_today' || $$', 1) $$, 'another home cannot add a plate');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
select tests.refused($$ update public.meal_slot_plates set main_dish_id = '$$ || :'dish_c' || $$' where id = '$$ || :'plate2' || $$' $$, 'a plate cannot use another home''s dish');
-- Appa has no turn today: he reads but cannot write
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.meal_slot_plates where slot_id = :'slot_today') = 2, 'everyone in the home sees the plates');
select tests.refused($$ delete from public.meal_slot_plates where id = '$$ || :'plate1' || $$' $$, 'a member who is not the Planner cannot remove a plate');
select tests.refused($$ insert into public.meal_slot_plate_sides (plate_id, position, dish_id) values ('$$ || :'plate2' || $$', 1, '$$ || :'pongal' || $$') $$, 'nor add to one');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.meal_slot_plates where id = :'plate2';
select tests.ok(not exists (select 1 from public.meal_slot_plate_eaters where plate_id = :'plate2'), 'removing a plate removes its people');
delete from public.meal_slots where id = :'slot_today';
select tests.ok(not exists (select 1 from public.meal_slot_plates where slot_id = :'slot_today') and not exists (select 1 from public.meal_slot_plate_sides where plate_id = :'plate1'), 'and removing the meal removes its plates and their sides');

-- ── Fasting days (migration 0043) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
insert into public.fasting_rules (profile_id, mode, weekdays, dates) values (:'paati', 'fruits_milk', '{6}', array[current_date + 3]);
insert into public.fasting_rules (profile_id, mode, skip_meals, weekdays) values (:'amma_pf', 'skip_meals', '{dinner}', '{6}');
select tests.ok((select count(*) from public.fasting_rules) = 2, 'the Admin sets fasting for herself and for Paati, who has no login');
select tests.ok((select updated_by = :'amma_pf'::uuid from public.fasting_rules where profile_id = :'paati'), 'who set it is recorded');
select tests.refused($$ insert into public.fasting_rules (profile_id, mode) values ('$$ || :'kid' || $$', 'fruits_milk') $$, 'fasting cannot be set for someone under 18');
select tests.refused($$ insert into public.fasting_rules (profile_id, mode) values ('$$ || :'unknown_age' || $$', 'fruits_milk') $$, 'nor when the birth year is not known');
select tests.refused($$ insert into public.fasting_rules (profile_id, mode) values ('$$ || :'helper' || $$', 'fruits_milk') $$, 'the helper does not fast');
select tests.refused($$ insert into public.fasting_rules (profile_id, mode) values ('$$ || :'appa' || $$', 'fruits_milk') $$, 'the Admin cannot set it for a member who has joined');
select tests.refused($$ update public.fasting_rules set mode = 'one_meal' where profile_id = '$$ || :'paati' || $$' $$, 'one meal a day needs to say which meal');
update public.fasting_rules set mode = 'one_meal', one_meal = 'lunch' where profile_id = :'paati';
select tests.ok((select one_meal = 'lunch' from public.fasting_rules where profile_id = :'paati'), 'one meal a day with its meal is fine');
select tests.refused($$ update public.fasting_rules set weekdays = '{8}' where profile_id = '$$ || :'paati' || $$' $$, 'a weekday is 1 to 7');
select tests.refused($$ update public.fasting_rules set skip_meals = '{supper}' where profile_id = '$$ || :'amma_pf' || $$' $$, 'a skipped meal is breakfast, lunch, snacks or dinner');
select tests.refused($$ update public.fasting_rules set mode = 'water_only' where profile_id = '$$ || :'amma_pf' || $$' $$, 'only the four ways to fast exist');
select tests.ok(public.export_my_data() -> 'diet' -> 'fasting' ->> 'mode' = 'skip_meals' and jsonb_array_length(public.export_my_data() -> 'diet' -> 'plans') >= 1 and public.export_my_data() -> 'diet' -> 'preferences' ->> 'diet' = 'non_veg', 'Download my data includes the preferences, plans and fasting rule');
-- Appa
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select count(*) from public.fasting_rules) = 2, 'everyone in the home can see fasting days');
select tests.refused($$ update public.fasting_rules set mode = 'fasting_foods' where profile_id = '$$ || :'paati' || $$' $$, 'a member cannot change Paati''s');
select tests.refused($$ delete from public.fasting_rules where profile_id = '$$ || :'amma_pf' || $$' $$, 'nor Amma''s');
insert into public.fasting_rules (profile_id, mode, weekdays) values (:'appa', 'fasting_foods', '{2}');
select tests.ok(exists (select 1 from public.fasting_rules where profile_id = :'appa'), 'a member sets their own fasting days');
-- another home
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok((select count(*) from public.fasting_rules) = 0, 'another home cannot see them');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
delete from public.fasting_rules where profile_id = :'paati';
select tests.ok((select count(*) from public.fasting_rules) = 2, 'the Admin can end a rule');

-- ── Guests at a meal (migration 0044) ──
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);
update public.meal_slots set guest_adults = 2, guest_children = 2, guest_note = 'one guest has no nuts' where id = :'slot_far';
select tests.ok((select guest_adults = 2 and guest_children = 2 and guest_note = 'one guest has no nuts' from public.meal_slots where id = :'slot_far'), 'the Admin sets guests, with a note for the cooks');
select tests.ok((select guest_adults = 0 and guest_children = 0 and guest_note is null from public.meal_slots where id = :'slot_out'), 'a meal starts with no guests');
select tests.refused($$ update public.meal_slots set guest_adults = 31 where id = '$$ || :'slot_far' || $$' $$, 'at most 30 adult guests');
select tests.refused($$ update public.meal_slots set guest_children = 31 where id = '$$ || :'slot_far' || $$' $$, 'and 30 children');
select tests.refused($$ update public.meal_slots set guest_adults = -1 where id = '$$ || :'slot_far' || $$' $$, 'never fewer than none');
select tests.refused($$ update public.meal_slots set guest_note = repeat('x', 201) where id = '$$ || :'slot_far' || $$' $$, 'a note is at most 200 characters');
-- Staying longer: the same guests on other planned meals of the home (an ordinary update)
insert into public.meal_slots (week_plan_id, household_id, date, meal, main_dish_id) values (:'wk_new', :'hh_a', (:'today'::date + 6), 'lunch', :'pongal') returning id as slot_next \gset
update public.meal_slots set guest_adults = 2, guest_children = 2, guest_note = 'one guest has no nuts' where id = :'slot_next';
select tests.ok((select count(*) from public.meal_slots where household_id = :'hh_a' and guest_adults = 2) = 2, 'the Admin can repeat guests on other planned meals');
-- Appa has no turn today: he reads the guests but cannot change them
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-4000-8000-000000000002', false);
select tests.ok((select guest_adults = 2 from public.meal_slots where id = :'slot_far'), 'everyone in the home sees the guests');
select tests.refused($$ update public.meal_slots set guest_adults = 9 where id = '$$ || :'slot_far' || $$' $$, 'a member who is not the Planner cannot change them');
-- another home
select set_config('request.jwt.claim.sub', 'cccccccc-0000-4000-8000-000000000003', false);
select tests.ok(not exists (select 1 from public.meal_slots where guest_adults > 0), 'another home cannot see the guests');
select tests.refused($$ update public.meal_slots set guest_adults = 0 where id = '$$ || :'slot_far' || $$' $$, 'nor change them');
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-4000-8000-000000000001', false);

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
