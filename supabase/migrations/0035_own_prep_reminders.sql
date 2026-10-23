-- HomeFood · 0035: a home's own prep reminders, and switching the default ones off
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0034). Safe to run twice.
-- Who may change a home's reminders: the Admin, or whoever has an approved Planner turn that covers today (on the home's own clock) —
-- the same rule as planning meals (can_edit_prep). Everyone in the home sees the result.
--   * Own reminders are rows of recipe_prep with no recipe: they belong to a home and a dish (household_id + dish_id). They work exactly
--     like the standard ones: the Today cards, Done, and the 7 pm reminder to the cooks.
--   * Switching a standard reminder off for a home = a row in household_prep_off. It hides that tag for that home only, from Today and
--     from the 7 pm reminder. Switching it on again removes the row.
--   * prep_for_dish now gives, for a home and a dish: the standard tags (or the tags of the home's own recipe version, if it has any),
--     minus the ones the home switched off, plus the home's own reminders for that dish.

-- ── Who may change them ──
create or replace function public.can_edit_prep() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.my_household_id() is not null and public.can_plan(
    public.my_household_id(),
    (now() at time zone (select h.timezone from public.households h where h.id = public.my_household_id()))::date)
$$;
revoke execute on function public.can_edit_prep() from public, anon;
grant execute on function public.can_edit_prep() to authenticated;

-- ── Own reminders live in recipe_prep too (so Done and the 7 pm reminder need no changes) ──
alter table public.recipe_prep alter column recipe_id drop not null;
alter table public.recipe_prep add column if not exists household_id uuid references public.households (id) on delete cascade;
alter table public.recipe_prep add column if not exists dish_id uuid references public.dishes (id) on delete cascade;
alter table public.recipe_prep add column if not exists created_by uuid references public.profiles (id) on delete set null;
alter table public.recipe_prep add column if not exists created_at timestamptz not null default now();
alter table public.recipe_prep drop constraint if exists recipe_prep_owner_check;
alter table public.recipe_prep add constraint recipe_prep_owner_check
  check ((recipe_id is not null and household_id is null and dish_id is null) or (recipe_id is null and household_id is not null and dish_id is not null));
create index if not exists recipe_prep_own_idx on public.recipe_prep (household_id, dish_id) where recipe_id is null;

drop policy if exists recipe_prep_read_own on public.recipe_prep;
create policy recipe_prep_read_own on public.recipe_prep for select to authenticated
  using (recipe_id is null and household_id = public.my_household_id());
drop policy if exists recipe_prep_insert_own on public.recipe_prep;
create policy recipe_prep_insert_own on public.recipe_prep for insert to authenticated
  with check (recipe_id is null and household_id = public.my_household_id() and created_by = public.my_profile_id() and public.can_edit_prep());
drop policy if exists recipe_prep_update_own on public.recipe_prep;
create policy recipe_prep_update_own on public.recipe_prep for update to authenticated
  using (recipe_id is null and household_id = public.my_household_id() and public.can_edit_prep())
  with check (recipe_id is null and household_id = public.my_household_id());
drop policy if exists recipe_prep_delete_own on public.recipe_prep;
create policy recipe_prep_delete_own on public.recipe_prep for delete to authenticated
  using (recipe_id is null and household_id = public.my_household_id() and public.can_edit_prep());

-- ── Switching a standard reminder off for a home ──
create table if not exists public.household_prep_off (
  household_id uuid not null references public.households (id) on delete cascade,
  prep_id      uuid not null references public.recipe_prep (id) on delete cascade,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  primary key (household_id, prep_id)
);
alter table public.household_prep_off enable row level security;
drop policy if exists prep_off_read on public.household_prep_off;
create policy prep_off_read on public.household_prep_off for select to authenticated using (household_id = public.my_household_id());
drop policy if exists prep_off_insert on public.household_prep_off;
create policy prep_off_insert on public.household_prep_off for insert to authenticated
  with check (household_id = public.my_household_id() and created_by = public.my_profile_id() and public.can_edit_prep()
              and exists (select 1 from public.recipe_prep p join public.recipes r on r.id = p.recipe_id where p.id = prep_id and r.household_id is null));
drop policy if exists prep_off_delete on public.household_prep_off;
create policy prep_off_delete on public.household_prep_off for delete to authenticated using (household_id = public.my_household_id() and public.can_edit_prep());
grant select, insert, delete on public.household_prep_off to authenticated;

-- ── The tags that apply to a dish for a home ──
create or replace function public.prep_for_dish(p_dish uuid, p_household uuid) returns setof public.recipe_prep
language sql stable security definer set search_path = '' as $$
  select rp.* from public.recipe_prep rp
  where rp.recipe_id = coalesce(
      (select r.id from public.recipes r where r.dish_id = p_dish and r.household_id = p_household
          and exists (select 1 from public.recipe_prep x where x.recipe_id = r.id)),
      (select r.id from public.recipes r where r.dish_id = p_dish and r.household_id is null))
    and not exists (select 1 from public.household_prep_off o where o.household_id = p_household and o.prep_id = rp.id)
  union all
  select rp.* from public.recipe_prep rp where rp.recipe_id is null and rp.household_id = p_household and rp.dish_id = p_dish
$$;
revoke execute on function public.prep_for_dish(uuid, uuid) from public, anon, authenticated;
