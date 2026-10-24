-- HomeFood · 0043: fasting days
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0042). Safe to run twice.
-- A person chooses how they fast, on which weekdays and/or dates: skip chosen meals, fasting foods only, fruits and milk only, or one meal a day.
-- On those days they are left out of the meals they do not eat (recipe amounts, shopping, the cook's sheet) and nutrition marks the day as a fasting
-- day instead of calling it low. The app never suggests fasting: it only follows what each person chooses. Not for anyone under 18.
--   * Everyone in the home can READ them (planning needs them); a person sets their own, the Admin sets them for a family member nobody has logged
--     in as yet (the same rule as everyday preferences and diet plans).
--   * A person under 18, or whose birth year is not known, cannot have a fasting rule (database trigger, mirrored in the screen).
--   * One rule per person. `weekdays` are 1 (Monday) to 7 (Sunday). `skip_meals` is used by "skip a meal", `one_meal` by "one meal a day".
--   * Deleting an account removes the person's rule (the trigger of 0039 is extended), and "Download my data" now includes preferences,
--     plans and the fasting rule (the function of 0031 is replaced with the same function plus a `diet` part).

create table if not exists public.fasting_rules (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  mode       text not null check (mode in ('skip_meals', 'fasting_foods', 'fruits_milk', 'one_meal')),
  skip_meals text[] not null default '{}' check (skip_meals <@ array['breakfast', 'lunch', 'snacks', 'dinner']),
  one_meal   text check (one_meal in ('breakfast', 'lunch', 'snacks', 'dinner')),
  weekdays   smallint[] not null default '{}' check (weekdays <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  dates      date[] not null default '{}' check (cardinality(dates) <= 60),
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  check (mode <> 'one_meal' or one_meal is not null)
);

create or replace function public.guard_fasting_rule() returns trigger
language plpgsql security definer set search_path = '' as $$
declare born smallint;
begin
  select birth_year into born from public.profiles where id = new.profile_id;
  if born is null then raise exception 'Add a birth year first: fasting is only for adults'; end if;
  if extract(year from now())::int - born < 18 then raise exception 'Fasting cannot be set for anyone under 18'; end if;
  new.updated_by := public.my_profile_id();
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists fasting_rules_guard on public.fasting_rules;
create trigger fasting_rules_guard before insert or update on public.fasting_rules
  for each row execute function public.guard_fasting_rule();

alter table public.fasting_rules enable row level security;
drop policy if exists fasting_read on public.fasting_rules;
create policy fasting_read on public.fasting_rules for select to authenticated
  using (public.profile_household(profile_id) = public.my_household_id());
drop policy if exists fasting_write on public.fasting_rules;
create policy fasting_write on public.fasting_rules for all to authenticated
  using (public.can_set_diet_for(profile_id)) with check (public.can_set_diet_for(profile_id));
grant select, insert, update, delete on public.fasting_rules to authenticated;

-- ── a deleted account takes the person's fasting rule with it (extends 0039 and 0041) ──
create or replace function public.clear_diet_rows() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.profile_preferences where profile_id = new.id;
  delete from public.diet_plan_follows where profile_id = new.id;
  delete from public.fasting_rules where profile_id = new.id;
  return new;
end $$;

-- ── Download my data: the same function as 0031, plus the diet part ──
create or replace function public.export_my_data() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  me public.profiles;
  home public.households;
begin
  select * into me from public.profiles where user_id = auth.uid();
  if me.id is null then raise exception 'Sign in first'; end if;
  select * into home from public.households where id = me.household_id;
  return jsonb_build_object(
    'exported_at', now(),
    'about', 'Everything HomeFood holds about you, and your home''s meal plans. Nutrition figures are estimates.',
    'profile', to_jsonb(me) - 'user_id',
    'allergies', (select coalesce(jsonb_agg(a.allergen order by a.allergen), '[]'::jsonb) from public.profile_allergies a where a.profile_id = me.id),
    'diet', jsonb_build_object(
      'preferences', (select to_jsonb(p) - 'profile_id' - 'updated_by' from public.profile_preferences p where p.profile_id = me.id),
      'plans', (select coalesce(jsonb_agg(jsonb_build_object('plan', f.plan, 'since', f.since) order by f.since), '[]'::jsonb) from public.diet_plan_follows f where f.profile_id = me.id),
      'fasting', (select to_jsonb(r) - 'profile_id' - 'updated_by' from public.fasting_rules r where r.profile_id = me.id)
    ),
    'goals', (select to_jsonb(g) - 'household_id' from public.personal_goals g where g.profile_id = me.id),
    'extras', (select coalesce(jsonb_agg((to_jsonb(i) - 'household_id' - 'profile_id') order by i.eaten_on, i.eaten_at), '[]'::jsonb) from public.personal_intake i where i.profile_id = me.id),
    'usuals', (select coalesce(jsonb_agg(coalesce(cf.name_en, xf.name, d.name)), '[]'::jsonb)
                 from public.personal_usuals u
                 left join public.common_foods cf on cf.id = u.common_food_id
                 left join public.custom_foods xf on xf.id = u.custom_food_id
                 left join public.dishes d on d.id = u.dish_id
                where u.profile_id = me.id),
    'my_foods', (select coalesce(jsonb_agg(to_jsonb(x) - 'household_id'), '[]'::jsonb) from public.custom_foods x where x.created_by = me.id),
    'votes', (select coalesce(jsonb_agg(jsonb_build_object('date', s.date, 'meal', s.meal, 'vote', v.vote, 'at', v.updated_at) order by s.date), '[]'::jsonb)
                from public.meal_slot_votes v join public.meal_slots s on s.id = v.slot_id where v.profile_id = me.id),
    'comments', (select coalesce(jsonb_agg(jsonb_build_object('date', s.date, 'meal', s.meal, 'text', c.body, 'at', c.created_at) order by c.created_at), '[]'::jsonb)
                   from public.meal_slot_comments c join public.meal_slots s on s.id = c.slot_id where c.profile_id = me.id),
    'suggestions', (select coalesce(jsonb_agg(jsonb_build_object('date', s.date, 'meal', s.meal, 'dish', d.name, 'text', x.free_text, 'status', x.status, 'at', x.created_at) order by x.created_at), '[]'::jsonb)
                      from public.meal_slot_suggestions x join public.meal_slots s on s.id = x.slot_id left join public.dishes d on d.id = x.dish_id where x.profile_id = me.id),
    'attendance', (select coalesce(jsonb_agg(jsonb_build_object('date', s.date, 'meal', s.meal, 'status', a.status, 'portion', a.portion) order by s.date), '[]'::jsonb)
                     from public.meal_attendance a join public.meal_slots s on s.id = a.slot_id where a.profile_id = me.id),
    'notifications', (select coalesce(jsonb_agg(jsonb_build_object('type', n.type, 'at', n.created_at, 'read_at', n.read_at, 'details', n.data) order by n.created_at), '[]'::jsonb) from public.notifications n where n.profile_id = me.id),
    'planner_turns', (select coalesce(jsonb_agg(jsonb_build_object('scope', t.scope, 'from', t.start_date, 'to', t.end_date, 'status', t.status) order by t.start_date), '[]'::jsonb) from public.planner_turns t where t.profile_id = me.id),
    'dishes_I_added', (select coalesce(jsonb_agg(jsonb_build_object('name', d.name, 'meal_types', d.meal_types, 'course', d.course, 'diet', d.diet, 'tags', d.tags, 'allergens', d.allergens, 'nutrition_estimate', (select to_jsonb(n) - 'dish_id' from public.dish_nutrition n where n.dish_id = d.id))), '[]'::jsonb)
                         from public.dishes d where d.created_by = me.id and d.household_id is not null),
    'home', jsonb_build_object('name', home.name, 'week_starts_on', home.week_start, 'time_zone', home.timezone, 'default_language', home.default_language, 'snacks', home.snacks_enabled),
    'people_in_my_home', (select coalesce(jsonb_agg(jsonb_build_object('name', p.display_name, 'kind', p.kind) order by p.created_at), '[]'::jsonb) from public.profiles p where p.household_id = me.household_id),
    'meal_plans', (select coalesce(jsonb_agg(jsonb_build_object(
                      'date', s.date, 'meal', s.meal, 'source', s.source, 'place', s.place_name, 'note', s.note,
                      'main_dish', (select d.name from public.dishes d where d.id = s.main_dish_id),
                      'sides', (select coalesce(jsonb_agg(d.name order by sd.position), '[]'::jsonb) from public.meal_slot_sides sd join public.dishes d on d.id = sd.dish_id where sd.slot_id = s.id),
                      'cooks', (select coalesce(jsonb_agg(p.display_name), '[]'::jsonb) from public.meal_slot_cooks c join public.profiles p on p.id = c.profile_id where c.slot_id = s.id),
                      'eating', (select coalesce(jsonb_agg(p.display_name), '[]'::jsonb) from public.meal_slot_eaters e join public.profiles p on p.id = e.profile_id where e.slot_id = s.id)
                   ) order by s.date, s.meal), '[]'::jsonb)
                   from public.meal_slots s where s.household_id = me.household_id)
  );
end $$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;
