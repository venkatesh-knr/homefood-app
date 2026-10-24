-- HomeFood · 0038: leftovers
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- After a home meal anyone in the home can say "Anything left over?": which dish, how much (a little / some / a lot) and where it is kept
-- (fridge or kept out). The app sets the use-by: cooked food in the fridge until the next day's dinner, kept out until that night's dinner
-- (the home's own clock), stored here as the last good DAY. A leftover can then be used in a later meal as a side marked "leftover"
-- (it is not cooked again, not on the shopping list, counts normally in nutrition, and the cook's sheet says "use leftover X"), or marked gone.
-- Past its use-by day it simply stops showing.
--   * Anyone with a login in the home adds, uses, marks gone or removes a leftover; nothing here is private.
--   * Putting a leftover into a meal is normally the Planner's job (sides are planner-only), but the "use a leftover" function below lets any member
--     add it to an existing HOME meal that has a main dish and a free side spot, never to a past day and never past the leftover's use-by.

create table if not exists public.leftovers (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  dish_id      uuid not null references public.dishes (id) on delete cascade,
  from_slot_id uuid references public.meal_slots (id) on delete set null,
  amount       text not null check (amount in ('little', 'some', 'lot')),
  kept_in      text not null check (kept_in in ('fridge', 'out')),
  cooked_on    date not null,
  use_by       date not null,
  status       text not null default 'active' check (status in ('active', 'used', 'gone')),
  used_slot_id uuid references public.meal_slots (id) on delete set null,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  check (use_by between cooked_on and cooked_on + 1)
);
create index if not exists leftovers_household_idx on public.leftovers (household_id, status, use_by);
-- one record per dish per meal: saving the same meal again changes it instead of duplicating it
create unique index if not exists leftovers_slot_dish_uidx on public.leftovers (from_slot_id, dish_id) where from_slot_id is not null;

-- Rules the policies cannot say: a leftover stays in its home and keeps its dish, and a dish must be one this home can see.
create or replace function public.guard_leftover() returns trigger
language plpgsql security definer set search_path = '' as $$
declare dish_home uuid;
begin
  select household_id into dish_home from public.dishes where id = new.dish_id;
  if not found or (dish_home is not null and dish_home <> new.household_id) then raise exception 'That dish is not available to this home'; end if;
  if new.from_slot_id is not null and public.slot_household(new.from_slot_id) is distinct from new.household_id then raise exception 'That meal belongs to another home'; end if;
  if new.used_slot_id is not null and public.slot_household(new.used_slot_id) is distinct from new.household_id then raise exception 'That meal belongs to another home'; end if;
  if tg_op = 'UPDATE' then
    if new.household_id <> old.household_id then raise exception 'A leftover cannot move to another home'; end if;
    if new.dish_id <> old.dish_id then raise exception 'The dish of a leftover cannot be changed'; end if;
    if new.created_by is not null and new.created_by is distinct from old.created_by then raise exception 'Who added a leftover cannot be changed'; end if;
  end if;
  return new;
end $$;
drop trigger if exists leftovers_guard on public.leftovers;
create trigger leftovers_guard before insert or update on public.leftovers
  for each row execute function public.guard_leftover();

alter table public.leftovers enable row level security;
drop policy if exists leftovers_read on public.leftovers;
create policy leftovers_read on public.leftovers for select to authenticated using (household_id = public.my_household_id());
drop policy if exists leftovers_insert on public.leftovers;
create policy leftovers_insert on public.leftovers for insert to authenticated
  with check (household_id = public.my_household_id() and created_by = public.my_profile_id());
drop policy if exists leftovers_update on public.leftovers;
create policy leftovers_update on public.leftovers for update to authenticated
  using (household_id = public.my_household_id()) with check (household_id = public.my_household_id());
drop policy if exists leftovers_delete on public.leftovers;
create policy leftovers_delete on public.leftovers for delete to authenticated using (household_id = public.my_household_id());
grant select, insert, update, delete on public.leftovers to authenticated;

-- A side of a meal can be a leftover.
alter table public.meal_slot_sides add column if not exists is_leftover boolean not null default false;
alter table public.meal_slot_sides add column if not exists leftover_id uuid references public.leftovers (id) on delete set null;

-- A leftover side can only point at a leftover of the same home as its meal.
create or replace function public.guard_side_leftover() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.leftover_id is not null and not exists (
    select 1 from public.leftovers where id = new.leftover_id and household_id = public.slot_household(new.slot_id)
  ) then raise exception 'That leftover belongs to another home'; end if;
  return new;
end $$;
drop trigger if exists meal_slot_sides_leftover_guard on public.meal_slot_sides;
create trigger meal_slot_sides_leftover_guard before insert or update on public.meal_slot_sides
  for each row execute function public.guard_side_leftover();

-- ── "Use in a meal": any member puts a leftover into an existing home meal ──
create or replace function public.use_leftover(p_leftover uuid, p_slot uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  hh uuid := public.my_household_id();
  l public.leftovers%rowtype;
  s public.meal_slots%rowtype;
  today date;
  pos integer;
begin
  if hh is null then raise exception 'Not signed in to a home'; end if;
  select * into l from public.leftovers where id = p_leftover and household_id = hh for update;
  if not found then raise exception 'No such leftover'; end if;
  if l.status <> 'active' then raise exception 'This leftover is already used or gone'; end if;
  select * into s from public.meal_slots where id = p_slot and household_id = hh;
  if not found then raise exception 'No such meal'; end if;
  if s.source <> 'home' or s.main_dish_id is null then raise exception 'A leftover goes into a meal cooked at home'; end if;
  select (now() at time zone coalesce((select timezone from public.households where id = hh), 'Asia/Kolkata'))::date into today;
  if s.date < today then raise exception 'That meal is in the past'; end if;
  if s.date > l.use_by then raise exception 'This leftover will be past its use-by by then'; end if;
  select min(p) into pos from generate_series(1, 3) p
    where not exists (select 1 from public.meal_slot_sides x where x.slot_id = p_slot and x.position = p);
  if pos is null then raise exception 'This meal already has three sides'; end if;
  insert into public.meal_slot_sides (slot_id, position, dish_id, is_leftover, leftover_id) values (p_slot, pos, l.dish_id, true, l.id);
  update public.leftovers set status = 'used', used_slot_id = p_slot where id = l.id;
end $$;
revoke execute on function public.use_leftover(uuid, uuid) from public, anon;
grant execute on function public.use_leftover(uuid, uuid) to authenticated;
