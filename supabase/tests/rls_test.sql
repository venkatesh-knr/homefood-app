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
select tests.ok((select photo_path = 'static/idli.webp' from public.dishes where household_id is null and name = 'Idli'), 'photos that were already set are left alone');

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
