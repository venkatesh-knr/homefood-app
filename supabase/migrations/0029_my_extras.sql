-- HomeFood · 0029: "My extras" — a personal food log
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Each person can log what they eat outside the family's planned meals (a banana, an egg, a protein shake, tea with sugar…) so their own
-- nutrition includes it. The rules, in plain words:
--   * What a person logs is PRIVATE to them. Only their own login can read or write it. The one exception: the Admin can read and write for
--     family members who have no login of their own (Paati, a child), because nobody else can do it for them. The helper is never included.
--   * The Admin and the day's Planner can see a person's DAILY TOTALS in Family nutrition, never the items. That goes through one function
--     (family_extras_totals) that returns sums only.
--   * Each logged item keeps a SNAPSHOT of its nutrition, so correcting a food later never changes a past day.
--   * Goals (an optional protein and / or calorie number) are private in the same way. No body weight is stored, and supplements are not a
--     food category (protein powder is a food; tablets are not loggable).
-- This migration is the tables, rules and function. The shared list of everyday foods is added by the next migration (0030).

-- ── Who may touch a person's personal rows ──
-- Their own login; or, for a family member with no login of their own, an Admin of the same home. Never the helper.
create or replace function public.can_manage_personal(p_profile uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_profile
      and p.kind = 'family'
      and (p.user_id = auth.uid()
           or (p.can_login = false and p.household_id = public.my_household_id() and public.is_admin()))
  )
$$;
revoke execute on function public.can_manage_personal(uuid) from public, anon;
grant execute on function public.can_manage_personal(uuid) to authenticated;

create or replace function public.kolkata_today() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'Asia/Kolkata')::date $$;
revoke execute on function public.kolkata_today() from public, anon;
grant execute on function public.kolkata_today() to authenticated;

-- ── Everyday foods (shared, read-only) ──
-- Per-UNIT nutrition: one piece, one glass (200 ml), one cup, one bowl (150 g), one tbsp, one scoop, or 100 g.
create table if not exists public.common_foods (
  id             uuid primary key default gen_random_uuid(),
  name_en        text not null unique check (char_length(btrim(name_en)) between 1 and 80),
  name_ta        text not null check (char_length(btrim(name_ta)) between 1 and 80),
  category       text not null check (category in ('dairy', 'eggs', 'fruit', 'nuts_seeds', 'pulses_sprouts', 'meat_fish', 'drinks', 'snacks_sweets', 'protein')),
  unit           text not null check (unit in ('piece', 'glass', 'cup', 'bowl', 'tbsp', 'scoop', '100g')),
  grams_per_unit numeric(6, 1) not null check (grams_per_unit > 0),
  kcal           numeric(6, 1) not null check (kcal >= 0),
  protein_g      numeric(5, 1) not null check (protein_g >= 0),
  carbs_g        numeric(5, 1) not null check (carbs_g >= 0),
  fat_g          numeric(5, 1) not null check (fat_g >= 0),
  fibre_g        numeric(5, 1) not null check (fibre_g >= 0),
  sugar_g        numeric(5, 1) not null check (sugar_g >= 0),
  sodium_mg      numeric(6, 0) not null check (sodium_mg >= 0),
  source         text not null default 'IFCT 2017 (NIN) and USDA FoodData Central, rounded; an estimate.'
);
alter table public.common_foods enable row level security;
drop policy if exists common_foods_read on public.common_foods;
create policy common_foods_read on public.common_foods for select to authenticated using (true);
grant select on public.common_foods to authenticated;

