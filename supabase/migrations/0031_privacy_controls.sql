-- HomeFood · 0031: your data, your account (spec: "Your control")
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Three functions behind the Home tab's "Your data and account" card:
--   export_my_data()            everything about ME as one JSON document (runs with my own rights, so it can only ever contain what I can already see)
--   delete_my_account()         removes my login and my personal rows; my name on the home's past plans and comments becomes "Former member"
--   delete_household(name)      an Admin deletes the whole home and every login that belonged to it, after typing the home's exact name
-- "Sign out on all devices" needs nothing here (the app asks the login service to end every session).
--
-- Delete my account, in detail. REMOVED: my login, my allergies, goals, usuals and extras (the personal food log), my votes, my attendance,
-- my suggestions, my notifications, the Planner turns given to me. KEPT, anonymised: my profile stays as "Former member" with no birth year,
-- sex, activity or photo and no login, because the home's past plans, cooks, eaters and comments point at it and would otherwise lose their
-- history. The last Admin cannot leave: hand the Admin role to someone else first (or delete the household).
-- Delete household. The photos your home uploaded live in the storage bucket, which the database cannot empty; the app removes them first,
-- then calls this. Every login that belonged only to this home is removed too (one login belongs to exactly one home).

-- A removal is allowed to bypass two guards that would otherwise (rightly) stop it: a profile's login being unlinked, and a cuisine still
-- being "in use" while its dishes are deleted in the same sweep. Only these functions set the flag, for the length of their own transaction.
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if current_setting('homefood.removing', true) = 'on' then
    return new;
  end if;
  if new.household_id <> old.household_id then
    raise exception 'A profile cannot move to another household';
  end if;
  if new.user_id is distinct from old.user_id and auth.uid() is not null
     and not (old.user_id is null and new.user_id = auth.uid() and current_setting('homefood.claiming', true) = 'on') then
    raise exception 'Logins are linked only through an invite';
  end if;
  if not public.is_admin() and (new.role <> old.role or new.kind <> old.kind or new.can_login <> old.can_login) then
    raise exception 'Only an Admin can change roles or login rights';
  end if;
  if old.role = 'admin' and new.role <> 'admin'
     and not exists (select 1 from public.profiles p where p.household_id = old.household_id and p.role = 'admin' and p.id <> old.id) then
    raise exception 'A household needs at least one Admin';
  end if;
  return new;
end $$;

create or replace function public.guard_cuisine_in_use() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if current_setting('homefood.removing', true) = 'on' then
    return old;
  end if;
  if exists (select 1 from public.dishes d where d.cuisine_id = old.id) then
    raise exception 'This cuisine still has dishes. Change or remove them first.' using errcode = 'P0001';
  end if;
  return old;
end $$;

-- ── Download my data ──
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

-- ── Delete my account ──
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  me public.profiles;
begin
  if v_uid is null then raise exception 'Sign in first'; end if;
  select * into me from public.profiles where user_id = v_uid;
  if me.id is null then raise exception 'There is no profile for this login'; end if;
  if me.role = 'admin'
     and not exists (select 1 from public.profiles p where p.household_id = me.household_id and p.role = 'admin' and p.id <> me.id and p.user_id is not null) then
    raise exception 'LAST_ADMIN: hand the Admin role to someone else first, or delete the household instead';
  end if;

  perform set_config('homefood.removing', 'on', true);
  delete from public.personal_intake where profile_id = me.id;
  delete from public.personal_usuals where profile_id = me.id;
  delete from public.personal_goals where profile_id = me.id;
  delete from public.profile_allergies where profile_id = me.id;
  delete from public.notifications where profile_id = me.id;
  delete from public.meal_slot_votes where profile_id = me.id;
  delete from public.meal_attendance where profile_id = me.id;
  delete from public.meal_slot_suggestions where profile_id = me.id;
  delete from public.planner_turns where profile_id = me.id;
  update public.profiles
     set display_name = 'Former member', birth_year = null, sex = null, activity = null, photo_path = null, can_login = false, role = 'member'
   where id = me.id;
  delete from auth.users where id = v_uid;   -- the profile's login link is cleared by the foreign key (set null)
end $$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── Delete this household ──
create or replace function public.delete_household(p_confirm_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_home uuid := public.my_household_id();
  v_name text;
  v_logins uuid[];
begin
  if v_home is null or not public.is_admin() then raise exception 'Only an Admin can delete the household'; end if;
  select h.name into v_name from public.households h where h.id = v_home;
  if btrim(coalesce(p_confirm_name, '')) <> v_name then raise exception 'NAME_MISMATCH: type the home''s name exactly to confirm'; end if;
  select coalesce(array_agg(p.user_id), '{}') into v_logins from public.profiles p where p.household_id = v_home and p.user_id is not null;
  perform set_config('homefood.removing', 'on', true);
  delete from public.households where id = v_home;      -- everything that belongs to the home goes with it
  delete from auth.users where id = any (v_logins);
end $$;
revoke execute on function public.delete_household(text) from public, anon;
grant execute on function public.delete_household(text) to authenticated;
