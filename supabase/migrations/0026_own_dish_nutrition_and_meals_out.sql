-- HomeFood · 0026: nutrition for a home's own dishes, and a quick estimate for meals eaten out
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
--
-- 1. Own dishes. A home's own dish can now carry a per-serving estimate (typed in on Add / Edit dish, always shown as an estimate).
--    Until now only an Admin could write nutrition rows, but any member can add a dish. The rule becomes: for a dish that belongs to
--    your own home, the Admin or the person who added the dish may write its estimate. The shared catalogue's estimates stay read-only
--    (their dishes belong to no home) and nobody can touch another home's.
-- 2. Meals out. A dine-out or order-in meal has no recipe, so My / Family nutrition had to leave it out. The slot editor can now record how
--    big it was (light, normal or heavy) and the nutrition screens add a rough, labelled estimate for it. The column only makes sense for
--    meals that are not cooked at home, and the database enforces that.

drop policy if exists dish_nutrition_write on public.dish_nutrition;
create policy dish_nutrition_write on public.dish_nutrition for all to authenticated
  using (exists (select 1 from public.dishes d
                 where d.id = dish_id and d.household_id = public.my_household_id()
                   and (public.is_admin() or d.created_by = public.my_profile_id())))
  with check (exists (select 1 from public.dishes d
                      where d.id = dish_id and d.household_id = public.my_household_id()
                        and (public.is_admin() or d.created_by = public.my_profile_id())));

alter table public.meal_slots add column if not exists outside_meal_size text;
alter table public.meal_slots drop constraint if exists meal_slots_outside_meal_size_check;
alter table public.meal_slots add constraint meal_slots_outside_meal_size_check
  check (outside_meal_size is null or (outside_meal_size in ('light', 'normal', 'heavy') and source <> 'home'));
