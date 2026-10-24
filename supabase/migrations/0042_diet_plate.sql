-- HomeFood · 0042: the diet plate
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0041). Safe to run twice.
-- When the family meal does not suit someone's diet plan, the Planner adds a DIET PLATE for those people in that meal: its own main dish, up to
-- two of its own sides, and any of the family meal's sides that are shared (they sit on both plates). The family meal is then cooked for the others;
-- the plate counts in recipe amounts, shopping, the cook's sheet, allergy checks and each person's nutrition.
--   * A meal has at most two plates. A person is on at most one plate of a meal.
--   * Same rules as the other parts of a meal: everyone in the home reads them, only whoever may plan that day writes them (Admin or the Planner),
--     plate people are family members of the home, plate dishes are ones the home can see.
--   * `plans` says which plans the plate is for (informational: the picker uses it to suggest dishes that fit).

create table if not exists public.meal_slot_plates (
  id           uuid primary key default gen_random_uuid(),
  slot_id      uuid not null references public.meal_slots (id) on delete cascade,
  position     smallint not null check (position between 1 and 2),
  main_dish_id uuid references public.dishes (id) on delete set null,
  plans        text[] not null default '{}',
  shared_sides smallint[] not null default '{}',
  unique (slot_id, position)
);
create table if not exists public.meal_slot_plate_sides (
  plate_id uuid not null references public.meal_slot_plates (id) on delete cascade,
  position smallint not null check (position between 1 and 2),
  dish_id  uuid not null references public.dishes (id) on delete cascade,
  primary key (plate_id, position)
);
create table if not exists public.meal_slot_plate_eaters (
  plate_id   uuid not null references public.meal_slot_plates (id) on delete cascade,
  slot_id    uuid not null references public.meal_slots (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (plate_id, profile_id),
  unique (slot_id, profile_id)
);

create or replace function public.plate_slot(p_plate uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select slot_id from public.meal_slot_plates where id = p_plate
$$;
revoke execute on function public.plate_slot(uuid) from public, anon;
grant execute on function public.plate_slot(uuid) to authenticated;

-- Rules the policies cannot say: dishes the home can see, family members of the home, and the eater's slot is the plate's slot.
create or replace function public.guard_plate_dish() returns trigger
language plpgsql security definer set search_path = '' as $$
declare hh uuid; dish_home uuid; did uuid;
begin
  if tg_table_name = 'meal_slot_plates' then
    hh := public.slot_household(new.slot_id);
    did := new.main_dish_id;
  else
    hh := public.slot_household(public.plate_slot(new.plate_id));
    did := new.dish_id;
  end if;
  if did is not null then
    select household_id into dish_home from public.dishes where id = did;
    if not found or (dish_home is not null and dish_home <> hh) then raise exception 'That dish is not available to this home'; end if;
  end if;
  return new;
end $$;
drop trigger if exists meal_slot_plates_dish_guard on public.meal_slot_plates;
create trigger meal_slot_plates_dish_guard before insert or update on public.meal_slot_plates
  for each row execute function public.guard_plate_dish();
drop trigger if exists meal_slot_plate_sides_dish_guard on public.meal_slot_plate_sides;
create trigger meal_slot_plate_sides_dish_guard before insert or update on public.meal_slot_plate_sides
  for each row execute function public.guard_plate_dish();

create or replace function public.guard_plate_eater() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public.plate_slot(new.plate_id) is distinct from new.slot_id then raise exception 'That plate belongs to another meal'; end if;
  if not exists (select 1 from public.profiles p where p.id = new.profile_id and p.kind = 'family' and p.household_id = public.slot_household(new.slot_id)) then
    raise exception 'Only family members of this home can be on a plate';
  end if;
  return new;
end $$;
drop trigger if exists meal_slot_plate_eaters_guard on public.meal_slot_plate_eaters;
create trigger meal_slot_plate_eaters_guard before insert or update on public.meal_slot_plate_eaters
  for each row execute function public.guard_plate_eater();

alter table public.meal_slot_plates enable row level security;
alter table public.meal_slot_plate_sides enable row level security;
alter table public.meal_slot_plate_eaters enable row level security;

drop policy if exists plates_read on public.meal_slot_plates;
create policy plates_read on public.meal_slot_plates for select to authenticated using (public.slot_household(slot_id) = public.my_household_id());
drop policy if exists plates_write on public.meal_slot_plates;
create policy plates_write on public.meal_slot_plates for all to authenticated
  using (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)))
  with check (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)));

drop policy if exists plate_sides_read on public.meal_slot_plate_sides;
create policy plate_sides_read on public.meal_slot_plate_sides for select to authenticated
  using (public.slot_household(public.plate_slot(plate_id)) = public.my_household_id());
drop policy if exists plate_sides_write on public.meal_slot_plate_sides;
create policy plate_sides_write on public.meal_slot_plate_sides for all to authenticated
  using (public.can_plan(public.slot_household(public.plate_slot(plate_id)), public.slot_date(public.plate_slot(plate_id))))
  with check (public.can_plan(public.slot_household(public.plate_slot(plate_id)), public.slot_date(public.plate_slot(plate_id))));

drop policy if exists plate_eaters_read on public.meal_slot_plate_eaters;
create policy plate_eaters_read on public.meal_slot_plate_eaters for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
drop policy if exists plate_eaters_write on public.meal_slot_plate_eaters;
create policy plate_eaters_write on public.meal_slot_plate_eaters for all to authenticated
  using (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)))
  with check (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)));

grant select, insert, update, delete on public.meal_slot_plates, public.meal_slot_plate_sides, public.meal_slot_plate_eaters to authenticated;
