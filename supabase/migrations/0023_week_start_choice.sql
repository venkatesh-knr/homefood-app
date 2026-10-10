-- HomeFood · 0023: a home can choose whether its week starts on Monday or Sunday
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Until now every home planned Monday-to-Sunday weeks (the column was locked to 1). households.week_start may now be 1 (Monday, the
-- default) or 7 (Sunday); the Admin changes it in Home settings. A new week plan must start on the home's chosen day. Meals a home
-- already planned stay exactly where they are: the app now reads meals by date, and a new unique rule makes sure the same date and
-- meal can never be planned twice, even if the home switches in the middle of a week.

alter table public.households drop constraint if exists households_week_start_check;
alter table public.households add constraint households_week_start_check check (week_start in (1, 7));

alter table public.week_plans drop constraint if exists week_plans_week_start_check;
alter table public.week_plans add constraint week_plans_week_start_check check (extract(isodow from week_start) in (1, 7));

create or replace function public.week_plan_starts_on_homes_day() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if extract(isodow from new.week_start) <> (select h.week_start from public.households h where h.id = new.household_id) then
    raise exception 'A week must start on the home''s first day of the week';
  end if;
  return new;
end $$;

drop trigger if exists week_plan_starts_on_homes_day on public.week_plans;
create trigger week_plan_starts_on_homes_day before insert or update of week_start on public.week_plans
  for each row execute function public.week_plan_starts_on_homes_day();

create unique index if not exists meal_slots_household_date_meal_uidx on public.meal_slots (household_id, date, meal);
