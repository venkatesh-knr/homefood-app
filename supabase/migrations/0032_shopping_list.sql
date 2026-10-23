-- HomeFood · 0032: the shared shopping list
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- One shopping list per home. Anyone with a login in the home adds, edits, ticks and removes items; only the Admin can clear the
-- whole list (the function below). No prices, no pantry stock, no expiry dates, no ordering, no barcodes.
--   * One row per item NAME per home (case-insensitive), so adding something already there opens it instead of duplicating it.
--   * A ticked item gets bought_at / bought_by and shows under "Bought" for a day; after that the app hides it.
--   * A starred ("Regular") item is never deleted: after its day under "Bought" it just sleeps, and the Regulars button wakes it up
--     again with one tap. "Clear the list" removes everything that is not a regular and puts the regulars to sleep.
--   * Units are only ever g, kg, ml, L, pcs, bunch or pack. The amount may be empty ("salt").

create table if not exists public.shopping_items (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  name          text not null check (char_length(btrim(name)) between 1 and 80),
  name_ta       text check (char_length(btrim(name_ta)) between 1 and 80),
  section       text not null default 'other' check (section in ('veg_fruit', 'grocery', 'dairy_eggs', 'other')),
  amount        numeric(8, 2) check (amount > 0 and amount <= 100000),
  unit          text check (unit in ('g', 'kg', 'ml', 'L', 'pcs', 'bunch', 'pack')),
  note          text check (char_length(note) <= 120),
  source        text not null default 'manual' check (source in ('manual', 'plan', 'regular')),
  source_dishes text[] not null default '{}',      -- dish names behind a "From plan" item
  is_regular    boolean not null default false,
  added_by      uuid references public.profiles (id) on delete set null,
  bought_at     timestamptz,
  bought_by     uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  check (amount is null or unit is not null)
);
create unique index if not exists shopping_items_name_uidx on public.shopping_items (household_id, lower(btrim(name)));
create index if not exists shopping_items_household_idx on public.shopping_items (household_id, bought_at);

-- Rules the policies cannot say: an item never moves to another home, and nobody can tick something "as" someone else.
create or replace function public.guard_shopping_item() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.household_id <> old.household_id then raise exception 'An item cannot move to another home'; end if;
    -- (a person being deleted sets added_by / bought_by to null: that is allowed)
    if new.added_by is not null and new.added_by is distinct from old.added_by then raise exception 'Who added an item cannot be changed'; end if;
    if new.bought_by is not null and new.bought_by is distinct from old.bought_by and new.bought_by <> public.my_profile_id() then
      raise exception 'You can only tick an item as yourself';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists shopping_items_guard on public.shopping_items;
create trigger shopping_items_guard before update on public.shopping_items
  for each row execute function public.guard_shopping_item();

alter table public.shopping_items enable row level security;
drop policy if exists shopping_read on public.shopping_items;
create policy shopping_read on public.shopping_items for select to authenticated using (household_id = public.my_household_id());
drop policy if exists shopping_insert on public.shopping_items;
create policy shopping_insert on public.shopping_items for insert to authenticated
  with check (household_id = public.my_household_id() and added_by = public.my_profile_id()
              and (bought_by is null or bought_by = public.my_profile_id()));
drop policy if exists shopping_update on public.shopping_items;
create policy shopping_update on public.shopping_items for update to authenticated
  using (household_id = public.my_household_id()) with check (household_id = public.my_household_id());
drop policy if exists shopping_delete on public.shopping_items;
create policy shopping_delete on public.shopping_items for delete to authenticated using (household_id = public.my_household_id());
grant select, insert, update, delete on public.shopping_items to authenticated;

-- ── "Clear the list": Admin only ──
create or replace function public.clear_shopping_list() returns integer
language plpgsql security definer set search_path = '' as $$
declare hh uuid := public.my_household_id(); n integer;
begin
  if hh is null or not public.is_admin() then raise exception 'Only an Admin can clear the shopping list'; end if;
  delete from public.shopping_items where household_id = hh and not is_regular;
  get diagnostics n = row_count;
  update public.shopping_items set bought_at = now() - interval '2 days', bought_by = null where household_id = hh and is_regular;
  return n;
end $$;
revoke execute on function public.clear_shopping_list() from public, anon;
grant execute on function public.clear_shopping_list() to authenticated;