-- ── A home's own foods ("Something else…") ──
create table if not exists public.custom_foods (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name         text not null check (char_length(btrim(name)) between 1 and 60),
  name_ta      text check (char_length(btrim(name_ta)) between 1 and 60),
  unit         text not null default 'piece' check (unit in ('piece', 'glass', 'cup', 'bowl', 'tbsp', 'scoop', '100g')),
  kcal         numeric(6, 1) check (kcal >= 0),
  protein_g    numeric(5, 1) check (protein_g >= 0),
  carbs_g      numeric(5, 1) check (carbs_g >= 0),
  fat_g        numeric(5, 1) check (fat_g >= 0),
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists custom_foods_household_idx on public.custom_foods (household_id);
alter table public.custom_foods enable row level security;
drop policy if exists custom_foods_read on public.custom_foods;
create policy custom_foods_read on public.custom_foods for select to authenticated using (household_id = public.my_household_id());
drop policy if exists custom_foods_insert on public.custom_foods;
create policy custom_foods_insert on public.custom_foods for insert to authenticated
  with check (household_id = public.my_household_id() and created_by = public.my_profile_id());
drop policy if exists custom_foods_update on public.custom_foods;
create policy custom_foods_update on public.custom_foods for update to authenticated
  using (household_id = public.my_household_id() and (created_by = public.my_profile_id() or public.is_admin()))
  with check (household_id = public.my_household_id());
drop policy if exists custom_foods_delete on public.custom_foods;
create policy custom_foods_delete on public.custom_foods for delete to authenticated
  using (household_id = public.my_household_id() and (created_by = public.my_profile_id() or public.is_admin()));
grant select, insert, update, delete on public.custom_foods to authenticated;

-- ── What a person ate ──
-- One of common_food_id / custom_food_id / dish_id says where it came from (all three empty only if that food was removed later);
-- the name and the nutrition are copied in when it is logged. A null nutrition value means "unknown" (a custom food with no label).
create table if not exists public.personal_intake (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references public.households (id) on delete cascade,
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  eaten_on       date not null,
  eaten_at       time,
  common_food_id uuid references public.common_foods (id) on delete set null,
  custom_food_id uuid references public.custom_foods (id) on delete set null,
  dish_id        uuid references public.dishes (id) on delete set null,
  food_name      text not null check (char_length(btrim(food_name)) between 1 and 80),
  quantity       numeric(7, 2) not null check (quantity > 0 and quantity <= 1000),
  unit           text not null check (unit in ('piece', 'glass', 'cup', 'bowl', 'tbsp', 'scoop', '100g', 'serving')),
  kcal           numeric(7, 1) check (kcal >= 0),
  protein_g      numeric(6, 1) check (protein_g >= 0),
  carbs_g        numeric(6, 1) check (carbs_g >= 0),
  fat_g          numeric(6, 1) check (fat_g >= 0),
  fibre_g        numeric(6, 1) check (fibre_g >= 0),
  sugar_g        numeric(6, 1) check (sugar_g >= 0),
  sodium_mg      numeric(7, 0) check (sodium_mg >= 0),
  created_by     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  check (num_nonnulls(common_food_id, custom_food_id, dish_id) <= 1)
);
create index if not exists personal_intake_profile_day_idx on public.personal_intake (profile_id, eaten_on);
create index if not exists personal_intake_household_day_idx on public.personal_intake (household_id, eaten_on);

-- A new item must say where it came from (exactly one source); only later may the source vanish.
create or replace function public.guard_personal_intake() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and num_nonnulls(new.common_food_id, new.custom_food_id, new.dish_id) <> 1 then
    raise exception 'An item must be one common food, one of the home''s foods or one dish';
  end if;
  if new.household_id <> (select p.household_id from public.profiles p where p.id = new.profile_id) then
    raise exception 'The item and the person must be in the same home';
  end if;
  return new;
end $$;
drop trigger if exists personal_intake_guard on public.personal_intake;
create trigger personal_intake_guard before insert or update on public.personal_intake
  for each row execute function public.guard_personal_intake();

alter table public.personal_intake enable row level security;
drop policy if exists intake_read on public.personal_intake;
create policy intake_read on public.personal_intake for select to authenticated using (public.can_manage_personal(profile_id));
drop policy if exists intake_insert on public.personal_intake;
create policy intake_insert on public.personal_intake for insert to authenticated
  with check (public.can_manage_personal(profile_id) and created_by = public.my_profile_id()
              and eaten_on <= public.kolkata_today() and eaten_on >= public.kolkata_today() - 7);
drop policy if exists intake_update on public.personal_intake;
create policy intake_update on public.personal_intake for update to authenticated
  using (public.can_manage_personal(profile_id))
  with check (public.can_manage_personal(profile_id) and eaten_on <= public.kolkata_today() and eaten_on >= public.kolkata_today() - 7);
drop policy if exists intake_delete on public.personal_intake;
create policy intake_delete on public.personal_intake for delete to authenticated using (public.can_manage_personal(profile_id));
grant select, insert, update, delete on public.personal_intake to authenticated;

-- ── "My usuals": the foods a person starred ──
create table if not exists public.personal_usuals (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references public.households (id) on delete cascade,
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  common_food_id uuid references public.common_foods (id) on delete cascade,
  custom_food_id uuid references public.custom_foods (id) on delete cascade,
  dish_id        uuid references public.dishes (id) on delete cascade,
  created_at     timestamptz not null default now(),
  check (num_nonnulls(common_food_id, custom_food_id, dish_id) = 1)
);
create unique index if not exists personal_usuals_common_uidx on public.personal_usuals (profile_id, common_food_id) where common_food_id is not null;
create unique index if not exists personal_usuals_custom_uidx on public.personal_usuals (profile_id, custom_food_id) where custom_food_id is not null;
create unique index if not exists personal_usuals_dish_uidx on public.personal_usuals (profile_id, dish_id) where dish_id is not null;
alter table public.personal_usuals enable row level security;
drop policy if exists usuals_all on public.personal_usuals;
create policy usuals_all on public.personal_usuals for all to authenticated
  using (public.can_manage_personal(profile_id))
  with check (public.can_manage_personal(profile_id) and household_id = public.profile_household(profile_id));
grant select, insert, update, delete on public.personal_usuals to authenticated;

-- ── Personal goals: an optional daily protein and / or calorie number ──
create table if not exists public.personal_goals (
  profile_id     uuid primary key references public.profiles (id) on delete cascade,
  household_id   uuid not null references public.households (id) on delete cascade,
  protein_goal_g smallint check (protein_goal_g between 10 and 400),
  kcal_goal      smallint check (kcal_goal between 800 and 6000),
  updated_at     timestamptz not null default now()
);
alter table public.personal_goals enable row level security;
drop policy if exists goals_all on public.personal_goals;
create policy goals_all on public.personal_goals for all to authenticated
  using (public.can_manage_personal(profile_id))
  with check (public.can_manage_personal(profile_id) and household_id = public.profile_household(profile_id));
grant select, insert, update, delete on public.personal_goals to authenticated;

-- ── Family nutrition: each person's DAILY TOTALS of extras, never the items ──
-- For an Admin or whoever is the Planner today, for their own home only. Family members only (never the helper).
-- "unknown_items" counts the items with no nutrition entered, so the screen can say they are not counted.
create or replace function public.family_extras_totals(p_from date, p_to date)
returns table (profile_id uuid, eaten_on date, kcal numeric, protein_g numeric, carbs_g numeric, fat_g numeric, fibre_g numeric, sugar_g numeric, sodium_mg numeric, items int, unknown_items int)
language plpgsql stable security definer set search_path = '' as $$
declare v_home uuid := public.my_household_id();
begin
  if v_home is null or not (public.is_admin() or public.can_plan(v_home, public.kolkata_today())) then
    raise exception 'Only an Admin or today''s Planner can see the family''s totals';
  end if;
  if p_to < p_from or p_to - p_from > 400 then
    raise exception 'Choose a period of up to a year';
  end if;
  return query
    select i.profile_id, i.eaten_on,
           coalesce(sum(i.kcal), 0), coalesce(sum(i.protein_g), 0), coalesce(sum(i.carbs_g), 0), coalesce(sum(i.fat_g), 0),
           coalesce(sum(i.fibre_g), 0), coalesce(sum(i.sugar_g), 0), coalesce(sum(i.sodium_mg), 0),
           count(*)::int, (count(*) filter (where i.kcal is null))::int
    from public.personal_intake i
    join public.profiles p on p.id = i.profile_id
    where i.household_id = v_home and p.kind = 'family' and i.eaten_on between p_from and p_to
    group by i.profile_id, i.eaten_on;
end $$;
revoke execute on function public.family_extras_totals(date, date) from public, anon;
grant execute on function public.family_extras_totals(date, date) to authenticated;
