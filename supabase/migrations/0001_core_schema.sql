-- HomeFood · phase 1 core schema
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Every table has row-level security (RLS): a signed-in person can only ever
-- see or change data from their own household.

create extension if not exists pgcrypto;

-- ─────────────────────────────── Types ───────────────────────────────
create type public.member_role    as enum ('admin', 'member');
create type public.profile_kind   as enum ('family', 'helper');
create type public.sex_type       as enum ('female', 'male', 'other');
create type public.activity_level as enum ('light', 'moderate', 'active');
create type public.meal_type      as enum ('breakfast', 'lunch', 'snacks', 'dinner');
create type public.meal_source    as enum ('home', 'dine_out', 'order_in');
create type public.dish_course    as enum ('main', 'side', 'both');
create type public.diet_type      as enum ('veg', 'egg', 'non_veg');
create type public.plan_status    as enum ('draft', 'published');
create type public.slot_status    as enum ('proposed', 'confirmed', 'done');
create type public.turn_scope     as enum ('day', 'week', 'month');
create type public.turn_status    as enum ('requested', 'approved', 'declined');

-- ─────────────────────────────── Tables ──────────────────────────────
create table public.households (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(btrim(name)) between 1 and 60),
  week_start       smallint not null default 1 check (week_start = 1),          -- Monday (decided)
  timezone         text not null default 'Asia/Kolkata',
  default_language text not null default 'en' check (default_language in ('en', 'ta')),
  snacks_enabled   boolean not null default true,
  created_at       timestamptz not null default now()
);

create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  user_id       uuid unique references auth.users (id) on delete set null,   -- one household per login
  display_name  text not null check (char_length(btrim(display_name)) between 1 and 40),
  kind          public.profile_kind not null default 'family',
  role          public.member_role not null default 'member',
  can_login     boolean not null default false,
  birth_year    smallint check (birth_year between 1900 and 2100),
  sex           public.sex_type,                                             -- optional
  activity      public.activity_level,                                       -- optional
  language      text not null default 'en' check (language in ('en', 'ta')),
  photo_path    text,
  created_at    timestamptz not null default now(),
  constraint helper_is_never_admin check (not (kind = 'helper' and role = 'admin')),
  constraint helper_never_logs_in  check (not (kind = 'helper' and can_login)),
  constraint login_needs_permission check (user_id is null or can_login)
);
create index profiles_household_idx on public.profiles (household_id);

create table public.profile_allergies (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  allergen   text not null check (char_length(btrim(allergen)) between 1 and 40),
  primary key (profile_id, allergen)
);

create table public.invites (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  token        text not null unique default encode(gen_random_bytes(18), 'hex'),
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  revoked_at   timestamptz
);
create index invites_household_idx on public.invites (household_id);

create table public.cuisines (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,  -- null = shared catalogue
  parent_id    uuid references public.cuisines (id) on delete set null,
  name         text not null,
  name_ta      text,
  sort_order   integer not null default 100
);

create table public.dishes (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid references public.households (id) on delete cascade, -- null = shared catalogue
  cuisine_id     uuid references public.cuisines (id) on delete set null,
  name           text not null check (char_length(btrim(name)) between 1 and 80),
  meal_types     public.meal_type[] not null default '{}',
  course         public.dish_course not null default 'main',
  diet           public.diet_type not null default 'veg',
  tags           text[] not null default '{}',     -- fried, spicy, sweet, raw_fish …
  allergens      text[] not null default '{}',     -- peanut, tree_nut, milk, egg, wheat, soy …
  prep_minutes   smallint check (prep_minutes between 1 and 600),
  photo_path     text,                             -- storage path or stock image URL
  photo_credit   text,
  recipe_search  text,                             -- words used for YouTube / Instagram search
  where_seen     text,                             -- for dishes snapped outside
  created_by     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);
create index dishes_household_idx on public.dishes (household_id);
create index dishes_cuisine_idx on public.dishes (cuisine_id);

create table public.dish_names (
  dish_id  uuid not null references public.dishes (id) on delete cascade,
  language text not null check (language in ('en', 'ta')),
  name     text not null,
  primary key (dish_id, language)
);

