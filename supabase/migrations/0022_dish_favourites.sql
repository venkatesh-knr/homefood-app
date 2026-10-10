-- HomeFood · 0022: favourite dishes
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- A home keeps a list of favourite dishes (shared catalogue dishes or its own). Any member can add or remove one. The app shows
-- favourites first in the Dishes tab and the planner's dish picker, and has a Favourites filter. Reading is limited to the home.

create table public.dish_favourites (
  household_id uuid not null references public.households (id) on delete cascade,
  dish_id      uuid not null references public.dishes (id) on delete cascade,
  created_by   uuid references public.profiles (id) on delete set null default public.my_profile_id(),
  created_at   timestamptz not null default now(),
  primary key (household_id, dish_id)
);

alter table public.dish_favourites enable row level security;

create policy favourites_read on public.dish_favourites for select to authenticated
  using (household_id = public.my_household_id());

create policy favourites_write on public.dish_favourites for all to authenticated
  using (household_id = public.my_household_id())
  with check (
    household_id = public.my_household_id()
    and exists (select 1 from public.dishes d where d.id = dish_id and (d.household_id is null or d.household_id = public.my_household_id()))
  );

grant select, insert, update, delete on public.dish_favourites to authenticated;
