-- HomeFood · 0006: who's eating each meal
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Needed for Step 4 (the week planner): recipe scaling ("Recipe scaled to 5")
-- and the allergy-warning cross-check ("Paati is marked as eating this meal")
-- both need to know who's actually eating a given meal_slot, which nothing
-- in 0001 tracks. Same shape and rules as meal_slot_cooks.

create table public.meal_slot_eaters (
  slot_id    uuid not null references public.meal_slots (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (slot_id, profile_id)
);

alter table public.meal_slot_eaters enable row level security;

create policy eaters_read on public.meal_slot_eaters for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
create policy eaters_write on public.meal_slot_eaters for all to authenticated
  using (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id))
         and public.profile_household(profile_id) = public.slot_household(slot_id))
  with check (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id))
         and public.profile_household(profile_id) = public.slot_household(slot_id));

grant select, insert, update, delete on public.meal_slot_eaters to authenticated;