create table public.dish_photo_overrides (
  dish_id      uuid not null references public.dishes (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  photo_path   text not null,
  updated_at   timestamptz not null default now(),
  primary key (dish_id, household_id)
);

create table public.week_plans (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  week_start   date not null check (extract(isodow from week_start) = 1),   -- always a Monday
  status       public.plan_status not null default 'draft',
  published_at timestamptz,
  unique (household_id, week_start)
);

create table public.meal_slots (
  id                    uuid primary key default gen_random_uuid(),
  week_plan_id          uuid not null references public.week_plans (id) on delete cascade,
  household_id          uuid not null references public.households (id) on delete cascade,
  date                  date not null,
  meal                  public.meal_type not null,
  source                public.meal_source not null default 'home',
  place_name            text,
  main_dish_id          uuid references public.dishes (id) on delete set null,
  note                  text check (char_length(note) <= 280),
  status                public.slot_status not null default 'proposed',
  kept_despite_disagree boolean not null default false,
  updated_at            timestamptz not null default now(),
  unique (week_plan_id, date, meal)
);
create index meal_slots_household_date_idx on public.meal_slots (household_id, date);

create table public.meal_slot_sides (
  slot_id  uuid not null references public.meal_slots (id) on delete cascade,
  position smallint not null check (position between 1 and 3),                -- up to 3 sides
  dish_id  uuid not null references public.dishes (id) on delete cascade,
  primary key (slot_id, position)
);

create table public.meal_slot_cooks (
  slot_id    uuid not null references public.meal_slots (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (slot_id, profile_id)
);

create table public.planner_turns (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  scope        public.turn_scope not null,
  start_date   date not null,
  end_date     date not null,
  status       public.turn_status not null default 'approved',
  requested_by uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  check (end_date >= start_date)
);
create index planner_turns_household_idx on public.planner_turns (household_id, start_date);

-- ─────────────────────── Helper functions for rules ───────────────────────
-- SECURITY DEFINER so policies can look up the caller's profile without
-- recursing into the profiles table's own policies.
create or replace function public.my_profile_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.my_household_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select household_id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'admin' from public.profiles where user_id = auth.uid()), false)
$$;

-- Admins can always plan; others only on days covered by an approved turn.
create or replace function public.can_plan(p_household uuid, p_date date) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_household = public.my_household_id()
     and (public.is_admin() or exists (
          select 1 from public.planner_turns t
          where t.household_id = p_household
            and t.profile_id = public.my_profile_id()
            and t.status = 'approved'
            and p_date between t.start_date and t.end_date))
$$;

create or replace function public.can_plan_week(p_household uuid, p_week_start date) returns boolean
language sql stable security definer set search_path = '' as $$
  select bool_or(public.can_plan(p_household, (p_week_start + d)::date))
  from generate_series(0, 6) as d
$$;

