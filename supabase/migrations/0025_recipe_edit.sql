-- HomeFood · 0025: "Edit our version" of a recipe (Admin)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- A home's own copy of a recipe already had tables and rules (migration 0011: Admin only, one copy per dish per home). What was missing is a
-- way to save the whole copy in one go: if the connection dropped half way through, the family would be left with a recipe that has
-- no steps. This function saves the copy (servings, times, notes, every ingredient and every step) inside a single transaction, so it is
-- either all saved or nothing changed. It runs with the caller's own rights, so the same rules apply as for a direct write:
-- only the Admin of the home, only for its own copy; the standard recipe is never touched.
-- "Back to the original" needs nothing new: the Admin deletes the home's copy and the standard recipe shows again.
--
-- p_ingredients: [{"name": "Rice", "name_ta": "அரிசி", "quantity": 2, "unit": "cup"}, ...]   (quantity null for to_taste / as_needed)
-- p_steps:       [{"body": "Soak the rice.", "body_ta": "அரிசியை ஊறவைக்கவும்."}, ...]

create or replace function public.save_household_recipe(
  p_dish uuid,
  p_servings int,
  p_prep int,
  p_cook int,
  p_note text,
  p_note_ta text,
  p_ingredients jsonb,
  p_steps jsonb
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_home uuid := public.my_household_id();
  v_id uuid;
  v_n int;
  i int;
begin
  if v_home is null or not public.is_admin() then
    raise exception 'Only an Admin can edit the home''s recipes';
  end if;
  if not exists (select 1 from public.dishes d where d.id = p_dish and (d.household_id is null or d.household_id = v_home)) then
    raise exception 'That dish is not available to this home';
  end if;
  if jsonb_typeof(p_ingredients) <> 'array' or jsonb_array_length(p_ingredients) = 0 then
    raise exception 'A recipe needs at least one ingredient';
  end if;
  if jsonb_typeof(p_steps) <> 'array' or jsonb_array_length(p_steps) = 0 then
    raise exception 'A recipe needs at least one step';
  end if;

  insert into public.recipes (dish_id, household_id, servings, prep_minutes, cook_minutes, credit, note, note_ta)
  values (p_dish, v_home, p_servings, p_prep, p_cook, null, nullif(btrim(p_note), ''), nullif(btrim(p_note_ta), ''))
  on conflict (dish_id, household_id) where household_id is not null
  do update set servings = excluded.servings, prep_minutes = excluded.prep_minutes, cook_minutes = excluded.cook_minutes,
                note = excluded.note, note_ta = excluded.note_ta
  returning id into v_id;

  delete from public.recipe_ingredients where recipe_id = v_id;
  delete from public.recipe_steps where recipe_id = v_id;

  v_n := jsonb_array_length(p_ingredients);
  for i in 0 .. v_n - 1 loop
    insert into public.recipe_ingredients (recipe_id, position, name, name_ta, quantity, unit)
    values (
      v_id, i + 1,
      btrim(p_ingredients -> i ->> 'name'),
      nullif(btrim(coalesce(p_ingredients -> i ->> 'name_ta', '')), ''),
      (p_ingredients -> i ->> 'quantity')::numeric,
      p_ingredients -> i ->> 'unit'
    );
  end loop;

  v_n := jsonb_array_length(p_steps);
  for i in 0 .. v_n - 1 loop
    insert into public.recipe_steps (recipe_id, position, body, body_ta)
    values (v_id, i + 1, btrim(p_steps -> i ->> 'body'), nullif(btrim(coalesce(p_steps -> i ->> 'body_ta', '')), ''));
  end loop;

  return v_id;
end $$;

revoke all on function public.save_household_recipe(uuid, int, int, int, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.save_household_recipe(uuid, int, int, int, text, text, jsonb, jsonb) to authenticated;