create or replace function public.slot_household(p_slot uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select household_id from public.meal_slots where id = p_slot
$$;

create or replace function public.slot_date(p_slot uuid) returns date
language sql stable security definer set search_path = '' as $$
  select date from public.meal_slots where id = p_slot
$$;

create or replace function public.profile_household(p_profile uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select household_id from public.profiles where id = p_profile
$$;

create or replace function public.dish_household(p_dish uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select household_id from public.dishes where id = p_dish
$$;

create or replace function public.dish_creator(p_dish uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select created_by from public.dishes where id = p_dish
$$;

-- ─────────────────────────── Row-level security ───────────────────────────
alter table public.households           enable row level security;
alter table public.profiles             enable row level security;
alter table public.profile_allergies    enable row level security;
alter table public.invites              enable row level security;
alter table public.cuisines             enable row level security;
alter table public.dishes               enable row level security;
alter table public.dish_names           enable row level security;
alter table public.dish_photo_overrides enable row level security;
alter table public.week_plans           enable row level security;
alter table public.meal_slots           enable row level security;
alter table public.meal_slot_sides      enable row level security;
alter table public.meal_slot_cooks      enable row level security;
alter table public.planner_turns        enable row level security;

-- Households: members read their own; Admins edit. Created only via create_household().
create policy households_read   on public.households for select to authenticated using (id = public.my_household_id());
create policy households_admin on public.households for update to authenticated
  using (id = public.my_household_id() and public.is_admin())
  with check (id = public.my_household_id());

-- Profiles: everyone in the household sees the list; Admins manage it;
-- each person may edit their own details (guarded by a trigger below).
create policy profiles_read on public.profiles for select to authenticated using (household_id = public.my_household_id());
create policy profiles_admin_insert on public.profiles for insert to authenticated
  with check (household_id = public.my_household_id() and public.is_admin() and user_id is null);
create policy profiles_admin_update on public.profiles for update to authenticated
  using (household_id = public.my_household_id() and public.is_admin())
  with check (household_id = public.my_household_id());
create policy profiles_self_update on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profiles_admin_delete on public.profiles for delete to authenticated
  using (household_id = public.my_household_id() and public.is_admin() and id <> public.my_profile_id());

-- Allergies: visible to the household (so planners and cooks see warnings);
-- set by an Admin or by the person themself.
create policy allergies_read on public.profile_allergies for select to authenticated
  using (public.profile_household(profile_id) = public.my_household_id());
create policy allergies_write on public.profile_allergies for all to authenticated
  using (public.profile_household(profile_id) = public.my_household_id() and (public.is_admin() or profile_id = public.my_profile_id()))
  with check (public.profile_household(profile_id) = public.my_household_id() and (public.is_admin() or profile_id = public.my_profile_id()));

-- Invites: Admins only. Invitees read an invite through get_invite().
create policy invites_admin on public.invites for all to authenticated
  using (household_id = public.my_household_id() and public.is_admin())
  with check (household_id = public.my_household_id() and public.is_admin());

-- Cuisines and dishes: the shared catalogue plus the household's own.
create policy cuisines_read on public.cuisines for select to authenticated
  using (household_id is null or household_id = public.my_household_id());
create policy cuisines_admin on public.cuisines for all to authenticated
  using (household_id = public.my_household_id() and public.is_admin())
  with check (household_id = public.my_household_id() and public.is_admin());

create policy dishes_read on public.dishes for select to authenticated
  using (household_id is null or household_id = public.my_household_id());
create policy dishes_insert on public.dishes for insert to authenticated
  with check (household_id = public.my_household_id() and created_by = public.my_profile_id());
create policy dishes_update on public.dishes for update to authenticated
  using (household_id = public.my_household_id() and (public.is_admin() or created_by = public.my_profile_id()))
  with check (household_id = public.my_household_id());
create policy dishes_delete on public.dishes for delete to authenticated
  using (household_id = public.my_household_id() and (public.is_admin() or created_by = public.my_profile_id()));

create policy dish_names_read on public.dish_names for select to authenticated
  using (public.dish_household(dish_id) is null or public.dish_household(dish_id) = public.my_household_id());
create policy dish_names_write on public.dish_names for all to authenticated
  using (public.dish_household(dish_id) = public.my_household_id() and (public.is_admin() or public.dish_creator(dish_id) = public.my_profile_id()))
  with check (public.dish_household(dish_id) = public.my_household_id() and (public.is_admin() or public.dish_creator(dish_id) = public.my_profile_id()));

create policy photo_overrides_rw on public.dish_photo_overrides for all to authenticated
  using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

-- Week plans and meals: everyone reads; Admins and the current Planner write.
create policy week_plans_read on public.week_plans for select to authenticated using (household_id = public.my_household_id());
create policy week_plans_insert on public.week_plans for insert to authenticated
  with check (public.can_plan_week(household_id, week_start));
create policy week_plans_update on public.week_plans for update to authenticated
  using (public.can_plan_week(household_id, week_start))
  with check (public.can_plan_week(household_id, week_start));
create policy week_plans_delete on public.week_plans for delete to authenticated
  using (household_id = public.my_household_id() and public.is_admin());

create policy meal_slots_read on public.meal_slots for select to authenticated using (household_id = public.my_household_id());
create policy meal_slots_write on public.meal_slots for all to authenticated
  using (public.can_plan(household_id, date))
  with check (public.can_plan(household_id, date));

create policy sides_read on public.meal_slot_sides for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
create policy sides_write on public.meal_slot_sides for all to authenticated
  using (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)))
  with check (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)));

create policy cooks_read on public.meal_slot_cooks for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
create policy cooks_write on public.meal_slot_cooks for all to authenticated
  using (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id))
         and public.profile_household(profile_id) = public.slot_household(slot_id))
  with check (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id))
         and public.profile_household(profile_id) = public.slot_household(slot_id));

-- Planner turns: everyone sees the rota; Admins assign (member requests arrive in phase 2).
create policy turns_read on public.planner_turns for select to authenticated using (household_id = public.my_household_id());
create policy turns_admin on public.planner_turns for all to authenticated
  using (household_id = public.my_household_id() and public.is_admin())
  with check (household_id = public.my_household_id() and public.is_admin()
              and public.profile_household(profile_id) = household_id);

-- ─────────────────────────── Table privileges ───────────────────────────
-- The project is created with "Automatically expose new tables" turned OFF,
-- so access is granted here explicitly: signed-in users only (never anon),
-- and every row they touch is still filtered by the policies above.
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.households, public.profiles, public.profile_allergies, public.invites,
  public.cuisines, public.dishes, public.dish_names, public.dish_photo_overrides,
  public.week_plans, public.meal_slots, public.meal_slot_sides, public.meal_slot_cooks,
  public.planner_turns
to authenticated;
grant execute on function
  public.my_profile_id(), public.my_household_id(), public.is_admin(),
  public.can_plan(uuid, date), public.can_plan_week(uuid, date),
  public.slot_household(uuid), public.slot_date(uuid), public.profile_household(uuid),
  public.dish_household(uuid), public.dish_creator(uuid)
to authenticated;

-- ─────────────────────────── Integrity guards ───────────────────────────
-- A person editing their own profile may not promote themself, change household
-- or re-link their login; only Admins change roles, kinds and login rights.
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
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
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Meal slots must belong to their week plan's household and fall inside its week.
create or replace function public.guard_meal_slot() returns trigger
language plpgsql security definer set search_path = '' as $$
declare wp record;
begin
  select household_id, week_start into wp from public.week_plans where id = new.week_plan_id;
  if wp.household_id <> new.household_id then raise exception 'Slot and week plan are in different households'; end if;
  if new.date < wp.week_start or new.date > wp.week_start + 6 then raise exception 'Slot date is outside its week'; end if;
  if new.main_dish_id is not null
     and coalesce(public.dish_household(new.main_dish_id), new.household_id) <> new.household_id then
    raise exception 'Dish belongs to another household';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger meal_slots_guard before insert or update on public.meal_slots
  for each row execute function public.guard_meal_slot();

create or replace function public.guard_slot_side() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(public.dish_household(new.dish_id), public.slot_household(new.slot_id)) <> public.slot_household(new.slot_id) then
    raise exception 'Dish belongs to another household';
  end if;
  return new;
end $$;
create trigger meal_slot_sides_guard before insert or update on public.meal_slot_sides
  for each row execute function public.guard_slot_side();

-- ──────────────────────────── App functions (RPC) ────────────────────────────
-- Create a home: the caller becomes its first Admin. One home per login.
create or replace function public.create_household(p_name text, p_display_name text, p_language text default 'en')
returns uuid language plpgsql security definer set search_path = '' as $$
declare hh uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if exists (select 1 from public.profiles where user_id = auth.uid()) then
    raise exception 'You already belong to a home';
  end if;
  insert into public.households (name, default_language)
    values (btrim(p_name), coalesce(p_language, 'en')) returning id into hh;
  insert into public.profiles (household_id, user_id, display_name, role, can_login, language)
    values (hh, auth.uid(), btrim(p_display_name), 'admin', true, coalesce(p_language, 'en'));
  return hh;
end $$;

-- What an invite link shows before joining: home name, who invited, names still free.
create or replace function public.get_invite(p_token text)
returns table (household_name text, invited_by text, claimable jsonb)
language sql stable security definer set search_path = '' as $$
  select h.name,
         (select display_name from public.profiles where id = i.created_by),
         coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.display_name) order by p.created_at)
                   from public.profiles p
                   where p.household_id = i.household_id and p.can_login and p.user_id is null), '[]'::jsonb)
  from public.invites i
  join public.households h on h.id = i.household_id
  where i.token = p_token and i.revoked_at is null and i.expires_at > now()
$$;

-- Join a home through an invite by claiming one of its profiles.
create or replace function public.claim_profile(p_token text, p_profile_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare hh uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if exists (select 1 from public.profiles where user_id = auth.uid()) then
    raise exception 'You already belong to a home';
  end if;
  select household_id into hh from public.invites
    where token = p_token and revoked_at is null and expires_at > now();
  if hh is null then raise exception 'This invite link has expired or was cancelled'; end if;
  perform set_config('homefood.claiming', 'on', true);
  update public.profiles set user_id = auth.uid()
    where id = p_profile_id and household_id = hh and can_login and user_id is null;
  if not found then raise exception 'That name is already taken or cannot log in'; end if;
  return hh;
end $$;

revoke all on function public.create_household(text, text, text) from public, anon;
revoke all on function public.claim_profile(text, uuid) from public, anon;
grant execute on function public.create_household(text, text, text) to authenticated;
grant execute on function public.claim_profile(text, uuid) to authenticated;
grant execute on function public.get_invite(text) to anon, authenticated;
